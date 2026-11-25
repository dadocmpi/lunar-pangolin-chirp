// ============================================================================
// Server-side chat provider abstraction.
//
// Two providers are supported and selected by configuration:
//   * openrouter (default) — OpenAI-compatible API at
//     https://openrouter.ai/api/v1/chat/completions
//   * gemini (optional)    — reuses the existing KYC AI integration family
//     (see ../kyc/aiProvider.ts)
//
// Both follow the same server-only key posture: the key is read from Edge
// Function secrets, sent in a request header (never the URL), never logged, and
// never returned to the browser.
//
// Preferred secret: CHAT_AI_API_KEY. The legacy KYC_AI_API_KEY is a GEMINI key
// and is therefore reused ONLY by the gemini provider — it is never sent to
// OpenRouter. If no usable key is set, `createChatProviderFromEnv` returns null
// and the caller uses the deterministic approved-knowledge fallback. There is
// no path where a missing key produces a fabricated answer.
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
  /** Provider name for logs, e.g. "openrouter". */
  readonly name: string;
  /** Return the model's raw text. Throws on transport/HTTP failure. */
  complete(input: ChatProviderInput): Promise<string>;
}

export interface ChatEnv {
  CHAT_AI_API_KEY?: string;
  CHAT_AI_MODEL?: string;
  CHAT_AI_PROVIDER?: string;
  /** Existing Gemini key, reused by the gemini provider only. */
  KYC_AI_API_KEY?: string;
}

export const DEFAULT_CHAT_PROVIDER = "openrouter";

export const DEFAULT_CHAT_MODELS: Record<string, string> = {
  openrouter: "openrouter/free",
  gemini: "gemini-2.0-flash",
};

export const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/** Optional attribution headers OpenRouter recommends. Not secrets. */
export const OPENROUTER_ATTRIBUTION = {
  "HTTP-Referer": "https://braxelmarkets.vercel.app",
  "X-OpenRouter-Title": "Braxel Markets",
} as const;

/**
 * A provider failure with a stable, safe code. The message is the code only:
 * never a response body, a header, a key or a URL with credentials in it.
 */
export class ChatProviderError extends Error {
  readonly code: string;
  readonly status: number | null;

  constructor(code: string, status: number | null = null) {
    super(code);
    this.name = "ChatProviderError";
    this.code = code;
    this.status = status;
  }
}

export function mapHttpStatusToCode(status: number): string {
  if (status === 401 || status === 403) return "ai_provider_unauthorized";
  if (status === 429) return "ai_provider_rate_limited";
  return `ai_provider_http_${status}`;
}

/** True for any abort/timeout, whether raised by us or by the runtime. */
export function isChatProviderTimeout(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: unknown }).name;
  const code = (error as { code?: unknown }).code;
  return name === "AbortError" || code === "ai_provider_timeout";
}

// ---------------------------------------------------------------------------
// OpenRouter (OpenAI-compatible chat completions)
// ---------------------------------------------------------------------------

export interface OpenRouterChatOptions {
  apiKey: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

type OpenAiMessage = { role: "system" | "user" | "assistant"; content: string };

/** Pull the first assistant message out of an OpenAI-compatible response. */
export function extractOpenRouterText(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) return "";
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return "";
  const message = (choices[0] as { message?: unknown })?.message;
  const content = (message as { content?: unknown })?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    const chunks: string[] = [];
    for (const part of content) {
      const text = (part as { text?: unknown })?.text;
      if (typeof text === "string") chunks.push(text);
    }
    return chunks.join("").trim();
  }
  return "";
}

export function createOpenRouterChatProvider(opts: OpenRouterChatOptions): ChatProvider {
  const model = opts.model?.trim() || DEFAULT_CHAT_MODELS.openrouter;
  const doFetch = opts.fetchImpl ?? fetch;
  return {
    name: "openrouter",
    async complete(input: ChatProviderInput): Promise<string> {
      const messages: OpenAiMessage[] = [
        { role: "system", content: input.system },
        ...input.messages.map((turn) => ({
          role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: turn.content,
        })),
      ];
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), Math.max(1000, input.timeoutMs));
      let res: Response;
      try {
        res = await doFetch(OPENROUTER_ENDPOINT, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            // Key in a header, never the URL, so it cannot leak via access logs.
            Authorization: `Bearer ${opts.apiKey}`,
            ...OPENROUTER_ATTRIBUTION,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            stream: false,
          }),
        });
      } catch (e) {
        // No response body, no request details, no key in the error.
        throw isChatProviderTimeout(e)
          ? new ChatProviderError("ai_provider_timeout")
          : new ChatProviderError("ai_provider_network");
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) {
        throw new ChatProviderError(mapHttpStatusToCode(res.status), res.status);
      }
      return extractOpenRouterText(await res.json());
    },
  };
}

// ---------------------------------------------------------------------------
// Gemini (optional provider)
// ---------------------------------------------------------------------------

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
  const model = opts.model?.trim() || DEFAULT_CHAT_MODELS.gemini;
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
      let res: Response;
      try {
        res = await doFetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
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
          },
        );
      } catch (e) {
        throw isChatProviderTimeout(e)
          ? new ChatProviderError("ai_provider_timeout")
          : new ChatProviderError("ai_provider_network");
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) {
        // Deliberately no response body / key in the error.
        throw new ChatProviderError(mapHttpStatusToCode(res.status), res.status);
      }
      return extractGeminiText(await res.json());
    },
  };
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

export type ChatProviderFactory = (
  env: ChatEnv,
  fetchImpl?: typeof fetch,
) => ChatProvider;

/** Add a vendor here; `createChatProviderFromEnv` needs no change. */
export const CHAT_PROVIDER_REGISTRY: Record<string, ChatProviderFactory> = {
  openrouter: (env, fetchImpl) =>
    createOpenRouterChatProvider({
      apiKey: resolveChatApiKey(env, "openrouter"),
      model: env.CHAT_AI_MODEL,
      fetchImpl,
    }),
  gemini: (env, fetchImpl) =>
    createGeminiChatProvider({
      apiKey: resolveChatApiKey(env, "gemini"),
      model: env.CHAT_AI_MODEL,
      fetchImpl,
    }),
};

export function registerChatProvider(name: string, factory: ChatProviderFactory): void {
  CHAT_PROVIDER_REGISTRY[name] = factory;
}

/**
 * Which provider the configuration selects.
 *   1. an explicit CHAT_AI_PROVIDER always wins;
 *   2. otherwise a CHAT_AI_API_KEY implies openrouter;
 *   3. otherwise a legacy KYC_AI_API_KEY keeps the old gemini behaviour;
 *   4. otherwise the documented default (openrouter, no key => fallback).
 */
export function resolveChatProviderName(env: ChatEnv): string {
  const explicit = (env.CHAT_AI_PROVIDER ?? "").trim().toLowerCase();
  if (explicit) return explicit;
  if ((env.CHAT_AI_API_KEY ?? "").trim()) return "openrouter";
  if ((env.KYC_AI_API_KEY ?? "").trim()) return "gemini";
  return DEFAULT_CHAT_PROVIDER;
}

/**
 * Resolve the key for a provider. CHAT_AI_API_KEY is the only key an
 * OpenRouter provider will ever use; KYC_AI_API_KEY is a Gemini key and must
 * not be sent to another vendor.
 */
export function resolveChatApiKey(env: ChatEnv, providerName?: string): string {
  const primary = (env.CHAT_AI_API_KEY ?? "").trim();
  if (primary) return primary;
  const name = (providerName ?? resolveChatProviderName(env)).trim().toLowerCase();
  return name === "gemini" ? (env.KYC_AI_API_KEY ?? "").trim() : "";
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
  const name = resolveChatProviderName(env);
  const factory = CHAT_PROVIDER_REGISTRY[name];
  if (!factory) return null;
  if (!resolveChatApiKey(env, name)) return null;
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
