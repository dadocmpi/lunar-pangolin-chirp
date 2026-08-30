import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  PaymentError,
  createPendingPayment,
  makeServiceClient,
  validateCheckoutInput,
} from "../_shared/payments.ts";
import { CRYPTO_NETWORKS, TEST_PLACEHOLDER_WALLET } from "../_shared/plans.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Crypto checkout — TEST MODE.
 *
 * Behavior contract:
 *  1. Never trust plan/amount/currency/network from the browser.
 *  2. Reject invalid input with HTTP 400.
 *  3. Create a payments row with status = 'pending'.
 *  4. Idempotent on (user_id, idempotency_key).
 *  5. NEVER activate a service from the browser click.
 *  6. Activation is the responsibility of crypto-auto-confirm (server-side
 *     blockchain verification) — which is itself not wired to a scheduler
 *     yet. See docs.
 *  7. The returned payment row reflects canonical values, not browser values.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new PaymentError("unauthorized");
    const token = auth.replace("Bearer ", "");

    const admin = makeServiceClient();
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) throw new PaymentError("unauthorized");
    const user = userData.user;

    let body: unknown;
    try { body = await req.json(); } catch { throw new PaymentError("invalid_json"); }

    const validated = validateCheckoutInput({
      planId: (body as any)?.planId,
      clientAmountCents: (body as any)?.amountCents, // ignored
      clientCurrency: (body as any)?.currency,        // ignored
      network: (body as any)?.network,                // looked up in canonical table
      idempotencyKey: (body as any)?.idempotencyKey,
      metadata: { method: "crypto" },
    });
    if (!validated.network) throw new PaymentError("network_required");
    validated.userId = user.id;
    validated.userEmail = user.email ?? null;

    const { payment, created } = await createPendingPayment(admin, {
      userId: validated.userId,
      planId: validated.planId,
      amountCents: validated.amountCents,
      currency: validated.currency,
      network: validated.network.id,
      method: "crypto",
      idempotencyKey: validated.idempotencyKey,
      metadata: validated.metadata,
    });

    // Return a test placeholder address. The real address must be set via
    // Deno env (CRYPTO_DESTINATION_<NETWORK>) — never in this response.
    return new Response(
      JSON.stringify({
        ok: true,
        mode: "test",
        message: "Crypto payments are in TEST MODE. The address below is a safe placeholder. Real wallet monitoring is not yet configured.",
        payment: {
          id: payment.id,
          status: payment.status,
          planId: payment.plan_id,
          amountCents: payment.amount_cents,
          currency: payment.currency,
          network: payment.network,
          created: created,
        },
        depositAddress: TEST_PLACEHOLDER_WALLET,
        warnings: [
          "This is a test placeholder address. Sending real funds will not result in service activation.",
          "Activation requires independent server-side blockchain verification (auto-confirm) which is not yet scheduled.",
        ],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    if (err instanceof PaymentError) {
      return new Response(JSON.stringify({ error: err.code }), {
        status: err.code === "unauthorized" ? 401 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});