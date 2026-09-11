import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APPROVE_STATUS = "approved";
const DENY_STATUS = "rejected";

/**
 * Read KYC_ACTION_SECRET from the Edge Function env.
 * Throws if it is not set. There is intentionally no hard-coded fallback
 * so a misconfigured environment can never accidentally authorize a KYC
 * action with a default secret.
 */
function getKycActionSecret(): string {
  const val = Deno.env.get("KYC_ACTION_SECRET");
  if (!val) {
    throw new Error("KYC_ACTION_SECRET environment variable is not set");
  }
  return val;
}

function makeToken(userId: string, action: string, secret: string): string {
  return btoa(`${userId}:${action}:${secret}`);
}

/** Constant-time string compare to prevent token timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&";
      case "<":
        return "<";
      case ">":
        return ">";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return c;
    }
  });
}

function htmlResponse(title: string, body: string, status = 200): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} — Braxel Markets</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #05070A;
      color: #fff;
      display: flex;
      height: 100vh;
      margin: 0;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .container { max-width: 520px; padding: 2rem; }
    h1 { font-size: 1.75rem; margin-bottom: 1rem; color: #D4AF37; }
    p  { font-size: 1rem; line-height: 1.6; color: #cbd5e1; }
    .ok   { color: #34d399; }
    .bad  { color: #f87171; }
    code  { background: #111827; padding: 2px 6px; border-radius: 4px; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(title)}</h1>
    <p>${body}</p>
  </div>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return htmlResponse(
      "Method not allowed",
      "Only GET and POST are accepted on this endpoint.",
      405,
    );
  }

  // KYC_ACTION_SECRET — fail closed if missing.
  let secret: string;
  try {
    secret = getKycActionSecret();
  } catch (_err) {
    return htmlResponse(
      "Server misconfigured",
      `KYC_ACTION_SECRET is not set in the Edge Function environment. No row was modified.`,
      500,
    );
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const action = url.searchParams.get("action");
  const token = url.searchParams.get("token");

  if (!userId || !action || !token) {
    return htmlResponse(
      "Invalid request",
      `Missing one of the required parameters: <code>userId</code>, <code>action</code>, <code>token</code>.`,
      400,
    );
  }
  if (action !== "approve" && action !== "deny") {
    return htmlResponse(
      "Invalid action",
      `The <code>action</code> parameter must be <code>approve</code> or <code>deny</code>.`,
      400,
    );
  }

  const expected = makeToken(userId, action, secret);
  if (!timingSafeEqual(token, expected)) {
    return htmlResponse(
      "Unauthorized",
      `The token does not match. No row was modified.`,
      401,
    );
  }

  const url_ = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url_ || !key) {
    return htmlResponse(
      "Server misconfigured",
      `SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. No row was modified.`,
      500,
    );
  }
  const admin = createClient(url_, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const newStatus = action === "approve" ? APPROVE_STATUS : DENY_STATUS;
  const { data, error } = await admin
    .from("profiles")
    .update({ kyc_status: newStatus })
    .eq("id", userId)
    .select("id, kyc_status")
    .maybeSingle();

  if (error) {
    return htmlResponse(
      "Update failed",
      `The database rejected the update: <code>${
        escapeHtml(error.message)
      }</code>`,
      500,
    );
  }
  if (!data) {
    return htmlResponse(
      "Profile not found",
      `No profile row exists for userId <code>${escapeHtml(userId)}</code>.`,
      404,
    );
  }

  const verb = action === "approve" ? "approved" : "rejected";
  return htmlResponse(
    `KYC ${verb}`,
    `KYC verification <span class="${
      action === "approve" ? "ok" : "bad"
    }">${verb}</span> for user <code>${
      escapeHtml(userId)
    }</code>. Status is now <code>${
      escapeHtml(String(data.kyc_status))
    }</code>.`,
    200,
  );
});
