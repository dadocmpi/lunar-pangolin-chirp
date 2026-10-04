// ============================================================================
// AI KYC provider client.
//
// One place that talks to the vision model. `fetchImpl` is injectable so the
// provider can be unit-tested without network access. The API key is read from
// the Edge Function secrets and is NEVER logged, echoed, or included in an
// error message.
//
// The provider returns the model's raw JSON. It is deliberately allowed to
// return `null` (or throw) on any failure: the caller treats a null/throw as
// "could not verify" and routes the submission to manual review. There is no
// path where a provider failure auto-approves.
// ============================================================================

export interface AiImage {
  /** image/jpeg | image/png | image/webp */
  mime: string;
  base64: string;
}

export interface AiAnalyzeInput {
  front: AiImage;
  back?: AiImage;
  selfie?: AiImage;
  /** Name the user declared, if any, to check against the document. */
  declaredName?: string;
  /** ISO timestamp the check runs at (for expiry/age reasoning). */
  nowIso: string;
}

export interface AiProvider {
  /** Provider name for audit records, e.g. "gemini" or "stub". */
  readonly name: string;
  /**
   * Return the model's raw parsed JSON, or null when the model did not return
   * parseable JSON. Throwing is also permitted; callers fail closed.
   */
  analyze(input: AiAnalyzeInput): Promise<unknown>;
}

export interface GeminiOptions {
  apiKey: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

/** Instruct the model to answer in the exact JSON contract the parser expects. */
export function buildKycPrompt(input: AiAnalyzeInput): string {
  const declared = input.declaredName?.trim()
    ? `The user declared their name as: "${input.declaredName.trim()}".`
    : "No declared name was provided; if you cannot establish a name match, do not pass name_match.";
  return [
    "You are an identity-document CONSISTENCY checker for a trading platform.",
    "You are NOT an authenticity expert. Judge only what is legible and internally consistent.",
    "Check: (1) name_match: the name on the ID matches the declared name and is legible;",
    "(2) not_expired: the document expiry date is in the future;",
    "(3) age_18: the date of birth shows the person is at least 18;",
    "(4) document_type: the image is a real government ID of the expected kind;",
    "(5) readable: the document is legible and unaltered-looking; if there is a selfie, that the face matches the ID photo.",
    declared,
    `Today is ${input.nowIso}.`,
    "If anything is unreadable, ambiguous, contradictory or you are unsure, set that check pass=false",
    "and lower its confidence, and use decision=manual_review. Only use decision=approved when every",
    "check clearly passes with high confidence. Use decision=rejected only for a clear, confident mismatch.",
    'Respond with ONLY JSON: {"decision":"approved|manual_review|rejected","confidence":0..1,',
    '"reason":"...","checks":{"name_match":{"pass":true,"confidence":0..1,"reason":"..."},',
    '"not_expired":{...},"age_18":{...},"document_type":{...},"readable":{...}}}',
  ].join(" ");
}

/**
 * Extract the model's text from a Gemini generateContent response, then parse
 * it as JSON. Returns null when no text part or no parseable JSON is present.
 * Never logs the API key or the request body.
 */
export function extractGeminiJson(payload: unknown): unknown {
  if (typeof payload !== "object" || payload === null) return null;
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const content = (candidates[0] as { content?: unknown })?.content;
  const parts = (content as { parts?: unknown })?.parts;
  if (!Array.isArray(parts)) return null;
  for (const part of parts) {
    const text = (part as { text?: unknown })?.text;
    if (typeof text !== "string") continue;
    const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) continue;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
}

/** Build a Gemini-backed provider. The key stays inside this closure. */
export function createGeminiProvider(opts: GeminiOptions): AiProvider {
  const model = opts.model ?? "gemini-2.0-flash";
  const doFetch = opts.fetchImpl ?? fetch;
  return {
    name: "gemini",
    async analyze(input: AiAnalyzeInput): Promise<unknown> {
      const parts: ContentPart[] = [{ text: buildKycPrompt(input) }];
      parts.push({ inlineData: { mimeType: input.front.mime, data: input.front.base64 } });
      if (input.back) parts.push({ inlineData: { mimeType: input.back.mime, data: input.back.base64 } });
      if (input.selfie) parts.push({ inlineData: { mimeType: input.selfie.mime, data: input.selfie.base64 } });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await doFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Key in a header, never the URL, so it cannot leak via access logs.
          "x-goog-api-key": opts.apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { temperature: 0, responseMimeType: "application/json" },
        }),
      });
      if (!res.ok) {
        // Deliberately no response body / key in the error.
        throw new Error(`ai_provider_http_${res.status}`);
      }
      const json = await res.json();
      return extractGeminiJson(json);
    },
  };
}

export interface AiEnv {
  KYC_AI_API_KEY?: string;
  KYC_AI_MODEL?: string;
}

/**
 * Build the provider from the Edge Function environment. Returns null when no
 * key is configured — the caller must then route to manual review, never
 * auto-approve.
 */
export function createAiProviderFromEnv(
  env: AiEnv,
  fetchImpl?: typeof fetch,
): AiProvider | null {
  const apiKey = env.KYC_AI_API_KEY;
  if (!apiKey) return null;
  return createGeminiProvider({ apiKey, model: env.KYC_AI_MODEL, fetchImpl });
}
