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
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { activationConfigFromEnv, isAtCapacity } from "../_shared/activation/config.ts";

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

/**
 * Count of activations that occupy a pilot seat: approved rows only. Fail-soft:
 * if the count cannot be read (e.g. table missing on an un-migrated project) we
 * report 0, i.e. not full, so the flow keeps working rather than blocking every
 * customer on a transient DB error.
 */
async function countActive(): Promise<number> {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) return 0;
  try {
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { count, error } = await admin
      .from("account_activations")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved");
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const config = activationConfigFromEnv();

  // Capacity is only meaningful when a positive limit is configured; skip the
  // DB read entirely otherwise.
  const activeCount = config.maxActive > 0 ? await countActive() : 0;
  const atCapacity = isAtCapacity(config.maxActive, activeCount);

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
    // Public marketing/UX data only: the share link of OUR strategy and
    // whether the pilot currently has room. No secret, no user data.
    tradersPost: {
      shareUrl: config.tradersPostShareUrl,
    },
    waitlist: {
      enabled: atCapacity,
      maxActive: config.maxActive,
      activeCount,
    },
  });
});
