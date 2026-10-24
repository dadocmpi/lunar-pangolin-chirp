// ============================================================================
// activation-strategy-confirm — the customer records that they subscribed to
// OUR TradersPost strategy in their own account.
//
// This is a self-declaration, NOT a payment and NOT a credential: the customer
// types their firm login only inside TradersPost, never here. The row is
// stamped with the confirmation date so the operator can see it.
//
// Security contract:
//   * The user id comes from the verified JWT, never from the body.
//   * Only the customer's OWN most-recent activation can be stamped, and only
//     when it is APPROVED (there is nothing to onboard before approval).
//   * The confirmation is idempotent: re-pressing keeps the FIRST timestamp.
//   * Every action appends a row to the append-only payment_audit_log.
//   * No Tradovate call, no broker credential, no order engine.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { activationConfigFromEnv } from "../_shared/activation/config.ts";
import { createRateLimiter } from "../_shared/activation/rateLimit.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // The onboarding only exists as part of the activation flow; fail closed.
  const config = activationConfigFromEnv();
  if (!config.enabled) {
    return json({ ok: false, error: "feature_disabled", feature: "activation_flow" }, 503);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limiter.hit(`ip:${ip}`)) return json({ error: "rate_limited" }, 429);

  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);

  const admin = ctx.admin;

  // The customer's own most recent activation. Scope strictly by the JWT user.
  const { data: activation, error: lookupError } = await admin
    .from("account_activations")
    .select("id, status, strategy_confirmed_at")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lookupError) return json({ error: "lookup_failed" }, 500);
  if (!activation) return json({ error: "no_activation" }, 404);
  if (activation.status !== "approved") {
    return json({ error: "not_approved", status: activation.status }, 403);
  }

  // Idempotent: keep the first confirmation date.
  if (activation.strategy_confirmed_at) {
    return json({ ok: true, alreadyConfirmed: true, confirmedAt: activation.strategy_confirmed_at });
  }

  const now = new Date().toISOString();
  const { error: updateError } = await admin
    .from("account_activations")
    .update({
      strategy_confirmed_at: now,
      strategy_confirmed_by: ctx.user.id,
      updated_at: now,
    })
    .eq("id", activation.id)
    .eq("user_id", ctx.user.id);
  if (updateError) return json({ error: "update_failed" }, 500);

  // Append-only audit trail. A failure here never rolls back the confirmation.
  const { error: auditError } = await admin.from("payment_audit_log").insert({
    payment_table: "account_activations",
    payment_id: activation.id,
    user_id: ctx.user.id,
    actor: "user",
    source: "activation",
    event_id: `activation-strategy-confirm:${activation.id}:${now}`,
    previous_status: activation.status,
    new_status: activation.status,
    reason: "Customer confirmed TradersPost strategy subscription".slice(0, 200),
    created_at: now,
  });
  if (auditError) console.error("strategy-confirm audit log failed", { id: activation.id });

  return json({ ok: true, alreadyConfirmed: false, confirmedAt: now });
});
