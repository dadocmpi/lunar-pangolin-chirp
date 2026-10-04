// ============================================================================
// AI KYC decision — PURE, no I/O, no network, no secrets.
//
// The AI model returns a strict JSON document. This module validates it and
// decides, failing CLOSED in every ambiguous case:
//   * malformed / unparseable / incomplete output -> manual_review
//   * contradictory output (approve while a check failed) -> manual_review
//   * any check below the confidence floor -> manual_review
//   * only an explicit, complete, high-confidence pass may auto-approve
//
// The model checks CONSISTENCY (does the name match, are dates plausible, is
// the doc readable), never authenticity. Anything it cannot read or prove
// goes to a human. Unit-tested directly.
// ============================================================================

export type AiDecision = "approved" | "manual_review" | "rejected";

export const AI_CHECK_KEYS = [
  "name_match",
  "not_expired",
  "age_18",
  "document_type",
  "readable",
] as const;

export type AiCheckKey = typeof AI_CHECK_KEYS[number];

export interface AiCheckResult {
  pass: boolean;
  confidence: number;
  reason: string;
}

export interface NormalizedAiOutput {
  decision: AiDecision;
  confidence: number;
  checks: Partial<Record<AiCheckKey, AiCheckResult>>;
  reason: string;
  /** True when the raw model output was not the expected shape. */
  malformed: boolean;
}

export interface AiDecisionOptions {
  /** Auto-approval floor for the overall score and for every check. */
  minConfidence?: number;
  /** Forced-override for high-value withdrawals (set by the caller). */
  forceManualReview?: boolean;
}

const DEFAULT_MIN_CONFIDENCE = 0.8;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function clamp01(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 1) return null;
  return n;
}

/**
 * Parse the raw model output into a normalized decision. A value of `null`
 * (or anything not matching the schema) yields `malformed: true` and a
 * `manual_review` decision.
 */
export function normalizeAiOutput(raw: unknown): NormalizedAiOutput {
  const malformed: NormalizedAiOutput = {
    decision: "manual_review",
    confidence: 0,
    checks: {},
    reason: "ai_output_unrecognized",
    malformed: true,
  };
  if (!isObject(raw)) return malformed;

  const decision = raw.decision;
  if (decision !== "approved" && decision !== "manual_review" && decision !== "rejected") {
    return malformed;
  }
  const confidence = clamp01(raw.confidence);
  if (confidence === null) return malformed;

  const checksRaw = raw.checks;
  if (!isObject(checksRaw)) return malformed;

  const checks: Partial<Record<AiCheckKey, AiCheckResult>> = {};
  for (const key of AI_CHECK_KEYS) {
    const c = checksRaw[key];
    if (!isObject(c)) return { ...malformed, reason: `ai_check_missing:${key}` };
    const pass = c.pass;
    const conf = clamp01(c.confidence);
    if (typeof pass !== "boolean" || conf === null) {
      return { ...malformed, reason: `ai_check_invalid:${key}` };
    }
    checks[key] = {
      pass,
      confidence: conf,
      reason: typeof c.reason === "string" ? c.reason.slice(0, 300) : "",
    };
  }

  return {
    decision,
    confidence,
    checks,
    reason: typeof raw.reason === "string" ? raw.reason.slice(0, 300) : "",
    malformed: false,
  };
}

/**
 * Decide the final action from a model response. Fails closed: only a complete,
 * internally consistent, high-confidence approval is auto-approved.
 */
export function decideFromAiOutput(
  raw: unknown,
  opts: AiDecisionOptions = {},
): NormalizedAiOutput {
  const min = opts.minConfidence ?? DEFAULT_MIN_CONFIDENCE;
  const parsed = normalizeAiOutput(raw);

  if (parsed.malformed) return parsed;
  if (opts.forceManualReview) {
    return { ...parsed, decision: "manual_review", reason: parsed.reason || "forced_manual_review" };
  }

  const failed = AI_CHECK_KEYS.filter((k) => parsed.checks[k]!.pass === false);
  const belowFloor = AI_CHECK_KEYS.filter((k) => parsed.checks[k]!.confidence < min);

  if (parsed.decision === "rejected") {
    // Honor an explicit rejection only when it is internally consistent:
    // at least one check failed and the rejection is not a low-confidence
    // guess. Otherwise a human decides.
    if (failed.length > 0 && parsed.confidence >= min) return parsed;
    return { ...parsed, decision: "manual_review", reason: parsed.reason || "low_confidence_rejection" };
  }

  if (parsed.decision === "manual_review") return parsed;

  // decision === "approved": require a clean sweep at high confidence.
  if (failed.length > 0 || belowFloor.length > 0 || parsed.confidence < min) {
    return { ...parsed, decision: "manual_review", reason: parsed.reason || "approval_below_confidence_floor" };
  }
  return parsed;
}

/**
 * The JSON contract sent to the model. Kept here so the prompt and the parser
 * cannot drift apart.
 */
export const AI_RESPONSE_SCHEMA = {
  name: "kyc_check",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["decision", "confidence", "checks", "reason"],
    properties: {
      decision: { type: "string", enum: ["approved", "manual_review", "rejected"] },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      reason: { type: "string" },
      checks: {
        type: "object",
        additionalProperties: false,
        required: [...AI_CHECK_KEYS],
        properties: Object.fromEntries(
          AI_CHECK_KEYS.map((k) => [
            k,
            {
              type: "object",
              additionalProperties: false,
              required: ["pass", "confidence", "reason"],
              properties: {
                pass: { type: "boolean" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                reason: { type: "string" },
              },
            },
          ]),
        ),
      },
    },
  },
} as const;
