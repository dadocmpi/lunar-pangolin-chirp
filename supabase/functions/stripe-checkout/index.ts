import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";

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
  data: URLSearchParams | object,
  secretKey: string
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
      )
    );
  } else {
    body = data;
  }

  return fetch(url, { method, headers, body });
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

  // Get environment variables
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return new Response(
      JSON.stringify({ error: "Stripe not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
      }
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
      }
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
  let body: { planId: string; idempotencyKey: string; isTest: boolean; applicationId: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { planId, idempotencyKey, isTest, applicationId } = body;
  if (!planId || !idempotencyKey || !applicationId) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
      }
    );
  }

  const planKey = application.plan_key;

  // Map plan key to Stripe Price ID from environment variables
  // USD only; local-currency adaptation is presentation only.
  const priceIdMap: Record<string, string> = {
    starter: Deno.env.get("STRIPE_PRICE_STARTER_USD") ?? "",
    professional: Deno.env.get("STRIPE_PRICE_PROFESSIONAL_USD") ?? "",
    business: Deno.env.get("STRIPE_PRICE_BUSINESS_USD") ?? "",
    enterprise: Deno.env.get("STRIPE_PRICE_ENTERPRISE_USD") ?? "",
  };

  const priceId = priceIdMap[planKey];
  if (!priceId) {
    return new Response(
      JSON.stringify({ error: `Price ID not configured for plan ${planKey}` }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Create pending payment record
  const pendingPaymentData = {
    user_id: user.id,
    plan_name: planKey, // We'll store the plan key in plan_name for now
    amount_cents: 0, // Amount will be set by Stripe price
    currency: "eur",
    network: null,
    method: "stripe",
    idempotency_key: idempotencyKey,
    status: "pending",
    metadata: {
      application_id: applicationId,
      plan_key: planKey,
      // We'll add stripe_customer_id and stripe_subscription_id later via webhook
    },
  };

  const { data: pendingPayment, error: pendingError } = await supabase
    .from("pending_payments")
    .insert(pendingPaymentData)
    .select("id, user_id, plan_name, amount_cents, currency, network, method, idempotency_key, status, metadata")
    .single();

  if (pendingError || !pendingPayment) {
    return new Response(
      JSON.stringify({ error: "Failed to create pending payment" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Create Stripe Checkout Session
  const sessionData = new URLSearchParams();
  sessionData.append("mode", "subscription");
  sessionData.append("line_items[0][price]", priceId);
  sessionData.append("line_items[0][quantity]", "1");
  sessionData.append("success_url", `${successUrl}?session_id={CHECKOUT_SESSION_ID}`);
  sessionData.append("cancel_url", cancelUrl);
  sessionData.append("metadata[pending_payment_id]", pendingPayment.id);
  sessionData.append("metadata[idempotency_key]", idempotencyKey);
  sessionData.append("metadata[application_id]", applicationId);
  // We can also pass customer email if we want, but we'll let Stripe collect it or use the user's email from Supabase
  sessionData.append("customer_email", user.email ?? "");

  try {
    const stripeRes = await stripeRequest(
      "POST",
      "/checkout/sessions",
      sessionData,
      stripeSecretKey
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
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to create Stripe session:", err);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});