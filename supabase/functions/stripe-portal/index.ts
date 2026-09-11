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

  // Find the user's pending payment record with a stripe_customer_id
  const { data: pendingPayments, error: listError } = await supabase
    .from("pending_payments")
    .select("id, metadata")
    .eq("user_id", user.id)
    .eq("method", "stripe");

  if (listError || !pendingPayments) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch pending payments" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Find the most recent one with a stripe_customer_id
  const pendingPayment = pendingPayments
    .map((pp: { id: string; metadata: Record<string, unknown> | null }) => ({
      ...pp,
      metadata: pp.metadata ?? {},
    }))
    .find((pp) => pp.metadata.stripe_customer_id);

  if (!pendingPayment) {
    return new Response(
      JSON.stringify({ error: "No Stripe customer found for this user" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const stripeCustomerId =
    typeof pendingPayment.metadata.stripe_customer_id === "string"
      ? pendingPayment.metadata.stripe_customer_id
      : null;
  if (!stripeCustomerId) {
    return new Response(
      JSON.stringify({ error: "Stripe customer ID missing" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Create a Stripe Billing Portal session
  const returnUrl = Deno.env.get("STRIPE_PORTAL_RETURN_URL");
  if (!returnUrl) {
    return new Response(
      JSON.stringify({ error: "Portal return URL not configured" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const sessionData = new URLSearchParams();
  sessionData.append("customer", stripeCustomerId);
  sessionData.append("return_url", returnUrl);

  try {
    const portalRes = await stripeRequest(
      "POST",
      "/billing_portal/sessions",
      sessionData,
      stripeSecretKey,
    );

    if (!portalRes.ok) {
      const errorText = await portalRes.text();
      console.error("Stripe portal error:", errorText);
      return new Response(JSON.stringify({ error: "Stripe error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await portalRes.json();
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to create portal session:", err);
    return new Response(
      JSON.stringify({ error: "Failed to create portal session" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
