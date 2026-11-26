// ============================================================================
// support-chat — Braxel Markets AI support assistant.
//
// Public by design (verify_jwt = false) because visitors who cannot sign in
// still need help with account creation, email confirmation and password
// recovery. A bearer JWT is OPTIONAL: when present it is verified and used only
// as a rate-limit key. No user id is ever read from the body.
//
// Language: the reply language is detected deterministically from the latest
// user message (see _shared/chat/language.ts). Every deterministic fallback —
// unknown, timeout, provider error, rate limit, refusal and human handoff — is
// localized in all 11 locales, so the customer never gets an English answer
// merely because the website locale is English.
//
// Understanding: the message is classified against the approved knowledge base
// (see _shared/chat/intent.ts) so informal, abbreviated, misspelled and
// conversational messages are answered from the right topic, and a genuinely
// ambiguous message gets one short clarifying question instead of a guess.
//
// Privacy: conversations are STATELESS. The browser sends the recent turns
// with each request; this function stores nothing, logs no message content and
// returns `Cache-Control: no-store`. There is no conversation table, so one
// user can never read another user's chat.
//
// Capabilities: none beyond a text completion. The function has no tools, no
// database writes and no operator/payment/activation calls. It cannot change a
// payment, an account or a connection status, and it never claims to.
//
// Secrets: CHAT_AI_API_KEY (OpenRouter by default; the legacy Gemini KYC key
// is only reused when CHAT_AI_PROVIDER=gemini). The key is server-only, sent in
// a request header, never logged and never returned.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { readJsonBody } from "../_shared/http.ts";
import { createRateLimiter, clientIp } from "../_shared/rateLimit.ts";
import { isSupportChatEnabled } from "../_shared/features.ts";
import { handleChat, normalizeHistory, normalizeMessage } from "../_shared/chat/chat.ts";
import {
  detectLanguageSwitchRequest,
  localeFromAcceptLanguage,
  resolveResponseLanguage,
} from "../_shared/chat/language.ts";
import { chatMessage } from "../_shared/chat/messages.ts";
import { createChatProviderFromEnv } from "../_shared/chat/provider.ts";
import { rateLimitKey, resolveChatIdentity } from "../_shared/chat/identity.ts";
import type { ChatTurn } from "../_shared/chat/types.ts";

const MAX_BODY_BYTES = 32 * 1024;
const DEFAULT_APP_URL = "https://braxelmarkets.vercel.app";
const DEFAULT_SUPPORT_EMAIL = "marketsbraxel@ouvidor.net";

// Soft per-instance limits. The verified JWT (when present) and the platform
// gateway remain the hard ceiling; these stop casual abuse and runaway loops.
const ipLimiter = createRateLimiter({ windowMs: 10 * 60_000, max: 40 });
const userLimiter = createRateLimiter({ windowMs: 10 * 60_000, max: 30 });

function envTimeoutMs(): number {
  const raw = Number.parseInt(Deno.env.get("SUPPORT_CHAT_TIMEOUT_MS") ?? "", 10);
  if (!Number.isFinite(raw)) return 20_000;
  return Math.min(30_000, Math.max(2_000, raw));
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  const json = (body: Record<string, unknown>, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  // Before the body is parsed we only have the browser's language hint. It is
  // used for kill-switch and IP-limit messages, never to decide an answer.
  const hintLocale = localeFromAcceptLanguage(req.headers.get("accept-language")) ?? "en";

  // Runtime kill switch. Off => the endpoint refuses (fail closed).
  if (!isSupportChatEnabled()) {
    return json(
      {
        ok: false,
        error: "feature_disabled",
        feature: "support_chat",
        locale: hintLocale,
        reply: chatMessage(hintLocale, "disabled"),
      },
      503,
    );
  }

  // Cheap IP ceiling before any body read or Auth round-trip.
  const ipKey = `ip:${clientIp(req)}`;
  if (ipLimiter.hit(ipKey)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "rate_limited",
        locale: hintLocale,
        reply: chatMessage(hintLocale, "rateLimited"),
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Retry-After": "600",
        },
      },
    );
  }

  const body = await readJsonBody<Record<string, unknown>>(req, MAX_BODY_BYTES);
  if (!body.ok) {
    return json(
      {
        ok: false,
        error: body.error,
        locale: hintLocale,
        reply: chatMessage(hintLocale, "invalidMessage"),
      },
      body.error === "payload_too_large" ? 413 : 400,
    );
  }

  // ONLY these three fields are read. Any user id, conversation id, status or
  // action field in the body is ignored by design.
  const message = normalizeMessage(body.value.message);
  if (!message) {
    return json(
      {
        ok: false,
        error: "invalid_message",
        locale: hintLocale,
        reply: chatMessage(hintLocale, "invalidMessage"),
      },
      400,
    );
  }

  const websiteLocale = typeof body.value.locale === "string" ? body.value.locale : "en";
  const history = normalizeHistory(body.value.history);

  // Detect before rate limiting so even a 429 is in the customer's language.
  const language = resolveResponseLanguage({
    message,
    history,
    locale: websiteLocale,
  });
  const locale = detectLanguageSwitchRequest(message) ?? language.locale;

  const identity = await resolveChatIdentity(req);
  if (identity.userId && userLimiter.hit(rateLimitKey(identity))) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "rate_limited",
        locale,
        reply: chatMessage(locale, "rateLimited"),
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Retry-After": "600",
        },
      },
    );
  }

  const provider = createChatProviderFromEnv({
    CHAT_AI_API_KEY: Deno.env.get("CHAT_AI_API_KEY") ?? undefined,
    CHAT_AI_MODEL: Deno.env.get("CHAT_AI_MODEL") ?? undefined,
    CHAT_AI_PROVIDER: Deno.env.get("CHAT_AI_PROVIDER") ?? undefined,
    KYC_AI_API_KEY: Deno.env.get("KYC_AI_API_KEY") ?? undefined,
  });

  const reply = await handleChat(
    { message, locale: websiteLocale, history: history as ChatTurn[] },
    {
      provider,
      appUrl: Deno.env.get("APP_URL") ?? DEFAULT_APP_URL,
      supportEmail: Deno.env.get("SUPPORT_INBOX_EMAIL") ?? DEFAULT_SUPPORT_EMAIL,
      timeoutMs: envTimeoutMs(),
    },
  );

  // Observability without user data: reply type, provider, escalation flag,
  // detected language and where the language decision came from.
  console.log("[support-chat]", {
    type: reply.type,
    provider: reply.provider,
    escalated: Boolean(reply.escalation),
    authenticated: identity.authenticated,
    locale,
    languageSource: language.source,
    // Counts and approved article ids only (no message text, no user data).
    historyTurns: history.length,
    intent: reply.articleIds[0] ?? null,
  });

  const status = reply.type === "timeout" ? 504 : 200;
  return json({
    ok: reply.type !== "error",
    type: reply.type,
    reply: reply.reply,
    reason: reply.reason,
    sources: reply.sources,
    escalation: reply.escalation,
    disclaimer: reply.disclaimer,
    locale: reply.locale ?? locale,
  }, status);
});
