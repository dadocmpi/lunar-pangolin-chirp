import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import {
  isPaymentsEnabled,
  isTestPaymentMode,
  paymentsDisabledBody,
} from "../_shared/payments-flag.ts";
import { getPlan } from "../_shared/plans.ts";
import {
  sanitizeBilling,
  type BillingInput,
  type SanitizedBilling,
} from "../_shared/profile/billing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const STRIPE_API_VERSION = "2020-08-27";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

function stripeRequest(
  method: string,
  path: string,
  data: URLSearchParams | Record<string, unknown> | string,
  secretKey: string,
): Promise<Response> {
  const url = `${STRIPE_API_BASE}${path}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
    "Stripe-Version": STRIPE_API_VERSION,
  };

  let body: string | URLSearchParams | undefined;
  if (data instanceof URLSearchParams) {
    body = data;
  } else if (typeof data === "object" && data !== null) {
    body = new URLSearchParams(
      Object.entries(data).flatMap(([k, v]) =>
        v === undefined || v === null ? [] : [[k, String(v)]]
      ),
    );
  } else if (typeof data === "string") {
    body = data;
  } else {
    body = undefined;
  }

  return fetch(url, { method, headers, body });
}

interface ResolveCustomerArgs {
  supabase: ReturnType<typeof createClient>;
  stripeSecretKey: string;
  userId: string;
  email: string;
  billing: SanitizedBilling;
}

/**
 * Reuse the profile's stored Stripe Customer, or create one and persist its id.
 * The customer carries name/email/phone/address so Stripe shows them on the
 * payment and the receipt. Returns null when Stripe is unreachable — the caller
 * then falls back to customer_email so checkout still works.
 */
async function resolveStripeCustomer(args: ResolveCustomerArgs): Promise<string | null> {
  const { supabase, stripeSecretKey, userId, email, billing } = args;

  const form = new URLSearchParams();
  if (email) form.append("email", email);
  if (billing.name) form.append("name", billing.name);
  if (billing.phone) form.append("phone", billing.phone);
  if (billing.line1) form.append("address[line1]", billing.line1);
  if (billing.line2) form.append("address[line2]", billing.line2);
  if (billing.city) form.append("address[city]", billing.city);
  if (billing.state) form.append("address[state]", billing.state);
  if (billing.postalCode) form.append("address[postal_code]", billing.postalCode);
  if (billing.country) form.append("address[country]", billing.country);

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  // Reuse the stored customer, refreshing its details so the receipt reflects
  // whatever the customer edited at checkout.
  const existing = profile?.stripe_customer_id as string | undefined;
  if (existing) {
    const update = await stripeRequest(
      "POST",
      `/customers/${existing}`,
      form,
      stripeSecretKey,
    );
    if (update.ok) return existing;
    // A deleted/invalid customer id must not dead-end checkout: fall through
    // and create a fresh one.
  }

  form.append("metadata[user_id]", userId);
  const res = await stripeRequest("POST", "/customers", form, stripeSecretKey);
  if (!res.ok) return null;
  const customer = await res.json();
  const customerId = customer?.id as string | undefined;
  if (!customerId) return null;

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);

  return customerId;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // -------------------------------------------------------------------------
  // Gate — single shared source of truth (PAYMENTS_ENABLED || TEST_PAYMENT_MODE)
  // Fail closed before any Stripe or DB work when payments are off.
  // -------------------------------------------------------------------------
  if (!isPaymentsEnabled()) {
    return new Response(JSON.stringify(paymentsDisabledBody()), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get environment variables
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({ error: "Stripe not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const successUrl = Deno.env.get("STRIPE_SUCCESS_URL");
  const cancelUrl = Deno.env.get("STRIPE_CANCEL_URL");
  if (!successUrl || !cancelUrl) {
    return new Response(
      JSON.stringify({ error: "Stripe URLs not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Authenticate user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabaseToken = authHeader.substring(7);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(supabaseToken);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse request body
  let body: {
    planId: string;
    idempotencyKey: string;
    isTest: boolean;
    applicationId: string;
    billing?: BillingInput;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { planId, idempotencyKey, applicationId } = body;
  // Server-side test flag. Never derive test/production from the client body.
  const testMode = isTestPaymentMode();
  if (!planId || !idempotencyKey || !applicationId) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Fetch the application to get the plan key and verify ownership
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("plan_key")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (appError || !application) {
    return new Response(
      JSON.stringify({ error: "Application not found or access denied" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const planKey = application.plan_key;

  // Re-derive the canonical plan server-side so the row we persist carries the
  // real plan id, name and USD amount instead of placeholders. The
  // browser-declared price is never used.
  let canonicalPlan: ReturnType<typeof getPlan>;
  try {
    canonicalPlan = getPlan(planKey);
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid plan on application" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Map plan key to Stripe Price ID from environment variables
  // USD only; local-currency adaptation is presentation only.
  const priceIdMap: Record<string, string> = {
    starter: Deno.env.get("STRIPE_PRICE_STARTER_USD") ?? "",
    professional: Deno.env.get("STRIPE_PRICE_PROFESSIONAL_USD") ?? "",
    business: Deno.env.get("STRIPE_PRICE_BUSINESS_USD") ?? "",
    enterprise: Deno.env.get("STRIPE_PRICE_ENTERPRISE_USD") ?? "",
  };

  const priceId = priceIdMap[canonicalPlan.id];
  if (!priceId) {
    return new Response(
      JSON.stringify({ error: `Price ID not configured for plan ${planKey}` }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Create pending payment record. Managed Capital is always USD, so the row
  // records both the canonical USD amount and currency from the start.
  const pendingPaymentData = {
    user_id: user.id,
    plan_id: canonicalPlan.id,
    plan_name: canonicalPlan.name,
    amount_cents: canonicalPlan.priceCents,
    currency: "USD",
    network: null,
    method: "stripe",
    idempotency_key: idempotencyKey,
    status: "pending",
    status_enum: "pending",
    metadata: {
      application_id: applicationId,
      plan_key: canonicalPlan.id,
      is_test: testMode,
      // We'll add stripe_customer_id and stripe_subscription_id later via webhook
    },
  };

  const { data: pendingPayment, error: pendingError } = await supabase
    .from("pending_payments")
    .insert(pendingPaymentData)
    .select(
      "id, user_id, plan_name, amount_cents, currency, network, method, idempotency_key, status, metadata",
    )
    .single();

  if (pendingError || !pendingPayment) {
    return new Response(
      JSON.stringify({ error: "Failed to create pending payment" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  notifyOwnerInBackground({
    type: "compra",
    subject: `Pedido criado (Stripe) — plano ${planKey}`,
    replyTo: user.email ?? null,
    data: {
      plano: planKey,
      email: user.email ?? null,
      metodo: "stripe",
      payment_id: pendingPayment.id,
      application_id: applicationId,
      status: "pending",
      origem: "stripe-checkout",
    },
    idempotencyKey: `stripe-order:${pendingPayment.id}`,
  });

  // Resolve (create or reuse) the Stripe Customer so the billing details show
  // on the payment and the receipt, and the id is stored on the profile. A
  // failure here is not fatal: checkout falls back to customer_email.
  const billing = sanitizeBilling(body.billing);
  const email = billing.email || user.email || "";
  let customerId: string | null = null;
  try {
    customerId = await resolveStripeCustomer({
      supabase,
      stripeSecretKey,
      userId: user.id,
      email,
      billing,
    });
  } catch (err) {
    console.error("[stripe-checkout] customer resolution failed:", err);
  }

  // Create Stripe Checkout Session
  const sessionData = new URLSearchParams();
  sessionData.append("mode", "subscription");
  sessionData.append("line_items[0][price]", priceId);
  sessionData.append("line_items[0][quantity]", "1");
  sessionData.append(
    "success_url",
    `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
  );
  sessionData.append("cancel_url", cancelUrl);
  sessionData.append("metadata[pending_payment_id]", pendingPayment.id);
  sessionData.append("metadata[idempotency_key]", idempotencyKey);
  sessionData.append("metadata[application_id]", applicationId);
  if (customerId) {
    // A resolved Customer already carries name/email/phone/address; Stripe
    // reuses them on the session and the receipt. customer_update lets the
    // customer correct the address on the hosted page and have it saved back.
    sessionData.append("customer", customerId);
    sessionData.append("customer_update[name]", "auto");
    sessionData.append("customer_update[address]", "auto");
    sessionData.append("billing_address_collection", "auto");
  } else {
    sessionData.append("customer_email", email);
  }

  try {
    const stripeRes = await stripeRequest(
      "POST",
      "/checkout/sessions",
      sessionData,
      stripeSecretKey,
    );

    if (!stripeRes.ok) {
      const errorText = await stripeRes.text();
      console.error("Stripe error:", errorText);
      return new Response(JSON.stringify({ error: "Stripe error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripeRes.json();
    const sessionId = session.id;

    // Store stripe_session_id on the pending_payment so the success page can
    // look up the correct row when Stripe redirects back with ?session_id={CHECKOUT_SESSION_ID}.
    if (sessionId) {
      await supabase
        .from("pending_payments")
        .update({
          metadata: {
            ...((pendingPayment.metadata as Record<string, unknown> | null) ??
              {}),
            stripe_session_id: sessionId,
          },
        })
        .eq("id", pendingPayment.id);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to create Stripe session:", err);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
