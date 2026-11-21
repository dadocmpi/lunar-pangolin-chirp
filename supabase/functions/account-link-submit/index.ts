// ============================================================================
// account-link-submit — a paying customer asks Braxel to link the external
// prop-firm account they intend to use.
//
// Security contract:
//   * The user id comes from the verified JWT, never from the body.
//   * The Braxel plan is derived from the customer's CONFIRMED payment, never
//     from the request. An unpaid, refunded or canceled customer is refused.
//   * The firm must be one configured with an affiliate URL server-side.
//   * NO broker password / provider token / CID / secret is accepted — the
//     payload has no field for one.
//   * One open link per customer: a duplicate submit is refused (409) and the
//     DB has a partial unique index as a second line of defence.
//   * Every submission writes append-only audit events.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireUser, UnauthorizedError } from "../_shared/tradovate/auth.ts";
import {
  isConfiguredOnboardingFirm,
  isKnownPlanId,
  onboardingConfigFromEnv,
} from "../_shared/onboarding/config.ts";
import { isPaidEntitlement } from "../_shared/onboarding/entitlement.ts";
import { loadEntitlement } from "../_shared/onboarding/entitlementDb.ts";
import { isOpenLinkStatus, isLinkStatus } from "../_shared/onboarding/status.ts";
import { validateLinkPayload } from "../_shared/onboarding/validation.ts";
import { logCheckoutVerified, logLinkAudit } from "../_shared/onboarding/audit.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
const OPEN_STATUSES = ["pending", "in_review", "approved", "suspended"];

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

  const payload = validateLinkPayload(
    parsed.value,
    (firmId) => isConfiguredOnboardingFirm(config, firmId),
  );
  if (!payload.ok || !payload.value) {
    return json({ error: payload.error ?? "invalid_payload" }, 400);
  }

  const admin = ctx.admin;

  // Entitlement is server-derived. A browser-supplied plan or payment status is
  // never read.
  const { entitlement, error: entitlementError } = await loadEntitlement(
    admin,
    ctx.user.id,
  );
  if (entitlementError) return json({ error: "lookup_failed" }, 500);
  if (!isPaidEntitlement(entitlement)) {
    const unpaid = entitlement.state === "none" || entitlement.state === "pending";
    return json(
      {
        error: unpaid ? "payment_required" : "payment_not_active",
        paymentState: entitlement.state,
      },
      unpaid ? 402 : 409,
    );
  }
  if (!isKnownPlanId(entitlement.planId)) {
    return json({ error: "plan_unavailable" }, 409);
  }

  // One open request at a time.
  const { data: existing, error: existingError } = await admin
    .from("account_links")
    .select("id, status")
    .eq("user_id", ctx.user.id)
    .in("status", OPEN_STATUSES)
    .limit(1)
    .maybeSingle();
  if (existingError) return json({ error: "lookup_failed" }, 500);
  if (existing && isLinkStatus(existing.status) && isOpenLinkStatus(existing.status)) {
    return json({ error: "already_open", status: existing.status }, 409);
  }

  const now = new Date().toISOString();
  const { data: inserted, error: insertError } = await admin
    .from("account_links")
    .insert({
      user_id: ctx.user.id,
      firm: payload.value.firmId,
      plan_id: entitlement.planId,
      account_login: payload.value.accountLogin,
      note: payload.value.note || null,
      status: "pending",
      confirmed_ownership: payload.value.confirmedOwnership,
      confirmed_external_rules: payload.value.confirmedExternalRules,
      confirmed_no_profit_guarantee: payload.value.confirmedNoProfitGuarantee,
      confirmed_eligibility: payload.value.confirmedEligibility,
      confirmed_data_delayed: payload.value.confirmedDataDelayed,
      confirmed_payouts_provider: payload.value.confirmedPayoutsProvider,
      confirmed_no_funds_held: payload.value.confirmedNoFundsHeld,
      disclosures_version: config.disclosuresVersion,
      submitted_at: now,
      updated_at: now,
    })
    .select("id, status")
    .single();

  if (insertError || !inserted) {
    // The partial unique index is the second line of defence for a race.
    if (insertError?.code === "23505") {
      return json({ error: "already_open" }, 409);
    }
    return json({ error: "insert_failed" }, 500);
  }

  await logLinkAudit(admin, {
    linkId: inserted.id,
    userId: ctx.user.id,
    actor: "user",
    event: "account_link_submitted",
    previousStatus: null,
    newStatus: inserted.status,
    reason: `onboarding submission for ${payload.value.firmId}`,
    uniquePerAction: false,
    at: now,
  });
  // Checkout-completion audit event for the onboarding surface. Idempotent per
  // payment; the provider webhook keeps its own confirmation row.
  if (entitlement.paymentId) {
    await logCheckoutVerified(admin, entitlement.paymentId, ctx.user.id);
  }

  notifyOwnerInBackground({
    type: "conta",
    subject: "Nova solicitação de vínculo de conta",
    replyTo: ctx.user.email ?? null,
    data: {
      account_link_id: inserted.id,
      user_id: ctx.user.id,
      mesa: payload.value.firmId,
      plano: entitlement.planId,
      conta: payload.value.accountLogin,
      pagamento_id: entitlement.paymentId,
      observacoes: payload.value.note || null,
      origem: "account-link-submit",
    },
    idempotencyKey: `account-link-submit:${inserted.id}`,
  });

  return json({ ok: true, linkId: inserted.id, status: inserted.status }, 201);
});
