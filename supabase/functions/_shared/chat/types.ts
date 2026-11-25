// ============================================================================
// Shared types for the Braxel support chatbot.
//
// Conversations are STATELESS on the server: the browser sends the recent
// turns with each request and the server never persists them. There is no
// conversation id, no user id in the body, and no table. This is why two users
// can never read each other's chat through this API.
// ============================================================================

export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export type ChatReplyType =
  | "answered"
  | "unknown"
  | "escalated"
  | "refused"
  | "timeout"
  | "error";

export type EscalationCategory =
  | "payment_dispute"
  | "kyc"
  | "account_suspension"
  | "legal"
  | "provider_problem"
  | "refund"
  | "human_request";

export interface ChatSource {
  title: string;
  /** Absolute https URL built server-side from APP_URL. Never model-supplied. */
  url: string;
}

export interface ChatEscalation {
  required: true;
  category: EscalationCategory | null;
  /** Support inbox from SUPPORT_INBOX_EMAIL (server-side only). */
  email: string;
}

export type ChatRefusalReason = "advice" | "secret" | "injection" | "promise";

export interface ChatReply {
  type: ChatReplyType;
  /** Localized text in the language detected from the latest user message. */
  reply: string;
  /** Language the reply is written in (detected, not the website locale). */
  locale?: string;
  /** For `refused`, why the request was refused (the UI picks localized copy). */
  reason?: ChatRefusalReason;
  sources: ChatSource[];
  escalation: ChatEscalation | null;
  disclaimer?: string;
  /** Approved article ids used, for server-side observability (not user data). */
  articleIds: string[];
  /** Provider that produced the answer, or "knowledge_base" for the fallback. */
  provider: string;
}

export interface ChatRequestInput {
  message: string;
  locale: string;
  history: ChatTurn[];
}

export const MAX_MESSAGE_CHARS = 2000;
export const MAX_HISTORY_TURNS = 8;
export const MAX_REPLY_CHARS = 4000;
