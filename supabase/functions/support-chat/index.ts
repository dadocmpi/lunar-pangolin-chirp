// ============================================================================
// support-chat — Braxel Markets AI support assistant.
//
// Public by design (verify_jwt = false) because visitors who cannot sign in
// still need help with account creation, email confirmation and password
// recovery. A bearer JWT is OPTIONAL: when present it is verified and used only
// as a rate-limit key. No user id is ever read from the body.
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
import { createRateLimiter } from "../_shared/rateLimit.ts";
import { isSupportChatEnabled } from "../_shared/features.ts";
import { handleChat, normalizeMessage } from "../_shared/chat/chat.ts";
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

  // Runtime kill switch. Off => the endpoint refuses (fail closed).
  if (!isSupportChatEnabled()) {
    return json({ ok: false, error: "feature_disabled", feature: "support_chat" }, 503);
  }

  const identity = await resolveChatIdentity(req);
  const key = rateLimitKey(identity);
  const limited = identity.userId
    ? userLimiter.hit(key) || ipLimiter.hit(`ip:${identity.ip}`)
    : ipLimiter.hit(key);
  if (limited) {
    return new Response(
      JSON.stringify({ ok: false, error: "rate_limited" }),
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
      { ok: false, error: body.error },
      body.error === "payload_too_large" ? 413 : 400,
    );
  }

  // ONLY these three fields are read. Any user id, conversation id, status or
  // action field in the body is ignored by design.
  const message = normalizeMessage(body.value.message);
  if (!message) return json({ ok: false, error: "invalid_message" }, 400);

  const locale = typeof body.value.locale === "string" ? body.value.locale : "en";
  const history = body.value.history;

  const provider = createChatProviderFromEnv({
    CHAT_AI_API_KEY: Deno.env.get("CHAT_AI_API_KEY") ?? undefined,
    CHAT_AI_MODEL: Deno.env.get("CHAT_AI_MODEL") ?? undefined,
    CHAT_AI_PROVIDER: Deno.env.get("CHAT_AI_PROVIDER") ?? undefined,
    KYC_AI_API_KEY: Deno.env.get("KYC_AI_API_KEY") ?? undefined,
  });

  const reply = await handleChat(
    { message, locale, history: history as ChatTurn[] },
    {
      provider,
      appUrl: Deno.env.get("APP_URL") ?? DEFAULT_APP_URL,
      supportEmail: Deno.env.get("SUPPORT_INBOX_EMAIL") ?? DEFAULT_SUPPORT_EMAIL,
      timeoutMs: envTimeoutMs(),
    },
  );

  // Observability without user data: reply type, provider, escalation flag.
  console.log("[support-chat]", {
    type: reply.type,
    provider: reply.provider,
    escalated: Boolean(reply.escalation),
    authenticated: identity.authenticated,
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
    locale,
  }, status);
});
