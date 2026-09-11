import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  makeServiceClient,
  PaymentError,
  transitionPayment,
  upsertPendingPayment,
  validateCheckoutInput,
} from "../_shared/option_a/payments.ts";
import { getPlan, TEST_PLACEHOLDER_BANK } from "../_shared/option_a/plans.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Wise Checkout — TEST MODE.
 *
 * Behavior:
 *  1. Reads TEST_PAYMENT_MODE; if not "true", returns 200 with mode="test"
 *     and the safe test bank placeholder. No row is inserted.
 *  2. If TEST_PAYMENT_MODE is "true", inserts a pending_payments row with:
 *       - user_id        = authenticated user id
 *       - plan_id/name   = canonical from PLANS
 *       - amount_cents   = canonical from PLANS (browser value ignored)
 *       - method         = "wise"
 *       - status_enum    = "pending_manual"
 *       - idempotency_key= from the browser, required, ≥8 chars
 *       - metadata.is_test = true
 *  3. Writes one row to the audit log via the same helper as crypto.
 *  4. Returns the test bank placeholder. Production bank details must be
 *     configured via Deno env (TEST_PLACEHOLDER_BANK is the literal
 *     placeholder string used everywhere in this file).
 *  5. NEVER sets status to "confirmed". NEVER creates a services row.
 *  6. Idempotent on (user_id, idempotency_key).
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

  // -------------------------------------------------------------------------
  // Gate
  // -------------------------------------------------------------------------
  const testMode = Deno.env.get("TEST_PAYMENT_MODE") === "true";
  if (!testMode) {
    return safeTestResponse(
      null,
      TEST_PLACEHOLDER_BANK,
      "TEST_PAYMENT_MODE is not 'true'",
    );
  }

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------
  const auth = req.headers.get("Authorization");
  if (!auth) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = auth.replace("Bearer ", "");

  const admin = makeServiceClient();
  const { data: userData, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const user = userData.user;

  // -------------------------------------------------------------------------
  // Parse body
  // -------------------------------------------------------------------------
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  // -------------------------------------------------------------------------
  // Validate (server-only — browser values are never trusted)
  // -------------------------------------------------------------------------
  let validated: ReturnType<typeof validateCheckoutInput>;
  try {
    validated = validateCheckoutInput({
      planId: b.planId,
      clientCurrency: b.currency,
      network: null,
      idempotencyKey: b.idempotencyKey,
      metadata: { method: "wise", is_test: true },
    });
    validated.userId = user.id;
    validated.userEmail = user.email ?? null;
  } catch (err) {
    if (err instanceof PaymentError) {
      return new Response(JSON.stringify({ error: err.code }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    throw err;
  }

  // -------------------------------------------------------------------------
  // Insert (or return existing) pending_payments row.
  // Status is always "pending" on insert. We immediately transition
  // pending -> pending_manual because Wise can never auto-confirm.
  // -------------------------------------------------------------------------
  const plan = getPlan(validated.planId);
  const { payment, created } = await upsertPendingPayment(admin, {
    userId: validated.userId,
    planId: validated.planId,
    planName: plan.name,
    amountCents: validated.amountCents,
    currency: validated.currency,
    network: null,
    method: "wise",
    idempotencyKey: validated.idempotencyKey,
    metadata: { ...validated.metadata, is_test: true },
  });

  // For new rows, force the status into pending_manual.
  // For existing rows, return whatever canonical state they are in.
  let final = payment;
  if (created && final.status_enum === "pending") {
    final = await transitionPayment(admin, {
      paymentId: payment.id,
      previousStatus: "pending",
      newStatus: "pending_manual",
      actor: "system",
      source: "wise",
      eventId: `wise:${validated.idempotencyKey}:pending_manual`,
      reason: "wise_requires_manual_reconciliation",
    });
  }

  return safeTestResponse(final, TEST_PLACEHOLDER_BANK, null);
});

function safeTestResponse(
  payment: unknown,
  bank: string,
  reason: string | null,
) {
  const body: Record<string, unknown> = {
    ok: true,
    mode: "test",
    test_mode: true,
    bank_details: {
      holder_name: "TEST HOLDER — DO NOT TRANSFER REAL FUNDS",
      bank_name: bank,
      account_number: "TEST-ACCOUNT-0000",
      routing_number: "TEST-ROUTING-0000",
      swift: "TESTSWIFTXX",
      reference: "Include your user email in the transfer reference",
    },
    warnings: [
      "TEST MODE. No real bank account is configured.",
      "Sending real funds will not result in service activation.",
      "Wise confirmation requires an authorized test-admin path.",
    ],
  };
  if (reason) body.reason = reason;
  if (payment) {
    body.payment = payment;
  } else {
    body.payment = null;
  }
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
