// ============================================================================
// onboarding-status — the customer's server-derived onboarding state.
//
// GET only. The user comes from the verified JWT; no body/query user id is
// read. Returns:
//   * the payment entitlement derived from pending_payments / services
//     (the browser never decides whether the customer has paid),
//   * the latest account-link row with its EFFECTIVE status (an approved link
//     whose payment is no longer active reads as suspended),
//   * the public onboarding configuration (enabled, executionEnabled, plans,
//     firms, disclosure version).
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";
import { onboardingConfigFromEnv } from "../_shared/onboarding/config.ts";
import { resolveEntitlement } from "../_shared/onboarding/entitlement.ts";
import { deriveEffectiveLinkStatus } from "../_shared/onboarding/effective.ts";
import { isLinkStatus } from "../_shared/onboarding/status.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 120 });

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  const json = (body: Record<string, unknown>, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  if (limiter.hit(`ip:${clientIp(req)}`)) return json({ error: "rate_limited" }, 429);

  const config = onboardingConfigFromEnv();
  // Disabled: the UI hides the flow. Returning 200 lets the dashboard render a
  // clean "not available" state instead of an error screen.
  if (!config.enabled) {
    return json({ enabled: false, executionEnabled: false });
  }

  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);

  const { data: payments, error: paymentsError } = await ctx.admin
    .from("pending_payments")
    .select("id, plan_id, amount_cents, currency, status, status_enum, created_at")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (paymentsError) return json({ error: "lookup_failed" }, 500);

  const { data: services } = await ctx.admin
    .from("services")
    .select("plan_id, activated, status")
    .eq("user_id", ctx.user.id);

  const entitlement = resolveEntitlement(payments ?? [], services ?? []);

  const { data: linkRow, error: linkError } = await ctx.admin
    .from("account_links")
    .select(
      "id, firm, plan_id, account_login, note, status, operator_note, suspension_reason, submitted_at, reviewed_at, connected_at, suspended_at, disconnected_at, created_at",
    )
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (linkError) return json({ error: "lookup_failed" }, 500);

  let link = null;
  if (linkRow && isLinkStatus(linkRow.status)) {
    const effective = deriveEffectiveLinkStatus(linkRow.status, entitlement);
    link = {
      ...linkRow,
      storedStatus: effective.stored,
      status: effective.effective,
      suspendedByPayment: effective.suspendedByPayment,
    };
  }

  return json({
    enabled: true,
    executionEnabled: config.executionEnabled,
    disclosuresVersion: config.disclosuresVersion,
    firms: config.firms.map((f) => ({ id: f.id, name: f.name })),
    plans: config.plans.map((p) => ({
      id: p.id,
      name: p.name,
      priceCents: p.priceCents,
      managedCapitalUsd: p.managedCapitalUsd,
    })),
    entitlement,
    link,
  });
});
