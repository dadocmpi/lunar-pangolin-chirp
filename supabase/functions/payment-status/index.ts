// ============================================================================
// Payment Status — READ-ONLY endpoint.
// Calls the read_payment_status RPC (service role) so RLS is bypassed.
// The RPC enforces user ownership (auth.uid() = user_id).
//
// No row mutation. No email. No third-party call.
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = auth.replace("Bearer ", "");

    // Verify the JWT and get the user
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userData, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract paymentId from query or body
    const url = new URL(req.url);
    let paymentId = url.searchParams.get("paymentId");
    if (!paymentId && req.method === "POST") {
      try {
        const body = await req.json();
        paymentId = body?.paymentId;
      } catch {
        // ignore
      }
    }
    if (!paymentId) {
      return new Response(JSON.stringify({ error: "payment_id_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call the RPC (service role, bypasses RLS; RPC enforces user ownership)
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data, error } = await adminClient.rpc("read_payment_status", {
      p_legacy_id: paymentId,
    });

    if (error || !data) {
      return new Response(JSON.stringify({ error: "payment_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        payment: {
          id:             data.id,
          status:         data.status,
          planName:       data.plan_name,
          amountCents:    data.amount_cents,
          currency:       data.currency,
          network:        data.network,
          method:         data.method,
          createdAt:      data.created_at,
          updatedAt:       data.updated_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[payment-status] error", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});