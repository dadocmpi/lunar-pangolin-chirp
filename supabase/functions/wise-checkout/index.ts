// ============================================================================
// Wise Checkout — OPTION A
//
// Behavior contract:
//   1. Never trusts plan/amount/currency/network from the browser.
//   2. Rejects invalid input with HTTP 400.
//   3. Honors PAYMENTS_ENABLED (fail-closed: missing/not-"true" → test response,
//      no row inserted).
//   4. Writes to pending_payments with status_enum = 'pending_manual'.
//      The row is NOT inserted when PAYMENTS_ENABLED is not "true".
//   5. Idempotent on (user_id, idempotency_key).
//   6. NEVER creates a services row. Service activation requires a separate,
//      authorized admin path.
//   7. The returned bank details are test placeholders. Production bank
//      details must be configured via Deno env variables.
//   8. The UI checkbox confirms intent only; it does NOT mark the payment
//      as confirmed or activate a service on the server.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  PaymentError,
  validateCheckoutInput,
  upsertPendingPayment,
  transitionPayment,
  makeServiceClient,
} from "../_shared/option_a/payments.ts";
import { TEST_PLACEHOLDER_BANK } from "../_shared/option_a/plans.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// PAYMENTS_ENABLED gate
// ---------------------------------------------------------------------------

function isPaymentsEnabled(): boolean {
  const val = Deno.env.get("PAYMENTS_ENABLED");
  return val === "true";
}

// ---------------------------------------------------------------------------
// Test-mode bank details (never a real bank account)
// ---------------------------------------------------------------------------

const TEST_BANK = {
  holderName:   "TEST HOLDER — DO NOT TRANSFER REAL FUNDS",
  bankName:      "TEST BANK",
  address:       "123 Test Street, Test City, TC 00000",
  accountNumber: "TEST-ACCOUNT-0000",
  routingNumber: "TEST-ROUTING-0000",
  swift:         "TESTSWIFTXX",
};

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

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
  // PAYMENTS_ENABLED gate — fail-closed
  // -------------------------------------------------------------------------
  if (!isPaymentsEnabled()) {
    return new Response(
      JSON.stringify({
        ok:           true,
        mode:         "test",
        reason:       "PAYMENTS_ENABLED is not set to 'true'",
        payment:      null,
        bankDetails:  TEST_BANK,
        warnings: [
          "Payments are disabled. No row was inserted.",
          "This is a safe test placeholder. No real funds required.",
          "Set PAYMENTS_ENABLED='true' in Supabase Edge Function Secrets to enable.",
        ],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
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

  // -------------------------------------------------------------------------
  // Validate (server-only — browser values are never trusted)
  // -------------------------------------------------------------------------
  let validated: ReturnType<typeof validateCheckoutInput>;
  try {
    validated = validateCheckoutInput({
      planId:          (body as any)?.planId,
      clientCurrency:   (body as any)?.currency,
      network:         null, // Wise is not a crypto network
      idempotencyKey:   (body as any)?.idempotencyKey,
      metadata:         { method: "wise" },
    });
    validated.userId    = user.id;
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
  // Insert (or return existing) pending_payments row
  // -------------------------------------------------------------------------
  const plan = await import("../_shared/option_a/plans.ts").then((m) =>
    m.getPlan(validated.planId)
  );

  const { payment, created } = await upsertPendingPayment(admin, {
    userId:     validated.userId,
    planId:     validated.planId,
    planName:   plan.name,
    amountCents: validated.amountCents,
    currency:   validated.currency,
    network:    null,
    method:     "wise",
    idempotencyKey: validated.idempotencyKey,
    metadata:   validated.metadata,
  });

  // -------------------------------------------------------------------------
  // Wise always lands in pending_manual (never confirmed automatically)
  // -------------------------------------------------------------------------
  let finalPayment = payment;
  if (payment.status_enum === "pending") {
    finalPayment = await transitionPayment(admin, {
      paymentId:     payment.id,
      previousStatus: "pending",
      newStatus:     "pending_manual",
      actor:         "system",
      source:        "wise",
      eventId:       `wise:${validated.idempotencyKey}:pending_manual`,
      reason:        "wise_requires_manual_reconciliation",
    });
  }

  // -------------------------------------------------------------------------
  // NEVER create a services row here.
  // Service activation requires a separate, authorized admin path.
  // -------------------------------------------------------------------------

  return new Response(
    JSON.stringify({
      ok:       true,
      mode:     isPaymentsEnabled() ? "production" : "test",
      payment: {
        id:           finalPayment.id,
        status:       finalPayment.status_enum,
        planId:       validated.planId,
        planName:     plan.name,
        amountCents:  finalPayment.amount_cents,
        currency:     finalPayment.amount_cents != null
                       ? "USD"
                       : null,
        created,
      },
      bankDetails: TEST_BANK,
      warnings: [
        "This is a test placeholder. No real bank account is configured.",
        "Sending real funds to the address above will not result in service activation.",
        "Wise confirmation requires an authorized admin path.",
      ],
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});