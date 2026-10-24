// ============================================================================
// activation-config — public configuration for the account-activation flow.
//
// Returns ONLY public marketing data: whether the flow is enabled, the
// configured prop firms (id, brand name, affiliate URL) and the signals plan
// name/price. No secret, no credential, no user data. The client uses this as
// the single source of truth so a firm's affiliate link lives in exactly one
// place (the Edge Function secret) and a firm with no configured link simply
// never appears.
//
// verify_jwt = false (see supabase/config.toml): the /accounts page is public
// and must render for a visitor. The response contains nothing sensitive.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { activationConfigFromEnv } from "../_shared/activation/config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const config = activationConfigFromEnv();
  return json({
    enabled: config.enabled,
    firms: config.firms.map((f) => ({
      id: f.id,
      name: f.name,
      url: f.affiliateUrl,
    })),
    plan: {
      name: config.plan.name,
      priceCents: config.plan.priceCents,
      currency: config.plan.currency,
    },
  });
});
