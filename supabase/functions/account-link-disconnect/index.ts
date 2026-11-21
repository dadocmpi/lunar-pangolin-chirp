// ============================================================================
// account-link-disconnect — the customer closes their own account link.
//
// Security contract:
//   * The user comes from the verified JWT; no user id is read from the body.
//   * The update is scoped by BOTH the link id and the JWT user id, so a
//     cross-user id simply matches no row (404) and can never be mutated.
//   * Only an approved or suspended link may be disconnected.
//   * The disconnection is audited and the owner is notified.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";
import { onboardingConfigFromEnv } from "../_shared/onboarding/config.ts";
import { isLinkStatus } from "../_shared/onboarding/status.ts";
import { logLinkAudit } from "../_shared/onboarding/audit.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";
import { cleanText } from "../_shared/onboarding/validation.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  const json = (body: Record<string, unknown>, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const config = onboardingConfigFromEnv();
  if (!config.enabled) {
    return json({ ok: false, error: "feature_disabled", feature: "onboarding_flow" }, 503);
  }

  if (limiter.hit(`ip:${clientIp(req)}`)) return json({ error: "rate_limited" }, 429);

  let ctx;
  try {
    ctx = await requireUser(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);

  const parsed = await readJsonBody<Record<string, unknown>>(req);
  if (!parsed.ok) {
    return json(
      { error: parsed.error },
      parsed.error === "payload_too_large" ? 413 : 400,
    );
  }
  const id = cleanText(parsed.value.id, 60);
  if (!id) return json({ error: "missing_id" }, 400);

  const { data: row, error: rowError } = await ctx.admin
    .from("account_links")
    .select("id, user_id, status")
    .eq("id", id)
    .eq("user_id", ctx.user.id)
    .maybeSingle();
  if (rowError) return json({ error: "lookup_failed" }, 500);
  if (!row) return json({ error: "not_found" }, 404);

  if (!isLinkStatus(row.status) || (row.status !== "approved" && row.status !== "suspended")) {
    return json({ error: "invalid_transition", from: row.status, to: "disconnected" }, 409);
  }

  const now = new Date().toISOString();
  const { error: updateError } = await ctx.admin
    .from("account_links")
    .update({ status: "disconnected", disconnected_at: now, updated_at: now })
    .eq("id", id)
    .eq("user_id", ctx.user.id);
  if (updateError) return json({ error: "update_failed" }, 500);

  await logLinkAudit(ctx.admin, {
    linkId: id,
    userId: ctx.user.id,
    actor: "user",
    event: "account_link_disconnected",
    previousStatus: row.status,
    newStatus: "disconnected",
    reason: "customer disconnected the account link",
    at: now,
  });

  notifyOwnerInBackground({
    type: "conta",
    subject: "Conta desvinculada pelo cliente",
    replyTo: ctx.user.email ?? null,
    data: {
      account_link_id: id,
      user_id: ctx.user.id,
      status_anterior: row.status,
      status_novo: "disconnected",
      origem: "account-link-disconnect",
    },
    idempotencyKey: `account-link-disconnect:${id}:${now}`,
  });

  return json({ ok: true, status: "disconnected", disconnectedAt: now });
});
