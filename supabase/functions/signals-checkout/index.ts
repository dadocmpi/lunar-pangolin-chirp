// ============================================================================
// signals-checkout — start the monthly signals-plan subscription.
//
// Preconditions (all enforced server-side):
//   * payments are on (the single shared payments gate), and the activation
//     flow is on;
//   * the caller is authenticated (JWT);
//   * the caller has an APPROVED account activation. The operator's approval of
//     the account on the prop firm is what unlocks billing; the subscription
//     only decides whether the signals plan is paid for.
//
// The browser never declares the price: it comes from the Edge Function secret
// STRIPE_PRICE_SIGNALS_MONTHLY. The plan only becomes ACTIVE when Stripe's
// webhook confirms the payment (see stripe-webhook); this function merely
// creates the Checkout Session and records 'pending'.
//
// No Tradovate call, no broker credential, no order engine.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  isPaymentsEnabled,
  paymentsDisabledBody,
} from "../_shared/payments-flag.ts";
import { activationConfigFromEnv } from "../_shared/activation/config.ts";
import { createRateLimiter } from "../_shared/activation/rateLimit.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";

const STRIPE_API_VERSION = "2020-08-27";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stripeRequest(
  path: string,
  data: URLSearchParams,
  secretKey: string,
): Promise<Response> {
  return fetch(`${STRIPE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION,
    },
    body: data,
  });
}

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // One payments gate; fail closed before any Stripe or DB work.
  if (!isPaymentsEnabled()) {
    return json(paymentsDisabledBody(), 503);
  }

  // The billing flow only exists as part of the activation flow.
  const config = activationConfigFromEnv();
  if (!config.enabled) {
    return json({ ok: false, error: "feature_disabled", feature: "activation_flow" }, 503);
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const priceId = Deno.env.get("STRIPE_PRICE_SIGNALS_MONTHLY");
  if (!stripeSecretKey) {
    return json({ error: "stripe_not_configured" }, 503);
  }
  if (!priceId) {
    return json({ error: "price_not_configured" }, 503);
  }

  // Success/cancel fall back to the existing Stripe URLs so no new secret is
  // strictly required; dedicated overrides are optional.
  const successUrl = Deno.env.get("STRIPE_SIGNALS_SUCCESS_URL") ??
    Deno.env.get("STRIPE_SUCCESS_URL");
  const cancelUrl = Deno.env.get("STRIPE_SIGNALS_CANCEL_URL") ??
    Deno.env.get("STRIPE_CANCEL_URL");
  if (!successUrl || !cancelUrl) {
    return json({ error: "urls_not_configured" }, 503);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limiter.hit(`ip:${ip}`)) return json({ error: "rate_limited" }, 429);

  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);

  const admin = ctx.admin;

  // The most recent activation for this JWT user. Billing requires approval.
  const { data: activation, error: lookupError } = await admin
    .from("account_activations")
    .select("id, status, subscription_status, stripe_customer_id, stripe_subscription_id")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lookupError) return json({ error: "lookup_failed" }, 500);
  if (!activation) return json({ error: "no_activation" }, 403);
  if (activation.status !== "approved") {
    return json({ error: "not_approved", status: activation.status }, 403);
  }
  if (activation.subscription_status === "active") {
    return json({ error: "already_active" }, 409);
  }

  // Create the Checkout Session. Reuse the Stripe customer when we already have
  // one so the billing portal and this checkout share a single customer.
  const sessionData = new URLSearchParams();
  sessionData.append("mode", "subscription");
  sessionData.append("line_items[0][price]", priceId);
  sessionData.append("line_items[0][quantity]", "1");
  sessionData.append("success_url", `${successUrl}?signals=1&session_id={CHECKOUT_SESSION_ID}`);
  sessionData.append("cancel_url", cancelUrl);
  sessionData.append("client_reference_id", ctx.user.id);
  if (activation.stripe_customer_id) {
    sessionData.append("customer", activation.stripe_customer_id);
  } else if (ctx.user.email) {
    sessionData.append("customer_email", ctx.user.email);
  }
  // Metadata on BOTH the session and the subscription so every later
  // subscription.* / invoice.* event can be mapped back to the activation.
  sessionData.append("metadata[kind]", "signals_subscription");
  sessionData.append("metadata[activation_id]", activation.id);
  sessionData.append("metadata[user_id]", ctx.user.id);
  sessionData.append("subscription_data[metadata][kind]", "signals_subscription");
  sessionData.append("subscription_data[metadata][activation_id]", activation.id);
  sessionData.append("subscription_data[metadata][user_id]", ctx.user.id);

  let session: { id?: string; url?: string };
  try {
    const res = await stripeRequest("/checkout/sessions", sessionData, stripeSecretKey);
    if (!res.ok) {
      console.error("signals-checkout stripe error", await res.text());
      return json({ error: "stripe_error" }, 502);
    }
    session = await res.json();
  } catch (err) {
    console.error("signals-checkout failed", err);
    return json({ error: "stripe_error" }, 502);
  }
  if (!session?.url) return json({ error: "stripe_error" }, 502);

  // Record intent. The webhook is the only writer of 'active'.
  const now = new Date().toISOString();
  await admin
    .from("account_activations")
    .update({ subscription_status: "pending", subscription_updated_at: now, updated_at: now })
    .eq("id", activation.id);

  return json({ ok: true, url: session.url, sessionId: session.id ?? null });
});
