// ============================================================================
// activation-submit — an authenticated customer requests activation of their
// signals plan after buying an account at a prop firm.
//
// Security contract:
//   * The user id comes from the verified JWT, never from the body.
//   * The firm must be one configured with an affiliate URL server-side.
//   * NO broker password / CID / secret is accepted or stored — the payload
//     has no field for it, and the receipt is a proof of purchase only.
//   * The receipt goes into the PRIVATE bucket 'activation-receipts' at
//     '<user_id>/<uuid>.<ext>'; only the object path is stored.
//   * Rate-limited per IP and per user (soft, per-instance).
//   * Notifies the operator by email through the central _shared/email.ts
//     module when Resend is configured; delivery failure never breaks the
//     request.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  activationConfigFromEnv,
  isAtCapacity,
  isConfiguredFirm,
} from "../_shared/activation/config.ts";
import {
  buildReceiptPath,
  validateActivationPayload,
  validateReceiptFile,
} from "../_shared/activation/limits.ts";
import { createRateLimiter } from "../_shared/activation/rateLimit.ts";
import { isOpenStatus } from "../_shared/activation/status.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";

const BUCKET = "activation-receipts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const config = activationConfigFromEnv();
  // Runtime kill switch. Off => the whole flow is refused (fail closed).
  if (!config.enabled) {
    return json({ ok: false, error: "feature_disabled", feature: "activation_flow" }, 503);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limiter.hit(`ip:${ip}`)) return json({ error: "rate_limited" }, 429);

  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);

  // Parse the multipart form. A missing/malformed body is a client error.
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "invalid_form" }, 400);
  }

  const payload = validateActivationPayload(
    {
      firmId: form.get("firmId"),
      planName: form.get("planName"),
      accountLogin: form.get("accountLogin"),
      purchaseEmail: form.get("purchaseEmail"),
      note: form.get("note"),
      confirmedOwnership: form.get("confirmedOwnership"),
      confirmedResponsibility: form.get("confirmedResponsibility"),
      confirmedFirmRules: form.get("confirmedFirmRules"),
      confirmedRisk: form.get("confirmedRisk"),
    },
    (firmId) => isConfiguredFirm(config, firmId),
  );
  if (!payload.ok || !payload.value) {
    return json({ error: payload.error ?? "invalid_payload" }, 400);
  }

  const receipt = form.get("receipt");
  const file = receipt instanceof File ? receipt : null;
  const receiptCheck = validateReceiptFile(
    file ? { name: file.name, type: file.type, size: file.size } : null,
  );
  if (!receiptCheck.ok) {
    return json({ error: "invalid_receipt", detail: receiptCheck.error }, 400);
  }

  const admin = ctx.admin;

  // One open request at a time: a duplicate submit while a decision is pending
  // is refused (the customer sees their existing status instead).
  const { data: existing, error: existingError } = await admin
    .from("account_activations")
    .select("id, status")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError) return json({ error: "lookup_failed" }, 500);
  if (existing && isOpenStatus(existing.status)) {
    return json({ error: "already_pending", status: existing.status }, 409);
  }

  // Pilot capacity. When a positive limit is configured and the number of
  // already-approved activations has reached it, refuse new submissions and
  // tell the client to show the waitlist. Fail-soft on a count error: a
  // transient DB problem must not turn every submit into a waitlist.
  if (config.maxActive > 0) {
    const { count } = await admin
      .from("account_activations")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved");
    if (isAtCapacity(config.maxActive, count ?? 0)) {
      return json({ error: "waitlist", maxActive: config.maxActive }, 409);
    }
  }

  // Upload the receipt (non-guessable uuid path, never the original name).
  const objectPath = buildReceiptPath(ctx.user.id, file!.name, crypto.randomUUID());
  const bytes = new Uint8Array(await file!.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(objectPath, bytes, {
      contentType: file!.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) return json({ error: "upload_failed" }, 500);

  const now = new Date().toISOString();
  const { data: inserted, error: insertError } = await admin
    .from("account_activations")
    .insert({
      user_id: ctx.user.id,
      firm: payload.value.firmId,
      plan_name: payload.value.planName,
      account_login: payload.value.accountLogin,
      purchase_email: payload.value.purchaseEmail,
      receipt_path: objectPath,
      status: "pending",
      confirmed_ownership: payload.value.confirmedOwnership,
      confirmed_responsibility: payload.value.confirmedResponsibility,
      confirmed_firm_rules: payload.value.confirmedFirmRules,
      confirmed_risk: payload.value.confirmedRisk,
      submitted_at: now,
      updated_at: now,
    })
    .select("id, status")
    .single();
  if (insertError || !inserted) return json({ error: "insert_failed" }, 500);

  // Operator notification. The account login and purchase email are not
  // sensitive; no receipt bytes, no credential, is ever put in the email.
  notifyOwnerInBackground({
    type: "conta",
    subject: "Nova solicitação de ativação de conta",
    replyTo: payload.value.purchaseEmail,
    data: {
      activation_id: inserted.id,
      user_id: ctx.user.id,
      mesa: payload.value.firmId,
      plano: payload.value.planName,
      conta: payload.value.accountLogin,
      email_compra: payload.value.purchaseEmail,
      comprovante: objectPath,
      observacoes: payload.value.note || null,
      origem: "activation-submit",
    },
    idempotencyKey: `activation-submit:${inserted.id}`,
  });

  return json({ ok: true, activationId: inserted.id, status: inserted.status }, 201);
});
