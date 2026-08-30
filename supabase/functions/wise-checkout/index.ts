import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  PaymentError,
  createPendingPayment,
  makeServiceClient,
  validateCheckoutInput,
} from "../_shared/payments.ts";
import { TEST_PLACEHOLDER_BANK } from "../_shared/plans.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Wise checkout — TEST MODE / COMING SOON.
 *
 * Behavior contract:
 *  1. Never trust plan/amount/currency/network from the browser.
 *  2. Reject invalid input with HTTP 400.
 *  3. Create a payments row with status = 'pending_manual'.
 *     (Wise is the only payment method that lands directly in
 *     pending_manual, because we have no Wise API or bank-feed integration.)
 *  4. Idempotent on (user_id, idempotency_key).
 *  5. NEVER create a services row. Wise requires manual reconciliation.
 *  6. The returned payment row reflects the actual canonical values
 *     (plan, amount, currency), not what the browser sent.
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

    // The browser is NEVER trusted.
    const validated = validateCheckoutInput({
      planId: (body as any)?.planId,
      clientAmountCents: (body as any)?.amountCents, // ignored
      clientCurrency: (body as any)?.currency,        // ignored
      network: null,                                  // Wise is not a crypto network
      idempotencyKey: (body as any)?.idempotencyKey,
      metadata: { method: "wise" },
    });
    validated.userId = user.id;
    validated.userEmail = user.email ?? null;

    const { payment, created } = await createPendingPayment(admin, {
      userId: validated.userId,
      planId: validated.planId,
      amountCents: validated.amountCents,
      currency: validated.currency,
      network: null,
      method: "wise",
      idempotencyKey: validated.idempotencyKey,
      metadata: validated.metadata,
    });

    // Force the status to pending_manual. We use the transition helper with
    // a no-op from->to? No — pending_manual is only reachable from
    // pending, processing, or pending_manual. The freshly-inserted row is
    // already 'pending', so we go pending -> pending_manual.
    if (payment.status === "pending") {
      const { transitionPayment } = await import("../_shared/payments.ts");
      await transitionPayment(admin, {
        paymentId: payment.id,
        previousStatus: "pending",
        newStatus: "pending_manual",
        actor: "system",
        source: "wise",
        eventId: `wise:${payment.idempotency_key}:manual`,
        reason: "wise_requires_manual_reconciliation",
      });
    }

    // Show the user only the test placeholder bank details, never real ones.
    return new Response(
      JSON.stringify({
        ok: true,
        mode: "test",
        message: "Wise payments are in TEST MODE. The page below shows a safe placeholder. Real bank reconciliation is not yet configured.",
        payment: {
          id: payment.id,
          status: "pending_manual",
          planId: payment.plan_id,
          amountCents: payment.amount_cents,
          currency: payment.currency,
          created: created,
        },
        bankDetails: {
          holderName: "TEST HOLDER — DO NOT TRANSFER REAL FUNDS",
          bankName: "TEST BANK",
          address: TEST_PLACEHOLDER_BANK,
          accountNumber: "TEST-ACCOUNT-0000",
          routingNumber: "TEST-ROUTING-0000",
          swift: "TESTSWIFTXX",
          reference: `payment:${payment.id}`,
        },
        warnings: [
          "This is a test placeholder. No real bank account is configured.",
          "Sending real funds to the address above will not result in service activation.",
          "Wise confirmation is manual; an admin must approve the payment.",
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