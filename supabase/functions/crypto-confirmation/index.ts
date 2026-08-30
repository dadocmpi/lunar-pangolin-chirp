// ============================================================================
// Crypto Confirmation — OPTION A
//
// Called by an admin when a crypto payment is verified on-chain.
// Called with a JSON body: { paymentId, txHash, adminSecret }
//
// Behavior contract:
//   1. Fails closed on missing ADMIN_SECRET (HTTP 500, no row mutation).
//   2. Fails closed on PAYMENTS_ENABLED not "true" (HTTP 503, no mutation).
//   3. Fails closed on mismatched adminSecret (HTTP 401, no mutation).
//   4. Updates pending_payments:
//        - legacy: status = 'confirmed', confirmed_at, tx_hash, account_id
//        - new:     status_enum = 'confirmed', verified_tx_hash, verified_network,
//                   verified_amount_cents
//   5. Inserts a services row with plan_name (canonical column).
//   6. Logs every action to payment_audit_log via log_payment_event RPC.
//   7. Idempotent via the unique partial index on services.
//   8. NOT scheduled. No wallet monitor. No cron. Requires manual admin call.
//   9. Hard-coded ADMIN_SECRET fallback is REMOVED.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  makeServiceClient,
  transitionPayment,
  activateServiceForPayment,
  readPendingPaymentForUser,
} from "../_shared/option_a/payments.ts";
import { logPaymentEvent } from "../_shared/option_a/audit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const COMPANY_EMAIL = "marketsbraxel@ouvidor.net";

// ---------------------------------------------------------------------------
// Gate helpers — fail-closed
// ---------------------------------------------------------------------------

function isPaymentsEnabled(): boolean {
  return Deno.env.get("PAYMENTS_ENABLED") === "true";
}

function getAdminSecret(): string {
  const val = Deno.env.get("ADMIN_SECRET");
  if (!val) {
    throw new Error("ADMIN_SECRET environment variable is not set");
  }
  return val;
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
        error:   "payments_disabled",
        message:  "PAYMENTS_ENABLED is not set to 'true'. No payment was modified.",
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // -------------------------------------------------------------------------
  // Parse body
  // -------------------------------------------------------------------------
  let body: {
    paymentId?: string;
    txHash?: string;
    adminSecret?: string;
    network?: string;
    amountCents?: number;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { paymentId, txHash, adminSecret, network, amountCents } = body;

  if (!paymentId || !txHash || !adminSecret) {
    return new Response(
      JSON.stringify({ error: "missing_required_fields" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // -------------------------------------------------------------------------
  // ADMIN_SECRET gate — fail-closed (no fallback secret)
  // -------------------------------------------------------------------------
  let adminSecretValue: string;
  try {
    adminSecretValue = getAdminSecret();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[crypto-confirmation] ADMIN_SECRET not configured:", err);
    return new Response(
      JSON.stringify({ error: "server_misconfigured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (adminSecret !== adminSecretValue) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // -------------------------------------------------------------------------
  // Read the payment (service role, bypasses RLS)
  // -------------------------------------------------------------------------
  const admin = makeServiceClient();

  // Find the payment by its legacy 'id' column
  const { data: paymentRaw, error: fetchErr } = await admin
    .from("pending_payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (fetchErr || !paymentRaw) {
    return new Response(JSON.stringify({ error: "payment_not_found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payment = paymentRaw as any;
  const currentStatus: any = payment.status_enum ?? "pending";

  // -------------------------------------------------------------------------
  // Idempotency: if already confirmed, return success
  // -------------------------------------------------------------------------
  if (currentStatus === "confirmed") {
    return new Response(
      JSON.stringify({
        ok:          true,
        idempotent:  true,
        message:     "Payment already confirmed.",
        paymentId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // -------------------------------------------------------------------------
  // Transition pending → processing → confirmed
  // -------------------------------------------------------------------------
  let confirmed = await transitionPayment(admin, {
    paymentId:     payment.id,
    previousStatus: currentStatus,
    newStatus:     "processing",
    actor:         "admin",
    source:        "crypto",
    eventId:       `confirm:${txHash}:processing`,
    reason:        "admin_manual_confirmation_started",
  });

  confirmed = await transitionPayment(admin, {
    paymentId:     confirmed.id,
    previousStatus: "processing",
    newStatus:     "confirmed",
    actor:         "admin",
    source:        "crypto",
    eventId:       `confirm:${txHash}:confirmed`,
    reason:        "admin_verified_on_chain",
    verifiedAmountCents: amountCents ?? confirmed.amount_cents,
    verifiedNetwork:    network ?? confirmed.network,
    verifiedTxHash:     txHash,
  });

  // Also update the legacy text columns (for backward compatibility)
  await admin
    .from("pending_payments")
    .update({
      status:        "confirmed",
      confirmed_at:   new Date().toISOString(),
      tx_hash:       txHash,
      account_id:    `ACC-${Math.floor(100000 + Math.random() * 900000)}`,
    })
    .eq("id", confirmed.id);

  // -------------------------------------------------------------------------
  // Activate service (idempotent via unique partial index)
  // -------------------------------------------------------------------------
  const activation = await activateServiceForPayment(
    admin,
    confirmed as any,
    "admin",
    "crypto",
    `confirm:${txHash}:activated`,
  );

  // -------------------------------------------------------------------------
  // Log to audit
  // -------------------------------------------------------------------------
  await logPaymentEvent(admin, {
    paymentId: confirmed.id,
    actor:     "admin",
    source:    "crypto",
    eventId:    `confirm:${txHash}:admin_action`,
    previousStatus: currentStatus,
    newStatus: "confirmed",
    reason:    `admin confirmed payment: tx=${txHash}, activated=${activation.activated}`,
  });

  // -------------------------------------------------------------------------
  // Email notification to user (Resend, optional)
  // -------------------------------------------------------------------------
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (resendApiKey && payment.user_id) {
    // Fetch user email
    const { data: profile } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", payment.user_id)
      .single();

    const userEmail = profile?.email;
    if (userEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from:    "Braxel Markets <noreply@braxelmarkets.com>",
          to:      userEmail,
          subject: "Payment Confirmed — Braxel Markets",
          html:    `<p>Your crypto payment has been confirmed. Your trading account is now active.</p>`,
          text:    "Your crypto payment has been confirmed. Your trading account is now active.",
        }),
      }).catch((e) =>
        // eslint-disable-next-line no-console
        console.error("[crypto-confirmation] email send failed:", e)
      );
    }
  }

  return new Response(
    JSON.stringify({
      ok:          true,
      paymentId:   confirmed.id,
      status:      confirmed.status_enum,
      activated:   activation.activated,
      serviceId:   activation.serviceId,
      reason:      activation.reason,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});