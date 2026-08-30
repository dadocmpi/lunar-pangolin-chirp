import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  PaymentError,
  makeServiceClient,
  transitionPayment,
  readPendingPaymentForUser,
} from "../_shared/option_a/payments.ts";
import { getPlan, type PaymentStatus } from "../_shared/option_a/plans.ts";
import { logPaymentEvent } from "../_shared/option_a/audit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Test-Only Admin Confirmation.
 *
 * Hard contracts:
 *  1. TEST_PAYMENT_MODE must be "true". If not, returns 503 immediately.
 *  2. TEST_CONFIRM_SECRET must be set in the Edge Function env. If not,
 *     returns 500. ADMIN_SECRET is NOT a fallback.
 *  3. The request must include { paymentId, testSecret, action } where
 *     action ∈ { "confirm", "reject" }.
 *  4. The payment row must have metadata.is_test === true. Otherwise 400.
 *  5. Confirmation is allowed only from the canonical pending states
 *     (pending or pending_manual). Already-confirmed rows are idempotent
 *     and return 200 with { idempotent: true }.
 *  6. A services row is inserted ONLY with metadata.is_test = true. The
 *     "managed_capital_label" is hard-coded to "TEST" so the dashboard
 *     can clearly label the service.
 *  7. The unique partial index on services (user_id, plan_id)
 *     WHERE activated = true AND is_test = true prevents duplicates.
 *  8. Every status transition writes a row to the audit log.
 */
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

  // ---------------------------------------------------------------------
  // Gate 1 — TEST_PAYMENT_MODE
  // ---------------------------------------------------------------------
  if (Deno.env.get("TEST_PAYMENT_MODE") !== "true") {
    return new Response(
      JSON.stringify({
        error: "test_mode_disabled",
        message: "TEST_PAYMENT_MODE is not 'true'. This endpoint is test-only.",
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // ---------------------------------------------------------------------
  // Gate 2 — TEST_CONFIRM_SECRET (no fallback to ADMIN_SECRET)
  // ---------------------------------------------------------------------
  const testSecretValue = Deno.env.get("TEST_CONFIRM_SECRET");
  if (!testSecretValue) {
    return new Response(
      JSON.stringify({
        error: "server_misconfigured",
        message: "TEST_CONFIRM_SECRET is not set. ADMIN_SECRET is never used as a fallback.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // ---------------------------------------------------------------------
  // Parse body
  // ---------------------------------------------------------------------
  let body: { paymentId?: string; testSecret?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { paymentId, testSecret, action } = body;
  if (!paymentId || !testSecret || !action) {
    return new Response(
      JSON.stringify({ error: "missing_required_fields" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (action !== "confirm" && action !== "reject") {
    return new Response(
      JSON.stringify({ error: "invalid_action", allowed: ["confirm", "reject"] }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (testSecret !== testSecretValue) {
    return new Response(
      JSON.stringify({ error: "unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // ---------------------------------------------------------------------
  // Load the payment
  // ---------------------------------------------------------------------
  const admin = makeServiceClient();
  const { data: payment, error: pErr } = await admin
    .from("pending_payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (pErr || !payment) {
    return new Response(
      JSON.stringify({ error: "payment_not_found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // ---------------------------------------------------------------------
  // Gate 3 — must be a test payment
  // ---------------------------------------------------------------------
  const isTest = (payment.metadata as Record<string, unknown> | null)?.is_test === true;
  if (!isTest) {
    return new Response(
      JSON.stringify({
        error: "not_a_test_payment",
        message: "This payment is not flagged as a test payment.",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const currentStatus: PaymentStatus = (payment.status_enum ?? "pending") as PaymentStatus;

  // ---------------------------------------------------------------------
  // Idempotency
  // ---------------------------------------------------------------------
  if (currentStatus === "confirmed" && action === "confirm") {
    return new Response(
      JSON.stringify({ ok: true, idempotent: true, status: "confirmed", paymentId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (currentStatus === "rejected" && action === "reject") {
    return new Response(
      JSON.stringify({ ok: true, idempotent: true, status: "rejected", paymentId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // ---------------------------------------------------------------------
  // Apply the transition
  // ---------------------------------------------------------------------
  const newStatus: PaymentStatus = action === "confirm" ? "confirmed" : "rejected";
  const eventId = `test-confirm:${paymentId}:${action}`;

  let updated;
  try {
    // For Wise (pending_manual), go directly pending_manual -> confirmed/rejected.
    // For Crypto (pending), go pending -> confirmed/rejected (state machine
    // allows pending -> confirmed only if "failed" is intermediate; here
    // we go via processing to honor the canonical machine).
    if (currentStatus === "pending_manual") {
      updated = await transitionPayment(admin, {
        paymentId: payment.id,
        previousStatus: "pending_manual",
        newStatus,
        actor: "admin",
        source: payment.method === "wise" ? "wise" : "crypto",
        eventId,
        reason: `test_admin_${action}`,
      });
    } else if (currentStatus === "pending") {
      // pending -> processing -> confirmed/rejected
      let cur = await transitionPayment(admin, {
        paymentId: payment.id,
        previousStatus: "pending",
        newStatus: "processing",
        actor: "admin",
        source: payment.method === "wise" ? "wise" : "crypto",
        eventId: `${eventId}:processing`,
        reason: `test_admin_${action}_started`,
      });
      updated = await transitionPayment(admin, {
        paymentId: cur.id,
        previousStatus: "processing",
        newStatus,
        actor: "admin",
        source: payment.method === "wise" ? "wise" : "crypto",
        eventId: `${eventId}:${newStatus}`,
        reason: `test_admin_${action}`,
      });
    } else {
      // Other states: blocked by the state machine in transitionPayment.
      return new Response(
        JSON.stringify({ error: "invalid_transition", from: currentStatus, to: newStatus }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    if (err instanceof PaymentError) {
      return new Response(
        JSON.stringify({ error: err.code, message: err.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    throw err;
  }

  // ---------------------------------------------------------------------
  // On confirm: create a TEST-only services row.
  // Idempotent via the unique partial index on (user_id, plan_id)
  // WHERE activated = true AND is_test = true.
  // ---------------------------------------------------------------------
  let activation: { activated: boolean; serviceId: string | null; reason: string } = {
    activated: false,
    serviceId: null,
    reason: "not_confirmed",
  };
  if (action === "confirm" && updated.status_enum === "confirmed") {
    const plan = getPlan(updated.plan_id ?? "starter");
    const accountId = `TEST-${updated.plan_id?.toString().toUpperCase().slice(0, 4) ?? "PLAN"}-${updated.id.slice(0, 8)}`;
    const balance = (updated.amount_cents ?? 0) / 100;

    const { data: svc, error: svcErr } = await admin
      .from("services")
      .insert({
        user_id: updated.user_id,
        plan_id: updated.plan_id,
        plan_name: updated.plan_name ?? plan.name,
        account_id: accountId,
        status: "Active",
        balance,
        source_payment_id: updated.id,
        activated: true,
        is_test: true,
        managed_capital_label: "TEST",
      })
      .select("id")
      .single();

    if (svcErr) {
      if (svcErr.code === "23505") {
        activation = { activated: false, serviceId: null, reason: "already_activated" };
      } else {
        activation = { activated: false, serviceId: null, reason: `db_error:${svcErr.message}` };
      }
    } else {
      activation = { activated: true, serviceId: svc.id, reason: "ok" };
    }
  }

  // ---------------------------------------------------------------------
  // Audit log
  // ---------------------------------------------------------------------
  await logPaymentEvent(admin, {
    paymentId: updated.id,
    actor: "admin",
    source: payment.method === "wise" ? "wise" : "crypto",
    eventId: `${eventId}:final`,
    previousStatus: currentStatus,
    newStatus: updated.status_enum ?? newStatus,
    reason: `test_admin_${action}:activation=${activation.reason}`,
  });

  return new Response(
    JSON.stringify({
      ok: true,
      test_mode: true,
      paymentId: updated.id,
      status: updated.status_enum,
      action,
      activation,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});