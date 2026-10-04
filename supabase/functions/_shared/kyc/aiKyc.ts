// ============================================================================
// AI KYC orchestration — pure control flow over an injectable provider.
//
// Guarantees, regardless of provider behavior:
//   * provider missing / throws / returns null / returns junk -> manual_review
//   * a high-value or operator-forced check            -> manual_review
//   * only a clean, high-confidence approval auto-approves
// No network or secrets here; the provider does the I/O.
// ============================================================================

import {
  type AiDecision,
  type AiDecisionOptions,
  decideFromAiOutput,
  type NormalizedAiOutput,
} from "./aiDecision.ts";
import type { AiAnalyzeInput, AiProvider } from "./aiProvider.ts";

export interface RunAiCheckResult extends NormalizedAiOutput {
  /** Model/provider that produced the result, for the audit record. */
  provider: string;
  /** True when the provider was unavailable (no key configured, network error). */
  providerUnavailable: boolean;
}

const FALLBACK = (reason: string, provider: string, unavailable: boolean): RunAiCheckResult => ({
  decision: "manual_review",
  confidence: 0,
  checks: {},
  reason,
  malformed: true,
  provider,
  providerUnavailable: unavailable,
});

/**
 * Run the AI check. This is total: it never throws and never auto-approves on
 * a provider failure. `provider === null` means "AI not configured".
 */
export async function runAiCheck(
  provider: AiProvider | null,
  input: AiAnalyzeInput,
  opts: AiDecisionOptions = {},
): Promise<RunAiCheckResult> {
  if (!provider) return FALLBACK("ai_not_configured", "none", true);

  let raw: unknown;
  try {
    raw = await provider.analyze(input);
  } catch (e) {
    // e.message must not contain secrets; providers are written to comply.
    const msg = e instanceof Error ? e.message : "ai_provider_error";
    return FALLBACK(`ai_provider_error:${msg.slice(0, 120)}`, provider.name, true);
  }
  if (raw === null || raw === undefined) {
    return FALLBACK("ai_empty_response", provider.name, true);
  }

  const decided = decideFromAiOutput(raw, opts);
  return { ...decided, provider: provider.name, providerUnavailable: false };
}

export type { AiDecision };
