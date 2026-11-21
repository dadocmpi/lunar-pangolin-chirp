import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { sendUserEmailInBackground } from "../_shared/userEmail.ts";
import { verifyActionToken } from "../_shared/kyc/actionToken.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const APPROVE_STATUS = "approved";
const DENY_STATUS = "rejected";

// Owner action links are hit by a human in a browser. A soft per-IP limit
// stops a leaked/guessed link from being hammered.
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

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

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape every HTML metacharacter before interpolating into a response. */
function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]);
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
  const corsHeaders = corsHeadersFor(req);
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

  const ip = clientIp(req);
  if (limiter.hit(`ip:${ip}`)) {
    return htmlResponse(
      "Too many requests",
      "Please wait a moment and try again.",
      429,
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

  // HMAC-signed token (see _shared/kyc/actionToken.ts). The secret is never
  // part of the link, the signature covers the user + action, and the token
  // expires. A legacy base64 token is rejected by design.
  const tokenCheck = await verifyActionToken(token, userId, action, secret);
  if (!tokenCheck.ok) {
    return htmlResponse(
      "Unauthorized",
      `The link is invalid or has expired. No row was modified.`,
      401,
    );
  }

  // Optional reviewer note. Shown to the user when a submission is rejected.
  const reason = (url.searchParams.get("reason") ?? "").trim().slice(0, 500);

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
    // Never echo the database error to the browser: it can contain schema and
    // row details. The operator sees a generic failure and the audit trail
    // lives server-side.
    console.error("[kyc-action] profile update failed", {
      userId,
      code: error.code,
    });
    return htmlResponse(
      "Update failed",
      "The database rejected the update. No row was modified.",
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

  // Mirror the decision onto the latest submission so the status view and the
  // withdrawal gate (which reads the latest submission first) agree.
  const { data: latest } = await admin
    .from("kyc_submissions")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest?.id) {
    await admin
      .from("kyc_submissions")
      .update({
        status: newStatus,
        review_reason: action === "deny" ? (reason || "documents_unreadable") : null,
        reviewed_by: "owner_link",
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", latest.id);
  }

  const verb = action === "approve" ? "approved" : "rejected";
  notifyOwnerInBackground({
    type: "conta",
    subject: `KYC ${action === "approve" ? "aprovado" : "recusado"}`,
    data: {
      user_id: userId,
      acao: action,
      novo_status: newStatus,
      motivo: reason || undefined,
      origem: "kyc-action",
    },
    idempotencyKey: `kyc-action:${userId}:${action}`,
  });

  // Notify the user of the decision (Resend). Recipient is read server-side
  // from the user record, never from the request.
  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const email = userData?.user?.email ?? null;
  sendUserEmailInBackground({
    to: email,
    subject: action === "approve"
      ? "Verificacao de identidade aprovada — Braxel Markets"
      : "Verificacao de identidade recusada — Braxel Markets",
    heading: action === "approve"
      ? "Verificacao aprovada"
      : "Verificacao recusada",
    body: action === "approve"
      ? "A sua verificacao de identidade foi aprovada. Ja pode solicitar levantamentos."
      : "A sua verificacao de identidade foi recusada. Pode reenviar os documentos a partir do painel.",
    details: action === "deny" && reason ? [["Motivo", reason]] : undefined,
  });

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
