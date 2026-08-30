import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  PaymentError,
  activateServiceForPayment,
  makeServiceClient,
  transitionPayment,
} from "../_shared/payments.ts";
import { PaymentRow } from "../_shared/payments.ts";
import {
  CRYPTO_NETWORKS,
  CryptoNetworkId,
  getCryptoNetwork,
} from "../_shared/plans.ts";

/**
 * Crypto auto-confirm — NOT SCHEDULED.
 *
 * This function exists for the future scheduler (or admin test invocation)
 * to verify a pending crypto payment on-chain. It must NOT be wired to a
 * public cron or any user-facing action.
 *
 * Inputs (service-role only):
 *  - payment_id:  uuid
 *  - observed_amount_cents:  bigint
 *  - observed_network:       string
 *  - observed_tx_hash:       string
 *  - confirmations:          integer
 *  - source:                 "auto_confirm" | "admin" | "test"
 *
 * Rules:
 *  - amount tolerance: ±5% of canonical price
 *  - network must match the canonical network the payment was created on
 *  - confirmations must meet or exceed the network's minConfirmations
 *  - on success: pending -> processing -> confirmed, then activate service
 *  - on failure: pending -> pending_manual (or rejected, for the
 *    "no_payment_observed" case)
 *  - this function never trusts a value sent by an unauthenticated caller
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Hard guard: this endpoint must be called with the service role key.
  // We do not accept a user JWT.
  const auth = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!auth || auth !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: "service_role_required" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const paymentId = body?.payment_id;
    const observedAmountCents = Number(body?.observed_amount_cents);
    const observedNetwork = body?.observed_network;
    const observedTxHash = body?.observed_tx_hash;
    const confirmations = Number(body?.confirmations ?? 0);
    const source = (body?.source ?? "auto_confirm") as "auto_confirm" | "admin" | "test";

    if (!paymentId) throw new PaymentError("payment_id_required");
    if (!Number.isFinite(observedAmountCents) || observedAmountCents <= 0) {
      throw new PaymentError("observed_amount_required");
    }
    if (!observedNetwork) throw new PaymentError("observed_network_required");
    if (!observedTxHash) throw new PaymentError("observed_tx_hash_required");
    if (!Number.isFinite(confirmations) || confirmations < 0) {
      throw new PaymentError("confirmations_required");
    }

    const admin = makeServiceClient();
    const { data: payment, error: pErr } = await admin
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();
    if (pErr || !payment) throw new PaymentError("payment_not_found");
    const p = payment as PaymentRow;

    // Only process payments that are still in pending/processing.
    if (!["pending", "processing"].includes(p.status)) {
      return new Response(
        JSON.stringify({ ok: false, reason: `payment_in_state_${p.status}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const network = getCryptoNetwork(observedNetwork);
    const minConfirmations = network.minConfirmations;

    // 1. Network must match the canonical network the payment was created on.
    if (p.network !== network.id) {
      await transitionPayment(admin, {
        paymentId: p.id,
        previousStatus: p.status,
        newStatus: "rejected",
        actor: "auto_confirm",
        source: "crypto",
        eventId: `crypto:${observedTxHash}:network_mismatch`,
        reason: "network_mismatch",
      });
      return new Response(
        JSON.stringify({ ok: false, reason: "network_mismatch" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Amount tolerance: ±5%.
    const expected = p.amount_cents;
    const lower = Math.floor(expected * 0.95);
    const upper = Math.ceil(expected * 1.05);
    if (observedAmountCents < lower || observedAmountCents > upper) {
      await transitionPayment(admin, {
        paymentId: p.id,
        previousStatus: p.status,
        newStatus: "pending_manual",
        actor: "auto_confirm",
        source: "crypto",
        eventId: `crypto:${observedTxHash}:amount_out_of_range`,
        reason: `amount_out_of_range:${observedAmountCents}:${lower}:${upper}`,
      });
      return new Response(
        JSON.stringify({ ok: false, reason: "amount_out_of_range" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Confirmations threshold.
    if (confirmations < minConfirmations) {
      // Stay in pending/processing — just report.
      return new Response(
        JSON.stringify({
          ok: false,
          reason: "awaiting_confirmations",
          confirmations,
          minConfirmations,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Move pending -> processing -> confirmed.
    let current: PaymentRow = p;
    if (current.status === "pending") {
      current = await transitionPayment(admin, {
        paymentId: p.id,
        previousStatus: "pending",
        newStatus: "processing",
        actor: "auto_confirm",
        source: "crypto",
        eventId: `crypto:${observedTxHash}:processing`,
        reason: "auto_confirm_started",
      });
    }
    current = await transitionPayment(admin, {
      paymentId: p.id,
      previousStatus: current.status,
      newStatus: "confirmed",
      actor: "auto_confirm",
      source: source === "test" ? "crypto" : "crypto",
      eventId: `crypto:${observedTxHash}:confirmed`,
      reason: "verified_on_chain",
      verifiedAmountCents: observedAmountCents,
      verifiedNetwork: network.id,
      verifiedTxHash: observedTxHash,
    });

    // Activate service (idempotent via the unique partial index on services).
    const activation = await activateServiceForPayment(
      admin,
      current,
      "auto_confirm",
      "crypto",
      `crypto:${observedTxHash}:activated`,
    );

    return new Response(
      JSON.stringify({
        ok: true,
        paymentId: p.id,
        status: current.status,
        serviceActivation: activation,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    if (err instanceof PaymentError) {
      return new Response(JSON.stringify({ error: err.code }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};