// ============================================================================
// Crypto Checkout — OPTION A
//
// Behavior contract:
//   1. Never trusts plan/amount/currency/network from the browser.
//   2. Rejects invalid input with HTTP 400.
//   3. Honors PAYMENTS_ENABLED (fail-closed: missing/not-"true" → test response,
//      no row inserted).
//   4. Writes to pending_payments with status_enum = 'pending'.
//      The row is NOT inserted when PAYMENTS_ENABLED is not "true".
//   5. Idempotent on (user_id, idempotency_key).
//   6. NEVER creates a services row. Service activation requires a separate,
//      authorized server-side path (crypto-confirmation or future auto-confirm).
//   7. The returned deposit address is a test placeholder. Production wallet
//      addresses must be configured via Deno env variables.
//   8. Activation is triggered ONLY by:
//        (a) crypto-confirmation (admin, requires ADMIN_SECRET)
//        (b) (future) crypto-auto-confirm (service-role only, not scheduled)
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  PaymentError,
  validateCheckoutInput,
  upsertPendingPayment,
  makeServiceClient,
} from "../_shared/option_a/payments.ts";
import { TEST_PLACEHOLDER_WALLET } from "../_shared/option_a/plans.ts";

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
        ok:             true,
        mode:           "test",
        reason:         "PAYMENTS_ENABLED is not set to 'true'",
        payment:        null,
        depositAddress: TEST_PLACEHOLDER_WALLET,
        warnings: [
          "Payments are disabled. No row was inserted.",
          "This is a safe test placeholder. No real crypto required.",
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
      network:         (body as any)?.network,
      idempotencyKey:   (body as any)?.idempotencyKey,
      metadata:         { method: "crypto" },
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
  const { getPlan } = await import("../_shared/option_a/plans.ts");
  const plan = getPlan(validated.planId);

  const networkId = validated.network?.id ?? null;

  const { payment, created } = await upsertPendingPayment(admin, {
    userId:      validated.userId,
    planId:      validated.planId,
    planName:    plan.name,
    amountCents:  validated.amountCents,
    currency:     validated.currency,
    network:      networkId,
    method:       "crypto",
    idempotencyKey: validated.idempotencyKey,
    metadata:     validated.metadata,
  });

  // -------------------------------------------------------------------------
  // NEVER create a services row here.
  // Service activation requires a separate, authorized server-side path.
  // -------------------------------------------------------------------------

  return new Response(
    JSON.stringify({
      ok:             true,
      mode:           isPaymentsEnabled() ? "production" : "test",
      payment: {
        id:           payment.id,
        status:       payment.status_enum,
        planId:       validated.planId,
        planName:     plan.name,
        amountCents:  payment.amount_cents,
        currency:     payment.amount_cents != null ? "USD" : null,
        network:      networkId,
        created,
      },
      depositAddress: TEST_PLACEHOLDER_WALLET,
      warnings: [
        "This is a test placeholder address. No real crypto required.",
        "Sending real funds to this address will not result in service activation.",
        "Service activation requires an authorized server-side confirmation.",
      ],
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});