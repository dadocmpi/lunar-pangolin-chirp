// ============================================================================
// support-message — public Institutional Support channel.
//
// Receives a contact-form submission, validates it server-side, then sends it
// to the support inbox through the single central email module
// (../_shared/email.ts -> sendSupportMessage). The recipient is resolved from
// SUPPORT_INBOX_EMAIL on the server; the client never sees it or the Resend key.
//
// Failures are reported honestly (4xx/5xx) so the form can show an error state,
// unlike fire-and-forget owner notifications.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  EMAIL_PATTERN,
  sendSupportMessage,
  SUPPORT_LIMITS,
} from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BODY_BYTES = 32 * 1024;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 5;

// Best-effort per-instance limiter. Edge isolates are ephemeral, so this is a
// soft limit; the honeypot and the arithmetic challenge on the form are the
// primary anti-spam controls.
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    rateBuckets.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateBuckets.set(ip, hits);
  if (rateBuckets.size > 1000) {
    const oldest = rateBuckets.keys().next().value;
    if (oldest !== undefined) rateBuckets.delete(oldest);
  }
  return false;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return json({ ok: false, error: "rate_limited" }, 429);
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: "payload_too_large" }, 413);
    }
    const parsed = JSON.parse(raw);
    body = parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Honeypot: real clients never populate these. Answer success so bots do not
  // learn anything, but do not send.
  const honeypot = [body.website, body.honeypot, body.company];
  if (honeypot.some((v) => typeof v === "string" && v.trim() !== "")) {
    console.warn("[support-message] honeypot triggered");
    return json({ ok: true, dropped: true }, 202);
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const name = str(body.name).slice(0, SUPPORT_LIMITS.name);
  const email = str(body.email).slice(0, SUPPORT_LIMITS.email);
  const topic = str(body.topic ?? body.subject).slice(0, SUPPORT_LIMITS.topic);
  const message = str(body.message).slice(0, SUPPORT_LIMITS.message);
  const locale = str(body.locale).slice(0, 16) || "en";

  const missing: string[] = [];
  if (!name) missing.push("name");
  if (!email) missing.push("email");
  if (!topic) missing.push("topic");
  if (!message) missing.push("message");
  if (missing.length) {
    return json({ ok: false, error: "missing_fields", fields: missing }, 400);
  }
  if (!EMAIL_PATTERN.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }
  if (message.length < 5) {
    return json({ ok: false, error: "message_too_short" }, 400);
  }

  const result = await sendSupportMessage({
    name,
    email,
    topic,
    message,
    locale,
    timestamp: new Date().toISOString(),
  });

  if (!result.ok) {
    // Do not leak provider detail; the visitor sees a generic retry message.
    console.error("[support-message] delivery failed", {
      reason: result.error ?? result.skipped,
    });
    return json({ ok: false, error: "delivery_failed" }, 502);
  }

  return json({ ok: true, id: result.id }, 200);
});
