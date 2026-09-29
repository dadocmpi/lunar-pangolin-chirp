// ============================================================================
// notify-owner — the single Edge Function entrypoint for owner notifications.
//
// Called by:
//   - the browser (public form submissions, e.g. the contact form), and
//   - other Edge Functions / webhooks (service-role bearer token).
//
// It validates and rate-limits the request, then hands off to the central
// module `_shared/email.ts`. The response returns immediately; the email is
// sent in the background so a slow provider never delays the caller.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { EVENT_TYPES, type EventType, notifyOwner } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BODY_BYTES = 16 * 1024;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 20;

// Best-effort per-instance rate limiter. Edge isolates are ephemeral, so this
// is a soft limit; the honeypot and the arithmetic challenge on the public
// form are the primary anti-spam controls.
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) ?? []).filter((t) =>
    now - t < RATE_WINDOW_MS
  );
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

function normalizeType(value: unknown): EventType {
  return (EVENT_TYPES as readonly string[]).includes(String(value))
    ? (value as EventType)
    : "erro";
}

/** Keep only primitives; nested objects are flattened one level. */
function sanitizePayload(value: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!value || typeof value !== "object") return out;
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") out[key] = raw.slice(0, 1000);
    else if (typeof raw === "number" || typeof raw === "boolean") out[key] = raw;
    else if (raw === null) out[key] = null;
    else if (raw && typeof raw === "object") {
      for (
        const [subKey, subRaw] of Object.entries(raw as Record<string, unknown>)
      ) {
        const flat = `${key}.${subKey}`;
        if (typeof subRaw === "string") out[flat] = subRaw.slice(0, 1000);
        else if (typeof subRaw === "number" || typeof subRaw === "boolean") {
          out[flat] = subRaw;
        } else if (subRaw === null) out[flat] = null;
      }
    }
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: "payload_too_large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = JSON.parse(raw);
    body = parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Honeypot: real clients never populate this field.
  if (typeof body.honeypot === "string" && body.honeypot.trim() !== "") {
    console.warn("[notify-owner] honeypot triggered", { ip });
    return new Response(JSON.stringify({ ok: true, dropped: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const type = normalizeType(body.type);
  const subject = typeof body.subject === "string" && body.subject.trim()
    ? body.subject.trim().slice(0, 180)
    : "Evento";

  // Hand off to the central module in the background so the response is not
  // blocked by the provider round-trip.
  const runtime = (globalThis as {
    EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void };
  }).EdgeRuntime;
  const send = notifyOwner({
    type,
    subject,
    data: sanitizePayload(body.data),
    replyTo: typeof body.replyTo === "string" ? body.replyTo : null,
    idempotencyKey: typeof body.idempotencyKey === "string"
      ? body.idempotencyKey
      : null,
  });
  if (runtime?.waitUntil) runtime.waitUntil(send);
  else void send;

  return new Response(JSON.stringify({ ok: true }), {
    status: 202,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
