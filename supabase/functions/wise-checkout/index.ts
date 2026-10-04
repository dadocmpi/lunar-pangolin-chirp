import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  makeServiceClient,
  PaymentError,
  transitionPayment,
  upsertPendingPayment,
  validateCheckoutInput,
} from "../_shared/option_a/payments.ts";
import { getPlan } from "../_shared/option_a/plans.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import {
  isPaymentsEnabled,
  isTestPaymentMode,
  paymentsDisabledBody,
} from "../_shared/payments-flag.ts";
import {
  resolveBankDetails,
  testBankDetails,
} from "../_shared/payment-destinations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Wise Checkout.
 *
 * Behavior:
 *  1. Gate: PAYMENTS_ENABLED || TEST_PAYMENT_MODE must be on, else 503.
 *  2. Destination: in TEST mode returns the safe placeholder bank; in LIVE
 *     mode resolves the real bank from secrets (WISE_*) and fails closed with
 *     503 if it is not configured.
 *  3. Inserts a pending_payments row with:
 *       - user_id        = authenticated user id
 *       - plan_id/name   = canonical from PLANS
 *       - amount_cents   = canonical from PLANS (browser value ignored)
 *       - method         = "wise"
 *       - status_enum    = "pending_manual"
 *       - idempotency_key= from the browser, required, ≥8 chars
 *       - metadata.is_test = whether test mode is on
 *  4. Writes one row to the audit log via the same helper as crypto.
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
  // Gate — single shared source of truth (PAYMENTS_ENABLED || TEST_PAYMENT_MODE)
  // -------------------------------------------------------------------------
  if (!isPaymentsEnabled()) {
    return new Response(JSON.stringify(paymentsDisabledBody()), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
  // Destination — fail closed in LIVE mode when no real bank is configured.
  // Never hand a live payer the test placeholder.
  // -------------------------------------------------------------------------
  const testMode = isTestPaymentMode();
  const bankDetails = testMode ? testBankDetails() : resolveBankDetails();
  if (!bankDetails) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "payment_destination_unconfigured",
        mode: "production",
        message:
          "No Wise bank account is configured. Set WISE_HOLDER_NAME, WISE_BANK_NAME and WISE_ACCOUNT_NUMBER (or WISE_IBAN).",
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

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
      metadata: { method: "wise", is_test: testMode },
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
    metadata: { ...validated.metadata, is_test: testMode },
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

  if (created) {
    notifyOwnerInBackground({
      type: "compra",
      subject: `Pedido criado (Wise) — plano ${plan.name}`,
      replyTo: validated.userEmail,
      data: {
        plano: plan.name,
        email: validated.userEmail,
        metodo: "wise",
        valor: (validated.amountCents / 100).toFixed(2),
        payment_id: payment.id,
        status: "pending_manual",
        origem: "wise-checkout",
      },
      idempotencyKey: `wise-order:${payment.id}`,
    });
  }

  return checkoutResponse(final, bankDetails, testMode);
});

function checkoutResponse(
  payment: unknown,
  bank: import("../_shared/payment-destinations.ts").BankDetails,
  testMode: boolean,
) {
  const body: Record<string, unknown> = {
    ok: true,
    mode: testMode ? "test" : "production",
    test_mode: testMode,
    bank_details: bank,
    warnings: testMode
      ? [
        "TEST MODE. No real bank account is configured.",
        "Sending real funds will not result in service activation.",
        "Wise confirmation requires an authorized test-admin path.",
      ]
      : [],
    payment: payment ?? null,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
