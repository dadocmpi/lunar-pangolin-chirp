// ============================================================================
// account-link-review — operator-only review of managed-account link requests.
//
// Security contract:
//   * Operator-only. Reuses the SAME mechanism as activation-review /
//     operator-action: app_metadata.operator === true, read server-side from
//     the admin API (a stale token cannot carry an outdated flag).
//   * The action produces exactly one status via the shared state machine; an
//     illegal transition is refused with 409.
//   * `approve` re-checks the customer's payment entitlement server-side. A
//     refunded or canceled customer cannot be approved.
//   * Every action appends to the append-only payment_audit_log.
//   * The customer is emailed through _shared/userEmail.ts (fire-and-forget).
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  ForbiddenError,
  requireOperator,
  UnauthorizedError,
} from "../_shared/activation/operator.ts";
import { onboardingConfigFromEnv } from "../_shared/onboarding/config.ts";
import {
  ACTION_RESULT,
  canTransition,
  isLinkAction,
  isLinkStatus,
  linkAuditEvent,
  type LinkAction,
  type LinkStatus,
} from "../_shared/onboarding/status.ts";
import { isPaidEntitlement } from "../_shared/onboarding/entitlement.ts";
import { loadEntitlement } from "../_shared/onboarding/entitlementDb.ts";
import { LINK_FIELD_LIMITS, cleanText } from "../_shared/onboarding/validation.ts";
import { logLinkAudit } from "../_shared/onboarding/audit.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { sendUserEmailInBackground } from "../_shared/userEmail.ts";
import { readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);
  const json = (body: Record<string, unknown>, status = 200): Response =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const config = onboardingConfigFromEnv();
  if (!config.enabled) {
    return json({ ok: false, error: "feature_disabled", feature: "onboarding_flow" }, 503);
  }

  if (limiter.hit(`ip:${clientIp(req)}`)) return json({ error: "rate_limited" }, 429);

  let ctx;
  try {
    ctx = await requireOperator(req);
  } catch (e) {
    if (e instanceof ForbiddenError) return json({ error: "forbidden" }, 403);
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);

  if (req.method === "GET") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "missing_id" }, 400);
    const { data, error } = await ctx.admin
      .from("account_links")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return json({ error: "lookup_failed" }, 500);
    if (!data) return json({ error: "not_found" }, 404);
    return json({ link: data });
  }

  const parsedBody = await readJsonBody<Record<string, unknown>>(req);
  if (!parsedBody.ok) {
    return json(
      { error: parsedBody.error },
      parsedBody.error === "payload_too_large" ? 413 : 400,
    );
  }
  const body = parsedBody.value;

  const id = cleanText(body.id, 60);
  const action = body.action;
  if (!id) return json({ error: "missing_id" }, 400);
  if (!isLinkAction(action)) return json({ error: "invalid_action" }, 400);

  const note = cleanText(body.note, LINK_FIELD_LIMITS.operatorNote);
  if ((action === "reject" || action === "suspend") && !note) {
    return json({ error: "note_required" }, 400);
  }

  const { data: row, error: rowError } = await ctx.admin
    .from("account_links")
    .select("id, user_id, status, firm, plan_id, account_login")
    .eq("id", id)
    .maybeSingle();
  if (rowError) return json({ error: "lookup_failed" }, 500);
  if (!row) return json({ error: "not_found" }, 404);

  const from = row.status;
  const to = ACTION_RESULT[action as LinkAction];
  if (!isLinkStatus(from) || !canTransition(from, to)) {
    return json({ error: "invalid_transition", from, to }, 409);
  }

  // Approval is the connection event; it requires a live entitlement. A refund
  // or cancellation between submission and review blocks it.
  if (action === "approve") {
    const { entitlement, error: entitlementError } = await loadEntitlement(
      ctx.admin,
      row.user_id,
    );
    if (entitlementError) return json({ error: "lookup_failed" }, 500);
    if (!isPaidEntitlement(entitlement)) {
      return json(
        { error: "payment_not_active", paymentState: entitlement.state },
        409,
      );
    }
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    status: to,
    reviewed_at: now,
    reviewed_by: ctx.user.id,
    updated_at: now,
  };
  if (action === "reject" || action === "suspend") update.operator_note = note;
  if (action === "approve") update.connected_at = now;
  if (action === "suspend") {
    update.suspended_at = now;
    update.suspension_reason = note;
  }
  if (action === "disconnect") update.disconnected_at = now;

  const { error: updateError } = await ctx.admin
    .from("account_links")
    .update(update)
    .eq("id", id)
    .eq("user_id", row.user_id);
  if (updateError) return json({ error: "update_failed" }, 500);

  await logLinkAudit(ctx.admin, {
    linkId: id,
    userId: row.user_id,
    actor: "operator",
    event: linkAuditEvent(action as LinkAction, from as LinkStatus),
    previousStatus: from,
    newStatus: to,
    reason: `account-link ${action} by operator ${ctx.user.id}`,
    at: now,
  });

  notifyOwnerInBackground({
    type: "conta",
    subject: `Vínculo de conta: ${action}`,
    data: {
      account_link_id: id,
      user_id: row.user_id,
      mesa: row.firm,
      plano: row.plan_id,
      status_anterior: from,
      status_novo: to,
      nota: note || null,
      operador: ctx.user.id,
      origem: "account-link-review",
    },
    idempotencyKey: `account-link-review:${id}:${action}:${now}`,
  });

  const { data: userData } = await ctx.admin.auth.admin.getUserById(row.user_id);
  sendUserEmailInBackground(
    customerEmail(to, row, note, userData?.user?.email ?? null),
  );

  return json({ ok: true, status: to, reviewedAt: now });
});

function customerEmail(
  to: LinkStatus,
  row: { firm: string; plan_id: string },
  note: string,
  email: string | null,
) {
  const details: Array<[string, string]> = [
    ["Mesa", row.firm],
    ["Plano", row.plan_id],
  ];
  if (note) details.push(["Observação", note]);

  const copy: Record<LinkStatus, { subject: string; heading: string; body: string }> = {
    pending: {
      subject: "Solicitação recebida — Braxel Markets",
      heading: "Solicitação recebida",
      body: "Recebemos a sua solicitação de vínculo de conta. Vamos analisar em breve.",
    },
    in_review: {
      subject: "Solicitação em análise — Braxel Markets",
      heading: "Solicitação em análise",
      body: "A sua solicitação de vínculo de conta está em análise pela nossa equipe.",
    },
    approved: {
      subject: "Conta vinculada — Braxel Markets",
      heading: "Conta vinculada",
      body: "A sua solicitação foi aprovada. O acompanhamento operacional está ativo. As regras da mesa externa continuam a aplicar-se.",
    },
    rejected: {
      subject: "Solicitação recusada — Braxel Markets",
      heading: "Solicitação recusada",
      body: "A sua solicitação de vínculo de conta foi recusada. Veja a observação abaixo e, se aplicável, envie uma nova solicitação.",
    },
    suspended: {
      subject: "Vínculo suspenso — Braxel Markets",
      heading: "Vínculo suspenso",
      body: "O vínculo da sua conta está suspenso. Veja a observação abaixo. O acompanhamento operacional permanece parado enquanto a suspensão durar.",
    },
    disconnected: {
      subject: "Conta desvinculada — Braxel Markets",
      heading: "Conta desvinculada",
      body: "O vínculo da sua conta foi encerrado. Pode enviar uma nova solicitação quando quiser.",
    },
  };

  const c = copy[to];
  return { to: email, subject: c.subject, heading: c.heading, body: c.body, details };
}
