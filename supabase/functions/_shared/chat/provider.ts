// ============================================================================
// Server-side chat provider abstraction.
//
// This reuses the SAME provider family as the existing KYC AI integration
// (Gemini, see ../kyc/aiProvider.ts) and the same server-only key posture: the
// key is read from Edge Function secrets, sent in a request header (never the
// URL), never logged, and never returned to the browser.
//
// Preferred secret: CHAT_AI_API_KEY. When it is unset the existing
// KYC_AI_API_KEY is reused so one Gemini key can serve both features. If
// neither is set, `createChatProviderFromEnv` returns null and the caller uses
// the deterministic approved-knowledge fallback. There is no path where a
// missing key produces a fabricated answer.
//
// NEVER add a VITE_* AI key. Vite inlines VITE_* values into the browser
// bundle; an AI key there would be public.
// ============================================================================

import type { ChatTurn } from "./types.ts";

export interface ChatProviderInput {
  system: string;
  messages: ChatTurn[];
  timeoutMs: number;
}

export interface ChatProvider {
  /** Provider name for logs, e.g. "gemini". */
  readonly name: string;
  /** Return the model's raw text. Throws on transport/HTTP failure. */
  complete(input: ChatProviderInput): Promise<string>;
}

export interface ChatEnv {
  CHAT_AI_API_KEY?: string;
  CHAT_AI_MODEL?: string;
  CHAT_AI_PROVIDER?: string;
  /** Existing Gemini key, reused when CHAT_AI_API_KEY is unset. */
  KYC_AI_API_KEY?: string;
}

export interface GeminiChatOptions {
  apiKey: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

type Content = { role: "user" | "model"; parts: Array<{ text: string }> };

/** Pull the first text part out of a Gemini generateContent response. */
export function extractGeminiText(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) return "";
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return "";
  const content = (candidates[0] as { content?: unknown })?.content;
  const parts = (content as { parts?: unknown })?.parts;
  if (!Array.isArray(parts)) return "";
  const chunks: string[] = [];
  for (const part of parts) {
    const text = (part as { text?: unknown })?.text;
    if (typeof text === "string") chunks.push(text);
  }
  return chunks.join("").trim();
}

export function createGeminiChatProvider(opts: GeminiChatOptions): ChatProvider {
  const model = opts.model ?? "gemini-2.0-flash";
  const doFetch = opts.fetchImpl ?? fetch;
  return {
    name: "gemini",
    async complete(input: ChatProviderInput): Promise<string> {
      const contents: Content[] = input.messages.map((turn) => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.content }],
      }));
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.max(1000, input.timeoutMs));
      try {
        const url =
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const res = await doFetch(url, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            // Key in a header, never the URL, so it cannot leak via access logs.
            "x-goog-api-key": opts.apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: input.system }] },
            contents,
            generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
          }),
        });
        if (!res.ok) {
          // Deliberately no response body / key in the error.
          throw new Error(`ai_provider_http_${res.status}`);
        }
        return extractGeminiText(await res.json());
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export type ChatProviderFactory = (
  env: ChatEnv,
  fetchImpl?: typeof fetch,
) => ChatProvider;

/** Add a vendor here; `createChatProviderFromEnv` needs no change. */
export const CHAT_PROVIDER_REGISTRY: Record<string, ChatProviderFactory> = {
  gemini: (env, fetchImpl) =>
    createGeminiChatProvider({
      apiKey: env.CHAT_AI_API_KEY ?? env.KYC_AI_API_KEY ?? "",
      model: env.CHAT_AI_MODEL,
      fetchImpl,
    }),
};

export function registerChatProvider(name: string, factory: ChatProviderFactory): void {
  CHAT_PROVIDER_REGISTRY[name] = factory;
}

/** Resolve the key with the documented fallback. */
export function resolveChatApiKey(env: ChatEnv): string {
  return (env.CHAT_AI_API_KEY ?? "").trim() || (env.KYC_AI_API_KEY ?? "").trim();
}

/**
 * Build the provider from the environment. Returns null when no key is
 * configured or the requested provider is unknown; the caller then uses the
 * approved-knowledge fallback.
 */
export function createChatProviderFromEnv(
  env: ChatEnv,
  fetchImpl?: typeof fetch,
): ChatProvider | null {
  if (!resolveChatApiKey(env)) return null;
  const name = (env.CHAT_AI_PROVIDER ?? "gemini").toLowerCase();
  const factory = CHAT_PROVIDER_REGISTRY[name];
  if (!factory) return null;
  return factory(env, fetchImpl);
}

/**
 * Operator data-flow note:
 *   SENT to the provider: the recent conversation turns and the approved
 *     knowledge/policy prompt. No user id, email, password, token or other
 *     account data is sent.
 *   NEVER sent: passwords, card numbers, Tradovate credentials, API keys,
 *     MFA codes, private keys, service-role keys.
 *   LOGGED by us: counts, reply type and provider name only. Message content is
 *     not logged or stored.
 */
export const CHAT_DATA_FLOW = {
  sent: ["recent conversation turns", "approved knowledge prompt", "locale"],
  notSent: [
    "user id",
    "email",
    "password",
    "card number",
    "tradovate credentials",
    "api keys",
    "mfa codes",
    "private keys",
    "service-role key",
  ],
  logged: ["reply type", "provider name", "rate-limit outcome"],
  neverLogged: ["message content", "conversation history", "api key", "raw model output"],
} as const;
