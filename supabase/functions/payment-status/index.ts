import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Payment Status — READ-ONLY endpoint.
 *
 * Returns one of the 10 canonical statuses. Never mutates a row.
 *
 * Gate contract:
 *  - TEST_PAYMENT_MODE must be "true" OR PAYMENTS_ENABLED must be "true".
 *    If neither is set, returns 200 with mode="test", status="pending",
 *    and a clear reason. No row is read.
 *  - In all cases, status is one of: created | pending | processing |
 *    confirmed | failed | rejected | refunded | disputed | canceled |
 *    pending_manual.
 *  - The browser never decides confirmation; this handler only reports
 *    the server-side canonical value.
 */
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

  // ---------------------------------------------------------------------
  // Gate — refuse to read when neither test nor production is enabled.
  // ---------------------------------------------------------------------
  const testMode = Deno.env.get("TEST_PAYMENT_MODE") === "true";
  const prodMode = Deno.env.get("PAYMENTS_ENABLED") === "true";
  if (!testMode && !prodMode) {
    return new Response(
      JSON.stringify({
        ok: true,
        mode: "test",
        reason: "neither TEST_PAYMENT_MODE nor PAYMENTS_ENABLED is set",
        payment: {
          id: "00000000-0000-0000-0000-000000000000",
          status: "pending",
          plan_id: null,
          plan_name: null,
          amount_cents: 0,
          currency: "USD",
          network: null,
          method: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // ---------------------------------------------------------------------
  // Auth — must be a Supabase user JWT.
  // ---------------------------------------------------------------------
  const auth = req.headers.get("Authorization");
  if (!auth) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = auth.replace("Bearer ", "");

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: auth } } },
  );
  const { data: userData, error: authErr } = await userClient.auth.getUser(
    token,
  );
  if (authErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const user = userData.user;

  // ---------------------------------------------------------------------
  // Parse paymentId from query string or JSON body.
  // ---------------------------------------------------------------------
  const url = new URL(req.url);
  let paymentId = url.searchParams.get("paymentId");
  if (!paymentId && req.method === "POST") {
    try {
      const body = await req.json();
      paymentId = body?.paymentId ?? null;
    } catch {
      // ignore — handled below
    }
  }
  if (!paymentId) {
    return new Response(JSON.stringify({ error: "payment_id_required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ---------------------------------------------------------------------
  // Read the payment via the service role. RLS does not gate this, but
  // we manually enforce user ownership in the where clause.
  // ---------------------------------------------------------------------
  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data, error } = await admin
    .from("pending_payments")
    .select(
      "id, status, status_enum, plan_id, plan_name, amount_cents, currency, network, method, user_id, created_at, updated_at, metadata",
    )
    .eq("id", paymentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return new Response(
      JSON.stringify({ error: "db_error", message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  if (!data) {
    return new Response(JSON.stringify({ error: "payment_not_found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // The canonical 10-status enum. Anything else from the DB is normalized.
  const allowed = new Set([
    "created",
    "pending",
    "processing",
    "confirmed",
    "failed",
    "rejected",
    "refunded",
    "disputed",
    "canceled",
    "pending_manual",
  ]);
  const rawStatus = (data.status_enum ?? data.status ?? "pending") as string;
  const status: string = allowed.has(rawStatus) ? rawStatus : "pending";

  return new Response(
    JSON.stringify({
      ok: true,
      mode: testMode ? "test" : "production",
      payment: {
        id: data.id,
        status,
        plan_id: data.plan_id ?? null,
        plan_name: data.plan_name ?? null,
        amount_cents: data.amount_cents ?? 0,
        currency: data.currency ?? "USD",
        network: data.network ?? null,
        method: data.method ?? null,
        is_test: data.metadata?.is_test === true,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
