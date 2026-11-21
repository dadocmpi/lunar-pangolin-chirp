// ============================================================================
// stripe-reconcile — a safe, user-scoped retry path for a missing webhook.
//
// The browser supplies only a pending payment id (or nothing). The user comes
// from the JWT, the pending row is scoped to that user, and Stripe is queried
// server-side. Confirmation runs through the same verification helper as the
// webhook, so a redirect or a client claim can never mark a payment paid.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  isPaymentsEnabled,
  paymentsDisabledBody,
} from "../_shared/payments-flag.ts";
import { readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";
import {
  confirmFromCheckoutSession,
  confirmFromInvoicePaid,
  type ConfirmationResult,
} from "../_shared/stripe/confirmation.ts";
import {
  fetchCheckoutSession,
  fetchLatestInvoiceForSubscription,
} from "../_shared/stripe/api.ts";
import type {
  StripeCheckoutSessionLike,
  StripeInvoiceLike,
} from "../_shared/stripe/verification.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const PENDING_FIELDS =
  "id, user_id, plan_id, plan_name, amount_cents, currency, status, status_enum, metadata, created_at";

function metaString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  const json = (body: Record<string, unknown>, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  if (!isPaymentsEnabled()) return json(paymentsDisabledBody(), 503);

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return json({ error: "stripe_not_configured" }, 503);
  }

  if (limiter.hit(`ip:${clientIp(req)}`)) {
    return json({ error: "rate_limited" }, 429);
  }

  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) {
    return json({ error: "rate_limited" }, 429);
  }
  // requireUser returns the 2.45 client; the shared Stripe helpers use the
  // 2.99 type. Both are the same service-role client at runtime.
  const admin = ctx.admin as unknown as Parameters<
    typeof confirmFromCheckoutSession
  >[0];

  const parsed = await readJsonBody<{ paymentId?: string }>(req);
  if (!parsed.ok) {
    return json(
      { error: parsed.error },
      parsed.error === "payload_too_large" ? 413 : 400,
    );
  }

  const requestedId = typeof parsed.value.paymentId === "string"
    ? parsed.value.paymentId.trim()
    : "";

  let query = ctx.admin
    .from("pending_payments")
    .select(PENDING_FIELDS)
    .eq("user_id", ctx.user.id)
    .eq("method", "stripe")
    .order("created_at", { ascending: false })
    .limit(10);
  if (requestedId) query = query.eq("id", requestedId);

  const { data: rows, error } = await query;
  if (error) return json({ error: "lookup_failed" }, 500);
  if (!rows || rows.length === 0) return json({ error: "not_found" }, 404);

  const pending = rows[0] as {
    id: string;
    user_id: string;
    status?: string | null;
    status_enum?: string | null;
    metadata?: Record<string, unknown> | null;
  };

  const current = (pending.status_enum ?? pending.status ?? "").toLowerCase();
  if (current === "confirmed" || current === "payment_confirmed") {
    return json({ ok: true, status: "confirmed", paymentId: pending.id });
  }

  const metadata = pending.metadata ?? {};
  const sessionId = metaString(metadata, "stripe_session_id");
  if (sessionId) {
    const session = await fetchCheckoutSession<StripeCheckoutSessionLike>(
      sessionId,
      stripeSecretKey,
    );
    if (!session.ok) {
      return json(
        { error: "stripe_unavailable", retryable: true },
        session.status === 404 ? 404 : 502,
      );
    }
    const result = await confirmFromCheckoutSession(
      admin,
      stripeSecretKey,
      session.data,
      `reconcile:checkout:${session.data.id}`,
      ctx.user.id,
    );
    return resultResponse(result, pending.id, json);
  }

  const subscriptionId = metaString(metadata, "stripe_subscription_id");
  if (subscriptionId) {
    const invoice = await fetchLatestInvoiceForSubscription<StripeInvoiceLike>(
      subscriptionId,
      stripeSecretKey,
    );
    if (!invoice.ok) {
      return json(
        { error: "stripe_unavailable", retryable: true },
        invoice.status === 404 ? 404 : 502,
      );
    }
    const latest = invoice.data.data?.[0];
    if (!latest) {
      return json({ error: "no_invoice_found", paymentId: pending.id }, 409);
    }
    const result = await confirmFromInvoicePaid(
      admin,
      stripeSecretKey,
      latest,
      `reconcile:invoice:${latest.id}`,
      ctx.user.id,
    );
    return resultResponse(result, pending.id, json);
  }

  return json(
    {
      error: "payment_not_verifiable",
      reason: "no stripe_session_id or stripe_subscription_id",
      paymentId: pending.id,
    },
    409,
  );
});

function resultResponse(
  result: ConfirmationResult,
  paymentId: string,
  json: (body: Record<string, unknown>, status?: number) => Response,
): Response {
  if (result.status === "confirmed" || result.status === "already_confirmed") {
    return json({
      ok: true,
      status: "confirmed",
      paymentId: result.paymentId ?? paymentId,
    });
  }
  if (result.status === "already_processed" || result.status === "no_change") {
    return json({
      ok: true,
      status: "unchanged",
      paymentId: result.paymentId ?? paymentId,
    });
  }
  if (result.status === "retryable_error") {
    console.error("[stripe-reconcile] retryable", {
      paymentId,
      reason: result.reason,
    });
    return json({ error: "stripe_unavailable", retryable: true }, 502);
  }
  if (result.status === "not_found") {
    console.error("[stripe-reconcile] not found", {
      paymentId,
      reason: result.reason,
    });
    return json({ error: "not_found" }, 404);
  }
  console.error("[stripe-reconcile] not verified", {
    paymentId,
    reason: result.reason,
  });
  return json(
    { error: "payment_not_verified", paymentId: result.paymentId ?? paymentId },
    409,
  );
}
