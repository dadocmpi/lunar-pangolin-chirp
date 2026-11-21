// ============================================================================
// onboarding-config — public configuration for the managed-account onboarding.
//
// Returns ONLY public data: whether the flow is enabled, whether the future
// execution capability is enabled (false by default), the configured prop
// firms (id + brand name), the canonical Braxel plans and the disclosure
// version. No secret, no credential, no user data.
//
// verify_jwt = false (see supabase/config.toml): the onboarding page must be
// able to render its "not available" state for a visitor. Every mutation
// endpoint still requires a verified JWT.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { onboardingConfigFromEnv } from "../_shared/onboarding/config.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

serve((req) => {
  const corsHeaders = corsHeadersFor(req);
  const json = (body: Record<string, unknown>, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const config = onboardingConfigFromEnv();
  return json({
    enabled: config.enabled,
    executionEnabled: config.executionEnabled,
    firms: config.firms.map((f) => ({ id: f.id, name: f.name })),
    plans: config.plans.map((p) => ({
      id: p.id,
      name: p.name,
      priceCents: p.priceCents,
      managedCapitalUsd: p.managedCapitalUsd,
    })),
    disclosuresVersion: config.disclosuresVersion,
  });
});
