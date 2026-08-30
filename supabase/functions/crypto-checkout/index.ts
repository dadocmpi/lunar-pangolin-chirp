import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  PaymentError,
  validateCheckoutInput,
  upsertPendingPayment,
  makeServiceClient,
} from "../_shared/option_a/payments.ts";
import { getPlan, getCryptoNetwork, TEST_PLACEHOLDER_WALLET } from "../_shared/option_a/plans.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Crypto Checkout — TEST MODE.
 *
 * Behavior:
 *  1. Reads TEST_PAYMENT_MODE; if not "true", returns 200 with mode="test"
 *     and the safe test wallet placeholder. No row is inserted.
 *  2. If TEST_PAYMENT_MODE is "true", inserts a pending_payments row with:
 *       - user_id        = authenticated user id
 *       - plan_id/name   = canonical from PLANS
 *       - amount_cents   = canonical from PLANS (browser value ignored)
 *       - network        = canonical from CRYPTO_NETWORKS
 *       - method         = "crypto"
 *       - status_enum    = "pending"
 *       - idempotency_key= from the browser, required, ≥8 chars
 *       - metadata.is_test = true
 *  3. Writes one row to the audit log via logPaymentEvent.
 *  4. Returns the test wallet placeholder. Production wallets must be
 *     configured via Deno env (TEST_PLACEHOLDER_WALLET is the literal
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
    return safeTestResponse(null, TEST_PLACEHOLDER_WALLET, "TEST_PAYMENT_MODE is not 'true'");
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
      network: b.network,
      idempotencyKey: b.idempotencyKey,
      metadata: { method: "crypto", is_test: true },
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
  // Status is "pending" on insert; this handler NEVER transitions to
  // confirmed. Only test-confirm-payment (with TEST_CONFIRM_SECRET) does.
  // -------------------------------------------------------------------------
  const plan = getPlan(validated.planId);
  const networkId = validated.network?.id ?? null;

  const { payment, created } = await upsertPendingPayment(admin, {
    userId: validated.userId,
    planId: validated.planId,
    planName: plan.name,
    amountCents: validated.amountCents,
    currency: validated.currency,
    network: networkId,
    method: "crypto",
    idempotencyKey: validated.idempotencyKey,
    metadata: { ...validated.metadata, is_test: true },
  });

  return safeTestResponse(payment, TEST_PLACEHOLDER_WALLET, null);
});

function safeTestResponse(payment: unknown, wallet: string, reason: string | null) {
  const body: Record<string, unknown> = {
    ok: true,
    mode: "test",
    test_mode: true,
    deposit_address: wallet,
    warnings: [
      "TEST MODE. No real wallet is configured.",
      "Sending real funds to this address will not result in service activation.",
      "Confirmation requires the separate test-admin secret.",
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