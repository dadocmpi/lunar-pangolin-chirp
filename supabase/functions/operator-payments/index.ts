// ============================================================================
// operator-payments — the operator view and manual payment actions.
//
// Security contract:
//   * Operator-only. Authorization is the same strict predicate used by
//     activation-review: app_metadata.operator === true, read from the admin
//     API (a stale token cannot carry an outdated flag).
//   * Every read is a service-role read, but the response contains only
//     identifiers, amounts and statuses — never a secret, token or credential.
//   * Every manual action is idempotent, appends an append-only audit row and
//     records which operator performed it.
//   * A manual payment approval is the ONLY way a manual (bank/crypto) payment
//     becomes confirmed. A customer declaration can never do it.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  ForbiddenError,
  requireOperator,
  UnauthorizedError,
} from "../_shared/activation/operator.ts";
import {
  activatePlanFromVerifiedPayment,
  sendActivationEmailOnce,
  sendPaymentLifecycleEmail,
  setActivationStatus,
  type ActivationSource,
  type PlanActivationRow,
} from "../_shared/activation/activationService.ts";
import {
  canonicalPaymentStatus,
  deriveLifecycle,
  isConfirmablePaymentStatus,
  nextActionKey,
} from "../_shared/activation/lifecycle.ts";
import { boundedString, readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const MAX_ROWS = 50;

const ACTIONS = [
  "approve_payment",
  "reject_payment",
  "request_info",
  "activate",
  "suspend",
  "disconnect",
  "reinstate",
] as const;
type OperatorAction = (typeof ACTIONS)[number];

function isOperatorAction(value: unknown): value is OperatorAction {
  return typeof value === "string" && (ACTIONS as readonly string[]).includes(value);
}

function sourceForMethod(method: string | null | undefined): ActivationSource {
  const value = (method ?? "").toLowerCase();
  if (value === "stripe" || value === "card") return "stripe";
  if (value === "crypto") return "crypto";
  if (value === "wise") return "wise";
  return "admin";
}

interface PaymentRow {
  id: string;
  user_id: string;
  plan_id: string | null;
  plan_name: string | null;
  amount_cents: number | null;
  currency: string | null;
  network: string | null;
  method: string | null;
  status: string | null;
  status_enum: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
  confirmed_at: string | null;
}

async function customerFor(
  admin: SupabaseClient,
  userId: string,
): Promise<{ email: string | null; name: string | null }> {
  let email: string | null = null;
  let name: string | null = null;
  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    email = data?.user?.email ?? null;
    const meta = (data?.user?.user_metadata ?? {}) as Record<string, unknown>;
    if (typeof meta.full_name === "string") name = meta.full_name;
  } catch {
    // A missing auth record must not break the operator list.
  }
  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("first_name, last_name, full_name")
      .eq("id", userId)
      .maybeSingle();
    const row = profile as {
      first_name?: string | null;
      last_name?: string | null;
      full_name?: string | null;
    } | null;
    const composed = [row?.first_name, row?.last_name].filter(Boolean).join(" ").trim();
    if (composed) name = composed;
    else if (!name && row?.full_name) name = row.full_name;
  } catch {
    // Profiles are optional for the operator view.
  }
  return { email, name };
}

function activationSummary(activation: PlanActivationRow | null) {
  if (!activation) return null;
  return {
    id: activation.id,
    status: activation.status,
    account_id: activation.account_id,
    plan_key: activation.plan_key,
    plan_name: activation.plan_name,
    activated_at: activation.activated_at,
    suspended_at: activation.suspended_at,
    suspended_reason: activation.suspended_reason,
    disconnected_at: activation.disconnected_at,
    disconnected_reason: activation.disconnected_reason,
    activation_email_sent_at: activation.activation_email_sent_at,
    updated_at: activation.updated_at,
  };
}

async function audit(
  admin: SupabaseClient,
  args: {
    paymentTable: string;
    paymentId: string;
    userId: string | null;
    actor: string;
    actorId?: string | null;
    source: ActivationSource;
    eventId: string;
    from: string | null;
    to: string;
    reason: string;
  },
): Promise<void> {
  const { error } = await admin.from("payment_audit_log").insert({
    payment_table: args.paymentTable,
    payment_id: args.paymentId,
    user_id: args.userId,
    actor: args.actor,
    actor_id: args.actorId ?? null,
    source: args.source,
    event_id: args.eventId,
    previous_status: args.from,
    new_status: args.to,
    reason: args.reason.slice(0, 200),
    created_at: new Date().toISOString(),
  });
  if (error && error.code !== "23505") {
    console.error("operator_payment_audit_failed", { code: error.code });
  }
}

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

  if (limiter.hit(`ip:${clientIp(req)}`)) return json({ error: "rate_limited" }, 429);

  let ctx;
  try {
    ctx = await requireOperator(req);
  } catch (e) {
    if (e instanceof ForbiddenError) return json({ error: "forbidden" }, 403);
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);

  const admin = ctx.admin;

  // -------------------------------------------------------------------------
  // GET — list recent payments (with activation + customer) or one payment
  // with its append-only audit trail.
  // -------------------------------------------------------------------------
  if (req.method === "GET") {
    const paymentId = new URL(req.url).searchParams.get("paymentId");

    if (paymentId) {
      const { data: paymentData, error: paymentError } = await admin
        .from("pending_payments")
        .select(
          "id, user_id, plan_id, plan_name, amount_cents, currency, network, method, status, status_enum, metadata, created_at, updated_at, confirmed_at",
        )
        .eq("id", paymentId)
        .maybeSingle();
      if (paymentError) return json({ error: "lookup_failed" }, 500);
      if (!paymentData) return json({ error: "not_found" }, 404);
      const payment = paymentData as PaymentRow;

      const { data: activationData } = await admin
        .from("plan_activations")
        .select("*")
        .eq("payment_id", payment.id)
        .maybeSingle();
      const activation = (activationData as PlanActivationRow | null) ?? null;

      const { data: events } = await admin
        .from("payment_audit_log")
        .select("id, event_id, actor, actor_id, source, previous_status, new_status, reason, created_at")
        .in("payment_id", [payment.id, activation?.id ?? payment.id])
        .order("created_at", { ascending: true })
        .limit(100);

      const customer = await customerFor(admin, payment.user_id);
      const rawStatus = String(payment.status_enum ?? payment.status ?? "pending");
      const lifecycle = deriveLifecycle(rawStatus, activation?.status ?? null);

      return json({
        ok: true,
        payment: {
          ...payment,
          status: canonicalPaymentStatus(rawStatus),
          status_raw: rawStatus,
          customer_email: customer.email,
          customer_name: customer.name,
          lifecycle,
          next_action: nextActionKey(lifecycle),
          activation: activationSummary(activation),
        },
        audit: events ?? [],
      });
    }

    const { data: rows, error } = await admin
      .from("pending_payments")
      .select(
        "id, user_id, plan_id, plan_name, amount_cents, currency, network, method, status, status_enum, metadata, created_at, updated_at, confirmed_at",
      )
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS);
    if (error) return json({ error: "lookup_failed" }, 500);

    const payments = (rows ?? []) as PaymentRow[];
    const ids = payments.map((p) => p.id);
    const { data: activations } = ids.length
      ? await admin
        .from("plan_activations")
        .select("*")
        .in("payment_id", ids)
      : { data: [] as PlanActivationRow[] };
    const byPayment = new Map<string, PlanActivationRow>();
    for (const a of (activations ?? []) as PlanActivationRow[]) {
      byPayment.set(a.payment_id, a);
    }

    const userIds = [...new Set(payments.map((p) => p.user_id))];
    const customers = new Map<string, { email: string | null; name: string | null }>();
    await Promise.all(
      userIds.map(async (id) => {
        customers.set(id, await customerFor(admin, id));
      }),
    );

    const items = payments.map((payment) => {
      const activation = byPayment.get(payment.id) ?? null;
      const rawStatus = String(payment.status_enum ?? payment.status ?? "pending");
      const lifecycle = deriveLifecycle(rawStatus, activation?.status ?? null);
      const customer = customers.get(payment.user_id) ?? { email: null, name: null };
      return {
        ...payment,
        status: canonicalPaymentStatus(rawStatus),
        status_raw: rawStatus,
        customer_email: customer.email,
        customer_name: customer.name,
        lifecycle,
        next_action: nextActionKey(lifecycle),
        activation: activationSummary(activation),
      };
    });

    return json({ ok: true, payments: items });
  }

  // -------------------------------------------------------------------------
  // POST — perform one manual action.
  // -------------------------------------------------------------------------
  const parsed = await readJsonBody<Record<string, unknown>>(req);
  if (!parsed.ok) {
    return json(
      { error: parsed.error },
      parsed.error === "payload_too_large" ? 413 : 400,
    );
  }
  const paymentId = boundedString(parsed.value.paymentId, 64) ?? "";
  const action = parsed.value.action;
  const note = boundedString(parsed.value.note, 500) ?? "";
  if (!paymentId) return json({ error: "missing_payment_id" }, 400);
  if (!isOperatorAction(action)) return json({ error: "invalid_action" }, 400);

  const needsNote = action === "reject_payment" || action === "request_info" ||
    action === "suspend" || action === "disconnect";
  if (needsNote && !note) return json({ error: "note_required" }, 400);

  const { data: paymentData, error: paymentError } = await admin
    .from("pending_payments")
    .select(
      "id, user_id, plan_id, plan_name, amount_cents, currency, network, method, status, status_enum, metadata, created_at, updated_at, confirmed_at",
    )
    .eq("id", paymentId)
    .maybeSingle();
  if (paymentError) return json({ error: "lookup_failed" }, 500);
  if (!paymentData) return json({ error: "not_found" }, 404);
  const payment = paymentData as PaymentRow;
  const source = sourceForMethod(payment.method);
  const now = new Date().toISOString();
  const metadata = payment.metadata ?? {};

  const { data: activationData } = await admin
    .from("plan_activations")
    .select("*")
    .eq("payment_id", payment.id)
    .maybeSingle();
  const activation = (activationData as PlanActivationRow | null) ?? null;

  const fail = (error: string, status = 409, extra: Record<string, unknown> = {}) =>
    json({ ok: false, error, ...extra }, status);

  if (action === "approve_payment") {
    if (isConfirmablePaymentStatus(payment.status_enum ?? payment.status)) {
      return json({ ok: true, alreadyConfirmed: true, activation: activationSummary(activation) });
    }
    const raw = (payment.status_enum ?? payment.status ?? "").toLowerCase();
    if (!["pending_manual", "pending", "processing", "created"].includes(raw)) {
      return fail("invalid_transition", 409, { from: raw });
    }

    // Conditional on the status we read: two concurrent approvals cannot both
    // win, so the audit row and the activation happen exactly once.
    const { data: updated, error: updateError } = await admin
      .from("pending_payments")
      .update({
        status: "confirmed",
        status_enum: "confirmed",
        confirmed_at: now,
        metadata: {
          ...metadata,
          last_applied_status: "confirmed",
          manual_approved_by: ctx.user.id,
          manual_approved_at: now,
          ...(note ? { manual_approval_note: note } : {}),
        },
      })
      .eq("id", payment.id)
      .eq("status_enum", payment.status_enum ?? raw)
      .select("id")
      .maybeSingle();
    if (updateError) return json({ error: "update_failed" }, 500);
    if (!updated) {
      const { data: current } = await admin
        .from("pending_payments")
        .select("status, status_enum")
        .eq("id", payment.id)
        .maybeSingle();
      return json({
        ok: true,
        unchanged: true,
        status: current?.status_enum ?? current?.status ?? null,
      });
    }

    await audit(admin, {
      paymentTable: "pending_payments",
      paymentId: payment.id,
      userId: payment.user_id,
      actor: "operator",
      actorId: ctx.user.id,
      source,
      eventId: `operator:approve_payment:${payment.id}`,
      from: raw,
      to: "confirmed",
      reason: `Manual payment approved by operator ${ctx.user.id}${note ? `: ${note}` : ""}`,
    });

    const activated = await activatePlanFromVerifiedPayment({
      admin,
      payment: {
        id: payment.id,
        user_id: payment.user_id,
        plan_id: payment.plan_id,
        plan_name: payment.plan_name,
        amount_cents: payment.amount_cents,
        currency: payment.currency,
        method: payment.method,
        status_enum: "confirmed",
        metadata,
      },
      source,
      actor: "operator",
      actorId: ctx.user.id,
      reason: `Manual payment approved by operator ${ctx.user.id}`,
    });

    if (activated.activation) {
      await sendPaymentLifecycleEmail({
        admin,
        payment,
        template: "payment_received",
        activation: activated.activation,
      });
      await sendActivationEmailOnce({ admin, activation: activated.activation });
    }
    return json({
      ok: true,
      status: "confirmed",
      activation: activationSummary(activated.activation ?? null),
    });
  }

  if (action === "reject_payment") {
    const raw = (payment.status_enum ?? payment.status ?? "").toLowerCase();
    if (!["pending_manual", "pending", "processing", "created"].includes(raw)) {
      return fail("invalid_transition", 409, { from: raw });
    }
    const { data: updated, error } = await admin
      .from("pending_payments")
      .update({
        status: "rejected",
        status_enum: "rejected",
        metadata: {
          ...metadata,
          last_applied_status: "rejected",
          manual_rejected_by: ctx.user.id,
          manual_rejected_at: now,
          manual_rejection_note: note,
        },
      })
      .eq("id", payment.id)
      .eq("status_enum", payment.status_enum ?? raw)
      .select("id")
      .maybeSingle();
    if (error) return json({ error: "update_failed" }, 500);
    if (!updated) return json({ ok: true, unchanged: true, status: "rejected" });

    await audit(admin, {
      paymentTable: "pending_payments",
      paymentId: payment.id,
      userId: payment.user_id,
      actor: "operator",
      actorId: ctx.user.id,
      source,
      eventId: `operator:reject_payment:${payment.id}`,
      from: raw,
      to: "rejected",
      reason: `Manual payment rejected by operator ${ctx.user.id}: ${note}`,
    });
    await sendPaymentLifecycleEmail({ admin, payment, template: "payment_failed", note });
    return json({ ok: true, status: "rejected" });
  }

  if (action === "request_info") {
    const raw = (payment.status_enum ?? payment.status ?? "").toLowerCase();
    if (raw !== "pending_manual") {
      return fail("invalid_transition", 409, { from: raw });
    }
    const { error } = await admin
      .from("pending_payments")
      .update({
        metadata: {
          ...metadata,
          info_requested_by: ctx.user.id,
          info_requested_at: now,
          info_request_note: note,
        },
      })
      .eq("id", payment.id);
    if (error) return json({ error: "update_failed" }, 500);

    await audit(admin, {
      paymentTable: "pending_payments",
      paymentId: payment.id,
      userId: payment.user_id,
      actor: "operator",
      actorId: ctx.user.id,
      source,
      eventId: `operator:request_info:${payment.id}:${now}`,
      from: raw,
      to: raw,
      reason: `More information requested by operator ${ctx.user.id}: ${note}`,
    });
    await sendPaymentLifecycleEmail({
      admin,
      payment,
      template: "payment_pending_manual_review",
      note,
    });
    return json({ ok: true, status: raw, infoRequested: true });
  }

  if (action === "activate") {
    if (!isConfirmablePaymentStatus(payment.status_enum ?? payment.status)) {
      return fail("payment_not_confirmed", 402);
    }
    const activated = await activatePlanFromVerifiedPayment({
      admin,
      payment: {
        id: payment.id,
        user_id: payment.user_id,
        plan_id: payment.plan_id,
        plan_name: payment.plan_name,
        amount_cents: payment.amount_cents,
        currency: payment.currency,
        method: payment.method,
        status_enum: "confirmed",
        metadata,
      },
      source,
      actor: "operator",
      actorId: ctx.user.id,
      reason: `Activated after verified payment by operator ${ctx.user.id}`,
    });
    if (!activated.ok) return fail(activated.error ?? "activation_failed", 500);
    if (activated.activation) {
      await sendActivationEmailOnce({ admin, activation: activated.activation });
    }
    return json({
      ok: true,
      activation: activationSummary(activated.activation ?? null),
      alreadyActive: activated.alreadyActive === true,
    });
  }

  // suspend | disconnect | reinstate operate on the activation record.
  if (!activation) return json({ error: "activation_not_found" }, 404);
  if (action === "suspend" || action === "disconnect" || action === "reinstate") {
    const target: "active" | "suspended" | "disconnected" = action === "reinstate"
      ? "active"
      : action === "suspend"
      ? "suspended"
      : "disconnected";
    const result = await setActivationStatus({
      admin,
      activationId: activation.id,
      status: target,
      reason: note || `Operator ${action} by ${ctx.user.id}`,
      actor: "operator",
      actorId: ctx.user.id,
      source,
      event: action,
    });
    if (!result.ok) return json({ error: result.error ?? "update_failed" }, 500);
    if (action === "suspend") {
      await sendPaymentLifecycleEmail({
        admin,
        payment,
        template: "account_suspended",
        note,
        activation: result.activation ?? activation,
      });
    }
    return json({ ok: true, activation: activationSummary(result.activation ?? activation) });
  }

  return json({ error: "invalid_action" }, 400);
});
