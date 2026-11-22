import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import { corsHeadersFor } from "../_shared/cors.ts";
import { readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import {
  isPaymentsEnabled,
  paymentsDisabledBody,
} from "../_shared/payments-flag.ts";
import { validateCheckoutSession } from "../_shared/stripe/sessionValidation.ts";
import {
  applyCheckoutConfirmation,
  flagCheckoutForManualReview,
} from "../_shared/stripe/confirmation.ts";

/**
 * Recover a lost `checkout.session.completed` event.
 *
 * The Stripe webhook is the source of truth, but webhook delivery can fail.
 * The success page calls this endpoint with the Checkout Session id; the
 * function retrieves the session directly from Stripe, verifies ownership,
 * applies the SAME validation as the webhook, and confirms the pending payment
 * idempotently. It never confirms on the browser's word alone.
 */

const STRIPE_API_VERSION = "2020-08-27";
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!isPaymentsEnabled()) {
    return new Response(JSON.stringify(paymentsDisabledBody()), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.substring(7);

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (limiter.hit(`ip:${clientIp(req)}`) || limiter.hit(`user:${user.id}`)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsedBody = await readJsonBody<{
    sessionId?: string;
    session_id?: string;
  }>(req);
  if (!parsedBody.ok) {
    return new Response(JSON.stringify({ error: parsedBody.error }), {
      status: parsedBody.error === "payload_too_large" ? 413 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const sessionId = parsedBody.value.sessionId ?? parsedBody.value.session_id;
  if (!sessionId || typeof sessionId !== "string") {
    return new Response(JSON.stringify({ error: "session_id_required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Locate the caller's pending payment for this session. Service role, but
  // explicitly scoped by user_id and the session id stored at checkout time.
  const { data: pendingPayments, error: listError } = await supabase
    .from("pending_payments")
    .select("id, user_id, plan_id, amount_cents, currency, metadata, status_enum")
    .eq("user_id", user.id)
    .eq("method", "stripe");

  if (listError) {
    console.error("[stripe-reconcile] pending payment lookup failed", listError);
    return new Response(JSON.stringify({ error: "db_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const pendingPayment = (pendingPayments ?? []).find((row) => {
    const meta = (row.metadata as Record<string, unknown> | null) ?? {};
    return meta.stripe_session_id === sessionId;
  });

  if (!pendingPayment) {
    return new Response(JSON.stringify({ error: "payment_not_found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (pendingPayment.status_enum === "confirmed") {
    return new Response(
      JSON.stringify({ ok: true, status: "confirmed", reconciled: false }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Retrieve the authoritative session from Stripe.
  const stripeRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${
      encodeURIComponent(sessionId)
    }`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Stripe-Version": STRIPE_API_VERSION,
      },
    },
  );

  if (!stripeRes.ok) {
    console.error("[stripe-reconcile] Stripe retrieve failed", stripeRes.status);
    return new Response(JSON.stringify({ error: "stripe_error" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const session = await stripeRes.json();
  const sessionMeta = (session.metadata ?? {}) as Record<string, unknown>;
  const metaPendingId = typeof sessionMeta.pending_payment_id === "string"
    ? sessionMeta.pending_payment_id
    : null;
  if (metaPendingId && metaPendingId !== pendingPayment.id) {
    return new Response(JSON.stringify({ error: "session_mismatch" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Not paid yet — nothing to confirm. The success page keeps polling.
  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return new Response(
      JSON.stringify({
        ok: true,
        status: "pending",
        reconciled: false,
        reason: "not_paid",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const applicationId = typeof sessionMeta.application_id === "string"
    ? sessionMeta.application_id
    : (typeof (pendingPayment.metadata as Record<string, unknown> | null)
        ?.application_id === "string"
      ? (pendingPayment.metadata as Record<string, unknown>).application_id as string
      : null);

  if (!applicationId) {
    return new Response(JSON.stringify({ error: "missing_application" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id, user_id, plan_key, full_name, email, country")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (appError || !application) {
    return new Response(JSON.stringify({ error: "application_not_found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const eventId = `reconcile:${sessionId}`;
  const validation = validateCheckoutSession({
    session,
    pendingPayment,
    applicationPlanKey: application.plan_key,
  });

  if (!validation.ok) {
    // A definitive mismatch must not confirm. Flag it for an operator; a
    // transient "not paid" was already handled above.
    await flagCheckoutForManualReview({
      supabase,
      pendingPayment,
      eventId,
      reason: `reconcile_validation_failed:${validation.code ?? "unknown"}`,
    });
    return new Response(
      JSON.stringify({
        ok: true,
        status: "pending_manual",
        reconciled: false,
        reason: validation.code ?? "validation_failed",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const applied = await applyCheckoutConfirmation({
    supabase,
    pendingPayment,
    applicationId,
    session,
    eventId,
    reason: "Payment confirmed via Stripe session reconciliation (webhook recovery)",
  });

  if (!applied.ok) {
    return new Response(JSON.stringify({ error: "reconcile_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!applied.alreadyConfirmed) {
    const finalApplication = applied.application ?? application;
    // Mirror the webhook's operator notification. Fire-and-forget.
    try {
      await fetch(`${supabaseUrl}/functions/v1/operator-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          paymentId: pendingPayment.id,
          applicationId,
          userId: pendingPayment.user_id ?? user.id,
          customerName: finalApplication?.full_name ?? null,
          customerEmail: finalApplication?.email ?? null,
          customerCountry: finalApplication?.country ?? null,
          plan: finalApplication?.plan_key ?? null,
          amount: typeof session.amount_total === "number"
            ? session.amount_total
            : null,
          currency: session.currency ?? "usd",
          method: "stripe",
          confirmationTimestamp: new Date().toISOString(),
        }),
      });
    } catch (notifyErr) {
      console.error(
        "[stripe-reconcile] operator notification failed",
        notifyErr,
      );
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      status: "confirmed",
      reconciled: !applied.alreadyConfirmed,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
