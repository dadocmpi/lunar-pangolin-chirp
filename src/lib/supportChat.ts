// ============================================================================
// Browser client for the AI support chatbot.
//
// The AI provider key lives ONLY in Supabase Edge Function secrets. This module
// sends the conversation to the `support-chat` function and never sees a key.
// Conversations are kept in React state by the caller; nothing is written to
// localStorage, sessionStorage, cookies or the server.
// ============================================================================

import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const CLIENT_TIMEOUT_MS = 25_000;

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type ChatReplyType =
  | "answered"
  | "unknown"
  | "escalated"
  | "refused"
  | "timeout"
  | "error";

export type ChatRefusalReason = "advice" | "secret" | "injection" | "promise";

export interface ChatSource {
  title: string;
  url: string;
}

export interface ChatEscalation {
  required: boolean;
  category: string | null;
  email: string;
}

export interface ChatReply {
  type: ChatReplyType;
  reply: string;
  reason?: ChatRefusalReason;
  sources: ChatSource[];
  escalation: ChatEscalation | null;
  disclaimer?: string;
  locale?: string;
}

export type ChatSendError =
  | "not_configured"
  | "rate_limited"
  | "disabled"
  | "timeout"
  | "unavailable"
  | "invalid_message";

export type ChatSendResult =
  | { ok: true; reply: ChatReply }
  | { ok: false; error: ChatSendError };

const TYPES: ChatReplyType[] = [
  "answered", "unknown", "escalated", "refused", "timeout", "error",
];
const REASONS: ChatRefusalReason[] = ["advice", "secret", "injection", "promise"];

function safeHttpUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? raw : null;
  } catch {
    return null;
  }
}

function safeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  return /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/.test(value) ? value : null;
}

/**
 * Validate and normalise a server payload. FAIL-CLOSED: an unexpected shape
 * becomes a safe "unknown" reply rather than rendering unverified text or a
 * model-supplied link.
 */
export function resolveChatReply(data: unknown): ChatReply {
  if (!data || typeof data !== "object") {
    return { type: "unknown", reply: "", sources: [], escalation: null };
  }
  const d = data as Record<string, unknown>;
  const type = TYPES.includes(d.type as ChatReplyType) ? (d.type as ChatReplyType) : "unknown";
  const reply = typeof d.reply === "string" ? d.reply.slice(0, 4000) : "";
  const reason = REASONS.includes(d.reason as ChatRefusalReason)
    ? (d.reason as ChatRefusalReason)
    : undefined;

  const sources: ChatSource[] = [];
  if (Array.isArray(d.sources)) {
    for (const raw of d.sources) {
      if (!raw || typeof raw !== "object") continue;
      const s = raw as Record<string, unknown>;
      const url = safeHttpUrl(s.url);
      const title = typeof s.title === "string" ? s.title.slice(0, 200) : "";
      if (url && title) sources.push({ title, url });
    }
  }

  let escalation: ChatEscalation | null = null;
  if (d.escalation && typeof d.escalation === "object") {
    const e = d.escalation as Record<string, unknown>;
    const email = safeEmail(e.email);
    if (email) {
      escalation = {
        required: e.required === true,
        category: typeof e.category === "string" ? e.category : null,
        email,
      };
    }
  }

  return {
    type,
    reply,
    reason,
    sources: sources.slice(0, 5),
    escalation,
    disclaimer: typeof d.disclaimer === "string" ? d.disclaimer.slice(0, 500) : undefined,
    locale: typeof d.locale === "string" ? d.locale : undefined,
  };
}

async function authHeader(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) return `Bearer ${token}`;
  } catch {
    // A guest visitor has no session; fall back to the anon key.
  }
  return `Bearer ${SUPABASE_ANON_KEY}`;
}

export interface SendChatInput {
  message: string;
  history: ChatTurn[];
  locale: string;
  signal?: AbortSignal;
}

/**
 * Send one message. Resolves with a result the UI can render; it never throws.
 * The caller is responsible for keeping the conversation in memory only.
 */
export async function sendChatMessage(input: SendChatInput): Promise<ChatSendResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "not_configured" };
  if (!input.message.trim()) return { ok: false, error: "invalid_message" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  input.signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(functionsUrl("support-chat"), {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: await authHeader(),
      },
      body: JSON.stringify({
        message: input.message,
        locale: input.locale,
        history: input.history.slice(-8),
      }),
    });

    if (res.status === 429) return { ok: false, error: "rate_limited" };
    if (res.status === 503) return { ok: false, error: "disabled" };
    if (res.status === 504) return { ok: false, error: "timeout" };
    if (res.status === 400) return { ok: false, error: "invalid_message" };
    if (!res.ok) return { ok: false, error: "unavailable" };

    const reply = resolveChatReply(await res.json());
    if (reply.type === "timeout") return { ok: false, error: "timeout" };
    if (reply.type === "error") return { ok: false, error: "unavailable" };
    return { ok: true, reply };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return { ok: false, error: "timeout" };
    }
    return { ok: false, error: "unavailable" };
  } finally {
    clearTimeout(timer);
    input.signal?.removeEventListener("abort", onAbort);
  }
}
