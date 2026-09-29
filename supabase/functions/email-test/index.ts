// ============================================================================
// email-test — fires one sample email of every event type.
//
// Protected by EMAIL_TEST_SECRET so it cannot be abused on a public
// deployment. Two ways to run it:
//
//   1. Deno CLI (no deploy, no secret required):
//        deno run -A supabase/functions/email-test/index.ts
//      Prints a per-type result table. When RESEND_API_KEY / EMAIL_TO are
//      unset the sends are logged (not delivered) — you can verify wiring
//      before the provider is configured.
//
//   2. Deployed Edge Function:
//        curl -X POST "$SUPABASE_URL/functions/v1/email-test" \
//          -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
//          -H "Content-Type: application/json" \
//          -d '{"secret":"<EMAIL_TEST_SECRET>"}'
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { runSamples } from "../_shared/email-samples.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fail closed when no test secret is configured — never expose this on a
  // public deployment by accident.
  const expected = Deno.env.get("EMAIL_TEST_SECRET");
  if (!expected) {
    return new Response(
      JSON.stringify({
        error: "test_endpoint_disabled",
        message: "EMAIL_TEST_SECRET is not set.",
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const url = new URL(req.url);
  let provided = url.searchParams.get("secret") ?? "";
  if (!provided && req.method === "POST") {
    try {
      const body = await req.json();
      provided = typeof body?.secret === "string" ? body.secret : "";
    } catch {
      // ignore — treated as unauthorized below
    }
  }

  if (provided !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results = await runSamples();
  return new Response(
    JSON.stringify({
      ok: true,
      configured: Boolean(Deno.env.get("RESEND_API_KEY")),
      total: results.length,
      results,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
