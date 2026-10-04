import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  makeServiceClient,
  PaymentError,
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
  resolveCryptoAddress,
  testCryptoAddress,
} from "../_shared/payment-destinations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Crypto Checkout.
 *
 * Behavior:
 *  1. Gate: PAYMENTS_ENABLED || TEST_PAYMENT_MODE must be on, else 503.
 *  2. Destination: in TEST mode returns the safe placeholder wallet; in LIVE
 *     mode resolves the real address from the network's CRYPTO_DESTINATION_*
 *     secret and fails closed with 503 if it is not configured.
 *  3. Inserts a pending_payments row with:
 *       - user_id        = authenticated user id
 *       - plan_id/name   = canonical from PLANS
 *       - amount_cents   = canonical from PLANS (browser value ignored)
 *       - network        = canonical from CRYPTO_NETWORKS
 *       - method         = "crypto"
 *       - status_enum    = "pending"
 *       - idempotency_key= from the browser, required, ≥8 chars
 *       - metadata.is_test = whether test mode is on
 *  4. Writes one row to the audit log via logPaymentEvent.
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
  const testMode = isTestPaymentMode();

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
  // Destination — fail closed in LIVE mode when the network address is unset.
  // Never hand a live payer the test placeholder wallet.
  // -------------------------------------------------------------------------
  const depositAddress = testMode
    ? testCryptoAddress()
    : resolveCryptoAddress(validated.network?.id ?? "");
  if (!depositAddress) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "payment_destination_unconfigured",
        mode: "production",
        message:
          `No deposit address is configured for network ${validated.network?.id ?? "unknown"}. Set ${validated.network?.addressEnv ?? "the matching CRYPTO_DESTINATION_* secret"}.`,
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // -------------------------------------------------------------------------
  // Insert (or return existing) pending_payments row.
  // Status is "pending" on insert; this handler NEVER transitions to
  // confirmed. Only test-confirm-payment (with TEST_CONFIRM_SECRET) does.
  // -------------------------------------------------------------------------
  const plan = getPlan(validated.planId);
  const networkId = validated.network?.id ?? null;

  const { payment } = await upsertPendingPayment(admin, {
    userId: validated.userId,
    planId: validated.planId,
    planName: plan.name,
    amountCents: validated.amountCents,
    currency: validated.currency,
    network: networkId,
    method: "crypto",
    idempotencyKey: validated.idempotencyKey,
    metadata: { ...validated.metadata, is_test: testMode },
  });

  notifyOwnerInBackground({
    type: "compra",
    subject: `Pedido criado (cripto) — plano ${plan.name}`,
    replyTo: validated.userEmail,
    data: {
      plano: plan.name,
      email: validated.userEmail,
      metodo: "crypto",
      rede: networkId,
      valor: (validated.amountCents / 100).toFixed(2),
      payment_id: payment.id,
      status: "pending",
      origem: "crypto-checkout",
    },
    idempotencyKey: `crypto-order:${payment.id}`,
  });

  return checkoutResponse(payment, depositAddress, testMode);
});

function checkoutResponse(
  payment: unknown,
  wallet: string,
  testMode: boolean,
) {
  const body: Record<string, unknown> = {
    ok: true,
    mode: testMode ? "test" : "production",
    test_mode: testMode,
    deposit_address: wallet,
    warnings: testMode
      ? [
        "TEST MODE. No real wallet is configured.",
        "Sending real funds to this address will not result in service activation.",
        "Confirmation requires the separate test-admin secret.",
      ]
      : [],
    payment: payment ?? null,
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
