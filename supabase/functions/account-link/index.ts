// ============================================================================
// account-link — the customer's server-authoritative onboarding status.
//
// The dashboard view uses this instead of reading activation rows directly so
// that ownership, payment entitlement and the execution kill switch are decided
// on the server.
//
// Security contract:
//   * The user comes from the verified JWT, never from the body or query.
//   * GET returns only the caller's own rows; an id belonging to another user
//     answers 404 exactly like a missing id.
//   * POST { action: "disconnect" } updates only a row owned by the caller and
//     only from an approved/suspended state. Every decision is audited.
//   * Execution capability is reported, never enabled: no order placement,
//     modification, liquidation, payout, withdrawal, ACH, wire or transfer
//     operation exists in this phase.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { activationConfigFromEnv } from "../_shared/activation/config.ts";
import {
  PAYMENT_NOT_CONFIRMED,
  resolveEntitlement,
} from "../_shared/activation/entitlement.ts";
import { logAccountLinkEvent } from "../_shared/activation/audit.ts";
import {
  canReview,
  isActivationStatus,
  type ActivationStatus,
} from "../_shared/activation/status.ts";
import {
  EXECUTION_CAPABILITY_IMPLEMENTED,
  isExecutionCapabilityEnabled,
} from "../_shared/features.ts";
import { isTestPaymentMode } from "../_shared/payments-flag.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

const ROW_FIELDS = [
  "id",
  "firm",
  "plan_name",
  "braxel_plan_key",
  "braxel_plan_name",
  "payment_id",
  "payment_status",
  "account_login",
  "purchase_email",
  "receipt_path",
  "status",
  "operator_note",
  "submitted_at",
  "reviewed_at",
  "connected_at",
  "suspended_at",
  "suspended_reason",
  "disconnected_at",
  "disconnected_reason",
  "created_at",
].join(", ");

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  const json = (body: Record<string, unknown>, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const config = activationConfigFromEnv();
  if (!config.enabled) {
    return json({ ok: false, error: "feature_disabled", feature: "activation_flow" }, 503);
  }

  if (limiter.hit(`ip:${clientIp(req)}`)) return json({ error: "rate_limited" }, 429);

  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);

  if (req.method === "GET") {
    const id = new URL(req.url).searchParams.get("id");
    let query = ctx.admin
      .from("account_activations")
      .select(ROW_FIELDS)
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (id) query = query.eq("id", id).limit(1);

    const { data: rows, error } = await query;
    if (error) return json({ error: "lookup_failed" }, 500);
    if (id && (!rows || rows.length === 0)) return json({ error: "not_found" }, 404);

    const history = rows ?? [];
    const latest = history[0] ?? null;

    const { data: paymentRow, error: paymentError } = await ctx.admin
      .from("pending_payments")
      .select("id, plan_id, plan_name, status, status_enum, method, created_at, metadata")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (paymentError) return json({ error: "payment_lookup_failed" }, 500);

    const entitlement = resolveEntitlement(paymentRow, {
      testMode: isTestPaymentMode(),
    });

    return json({
      ok: true,
      enabled: true,
      execution: {
        enabled: isExecutionCapabilityEnabled(),
        implemented: EXECUTION_CAPABILITY_IMPLEMENTED,
      },
      latest,
      history,
      entitlement,
      paymentRequired: !entitlement.entitled,
      paymentErrorCode: entitlement.entitled ? null : PAYMENT_NOT_CONFIRMED,
    });
  }

  // POST — the only customer mutation is disconnecting their own link.
  const parsed = await readJsonBody<Record<string, unknown>>(req);
  if (!parsed.ok) {
    return json(
      { error: parsed.error },
      parsed.error === "payload_too_large" ? 413 : 400,
    );
  }
  const action = parsed.value.action;
  const id = typeof parsed.value.id === "string" ? parsed.value.id.trim() : "";
  if (action !== "disconnect") return json({ error: "invalid_action" }, 400);
  if (!id) return json({ error: "missing_id" }, 400);

  const { data: row, error: rowError } = await ctx.admin
    .from("account_activations")
    .select("id, user_id, status")
    .eq("id", id)
    .eq("user_id", ctx.user.id)
    .maybeSingle();
  if (rowError) return json({ error: "lookup_failed" }, 500);
  if (!row) return json({ error: "not_found" }, 404);

  const from = row.status;
  if (!isActivationStatus(from) || !canReview(from, "disconnected")) {
    return json({ error: "invalid_transition", from, to: "disconnected" }, 409);
  }

  const now = new Date().toISOString();
  const { error: updateError } = await ctx.admin
    .from("account_activations")
    .update({
      status: "disconnected" as ActivationStatus,
      disconnected_at: now,
      disconnected_reason: "Disconnected by the customer",
      updated_at: now,
    })
    .eq("id", id)
    .eq("user_id", ctx.user.id);
  if (updateError) return json({ error: "update_failed" }, 500);

  await logAccountLinkEvent(ctx.admin, {
    accountLinkId: id,
    userId: ctx.user.id,
    event: "disconnected",
    from,
    to: "disconnected",
    actor: "user",
    source: "admin",
    reason: "Customer disconnected the account link",
    at: now,
  });

  notifyOwnerInBackground({
    type: "conta",
    subject: "Vínculo de conta desligado pelo cliente",
    data: {
      activation_id: id,
      user_id: ctx.user.id,
      status_anterior: from,
      status_novo: "disconnected",
      origem: "account-link",
    },
    idempotencyKey: `account-link:disconnect:${id}:${now}`,
  });

  return json({ ok: true, status: "disconnected", disconnectedAt: now });
});
