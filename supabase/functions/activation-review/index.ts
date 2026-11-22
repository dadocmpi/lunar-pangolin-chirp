// ============================================================================
// activation-review — operator-only review of an account activation request.
//
// Security contract:
//   * Operator-only. Reuses the SAME mechanism as operator-action /
//     application-activate: app_metadata.operator === true, read server-side
//     from the admin API (a stale token cannot carry an outdated flag).
//   * The action produces exactly one status via the shared state machine;
//     an illegal transition is refused with 409.
//   * Every action appends a row to the append-only payment_audit_log.
//   * The customer is emailed through _shared/userEmail.ts (the single
//     customer-facing module). Delivery failure never breaks the action.
//   * `receiptUrl` returns a SHORT-LIVED signed URL for the private bucket so
//     the operator panel can display the receipt; nothing is made public.
// ============================================================================

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  ForbiddenError,
  requireOperator,
  UnauthorizedError,
} from "../_shared/activation/operator.ts";
import {
  ACTION_RESULT,
  canReview,
  isActivationStatus,
  type ActivationStatus,
  type ReviewAction,
} from "../_shared/activation/status.ts";
import { ACTIVATION_FIELD_LIMITS, cleanText } from "../_shared/activation/limits.ts";
import { activationConfigFromEnv } from "../_shared/activation/config.ts";
import { logAccountLinkEvent } from "../_shared/activation/audit.ts";
import {
  activatePlanFromVerifiedPayment,
  sendActivationEmailOnce,
} from "../_shared/activation/activationService.ts";
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { sendUserEmailInBackground } from "../_shared/userEmail.ts";
import { readJsonBody } from "../_shared/http.ts";
import { clientIp, createRateLimiter } from "../_shared/rateLimit.ts";
import { corsHeadersFor } from "../_shared/cors.ts";

const BUCKET = "activation-receipts";
const SIGNED_URL_TTL_SECONDS = 300;

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

const REVIEW_ACTIONS: readonly ReviewAction[] = [
  "start_review",
  "approve",
  "reject",
  "request_info",
  "suspend",
  "disconnect",
  "reinstate",
];

function isReviewAction(value: unknown): value is ReviewAction {
  return typeof value === "string" && (REVIEW_ACTIONS as readonly string[]).includes(value);
}

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

  const config = activationConfigFromEnv();
  if (!config.enabled) {
    return json({ ok: false, error: "feature_disabled", feature: "activation_flow" }, 503);
  }

  const ip = clientIp(req);
  if (limiter.hit(`ip:${ip}`)) return json({ error: "rate_limited" }, 429);

  let ctx;
  try {
    ctx = await requireOperator(req);
  } catch (e) {
    if (e instanceof ForbiddenError) return json({ error: "forbidden" }, 403);
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }
  if (limiter.hit(`user:${ctx.user.id}`)) return json({ error: "rate_limited" }, 429);

  // GET ?id=... -> details + a short-lived signed receipt URL for the panel.
  if (req.method === "GET") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "missing_id" }, 400);
    const { data, error } = await ctx.admin
      .from("account_activations")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return json({ error: "lookup_failed" }, 500);
    if (!data) return json({ error: "not_found" }, 404);

    let receiptUrl: string | null = null;
    if (data.receipt_path) {
      const { data: signed } = await ctx.admin.storage
        .from(BUCKET)
        .createSignedUrl(data.receipt_path, SIGNED_URL_TTL_SECONDS);
      receiptUrl = signed?.signedUrl ?? null;
    }
    return json({ activation: data, receiptUrl, receiptUrlTtlSeconds: SIGNED_URL_TTL_SECONDS });
  }

  // POST -> perform a review action.
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
  if (!isReviewAction(action)) return json({ error: "invalid_action" }, 400);

  const note = cleanText(body.note, ACTIVATION_FIELD_LIMITS.operatorNote);
  if (
    (action === "reject" || action === "request_info" ||
      action === "suspend" || action === "disconnect") && !note
  ) {
    return json({ error: "note_required" }, 400);
  }

  const { data: row, error: rowError } = await ctx.admin
    .from("account_activations")
    .select("id, user_id, status, firm, plan_name, account_login, braxel_plan_name, braxel_plan_key, payment_id")
    .eq("id", id)
    .maybeSingle();
  if (rowError) return json({ error: "lookup_failed" }, 500);
  if (!row) return json({ error: "not_found" }, 404);

  const from = row.status;
  const to = ACTION_RESULT[action];
  if (!isActivationStatus(from) || !canReview(from, to)) {
    return json({ error: "invalid_transition", from, to }, 409);
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: to,
    operator_note: note || null,
    reviewed_at: now,
    reviewed_by: ctx.user.id,
    updated_at: now,
  };
  if (to === "approved") patch.connected_at = now;
  if (to === "suspended") {
    patch.suspended_at = now;
    patch.suspended_reason = note || null;
  }
  if (to === "disconnected") {
    patch.disconnected_at = now;
    patch.disconnected_reason = note || null;
  }

  const { error: updateError } = await ctx.admin
    .from("account_activations")
    .update(patch)
    .eq("id", id);
  if (updateError) return json({ error: "update_failed" }, 500);

  // Append-only lifecycle audit. Approving connects the link; reinstating a
  // suspended link reconnects it. A failure never rolls back the decision.
  const events: Array<"in_review" | "info_requested" | "approved" | "rejected" | "connected" | "suspended" | "disconnected" | "reinstated"> = [];
  switch (action) {
    case "approve":
      events.push("approved", "connected");
      break;
    case "reinstate":
      events.push("reinstated", "connected");
      break;
    case "reject":
      events.push("rejected");
      break;
    case "suspend":
      events.push("suspended");
      break;
    case "disconnect":
      events.push("disconnected");
      break;
    case "start_review":
      events.push("in_review");
      break;
    case "request_info":
      events.push("info_requested");
      break;
  }
  for (const event of events) {
    await logAccountLinkEvent(ctx.admin, {
      accountLinkId: id,
      userId: row.user_id,
      event,
      from,
      to,
      actor: "operator",
      source: "admin",
      reason: `Account link ${action} by operator ${ctx.user.id}`,
      at: now,
    });
  }

  // Notify the owner and the customer. Both are fire-and-forget.
  notifyOwnerInBackground({
    type: "conta",
    subject: `Ativação de conta: ${action}`,
    data: {
      activation_id: id,
      user_id: row.user_id,
      mesa: row.firm,
      status_anterior: from,
      status_novo: to,
      nota: note || null,
      operador: ctx.user.id,
      origem: "activation-review",
    },
    idempotencyKey: `activation-review:${id}:${action}:${now}`,
  });

  // Approving a link also guarantees the plan activation exists for the
  // verified payment, and sends the professional activation email exactly
  // once. When it was already sent (e.g. by the payment webhook) no duplicate
  // is produced.
  let activationEmailHandled = false;
  if ((action === "approve" || action === "reinstate") && row.payment_id) {
    try {
      const { data: payment } = await ctx.admin
        .from("pending_payments")
        .select("id, user_id, plan_id, plan_name, amount_cents, currency, method, status, status_enum, metadata")
        .eq("id", row.payment_id)
        .eq("user_id", row.user_id)
        .maybeSingle();
      if (payment) {
        const activated = await activatePlanFromVerifiedPayment({
          admin: ctx.admin,
          payment: {
            id: payment.id,
            user_id: payment.user_id,
            plan_id: payment.plan_id ?? row.braxel_plan_key ?? null,
            plan_name: payment.plan_name ?? row.braxel_plan_name ?? null,
            amount_cents: payment.amount_cents ?? null,
            currency: payment.currency ?? "USD",
            method: payment.method ?? null,
            status_enum: payment.status_enum ?? payment.status ?? null,
            metadata: (payment.metadata as Record<string, unknown> | null) ?? null,
          },
          source: "admin",
          actor: "operator",
          actorId: ctx.user.id,
          reason: `Account link approved by operator ${ctx.user.id}`,
        });
        if (activated.activation) {
          const sent = await sendActivationEmailOnce({
            admin: ctx.admin,
            activation: activated.activation,
          });
          activationEmailHandled = sent.sent === true || sent.skipped === "already_sent";
        }
      }
    } catch (activationErr) {
      console.error("activation-review: activation failed (non-blocking)", activationErr);
    }
  }

  if (!activationEmailHandled) {
    const { data: userData } = await ctx.admin.auth.admin.getUserById(row.user_id);
    const email = userData?.user?.email ?? null;
    sendUserEmailInBackground(customerEmail(to, row, note, email));
  }

  return json({ ok: true, status: to, reviewedAt: now });
});

function customerEmail(
  to: ActivationStatus,
  row: { firm: string; plan_name: string; braxel_plan_name?: string | null },
  note: string,
  email: string | null,
) {
  const details: Array<[string, string]> = [
    ["Mesa", row.firm],
    ["Plano", row.plan_name],
  ];
  if (row.braxel_plan_name) details.push(["Pacote Braxel", row.braxel_plan_name]);
  if (note) details.push(["Observação", note]);

  const copy: Record<ActivationStatus, { subject: string; heading: string; body: string }> = {
    pending: {
      subject: "Ativação recebida — Braxel Markets",
      heading: "Ativação recebida",
      body: "Recebemos a sua solicitação de ativação. Vamos analisar em breve.",
    },
    in_review: {
      subject: "Ativação em análise — Braxel Markets",
      heading: "Ativação em análise",
      body: "A sua solicitação de ativação está em análise pela nossa equipe.",
    },
    info_requested: {
      subject: "Precisamos de mais informação — Braxel Markets",
      heading: "Precisamos de mais informação",
      body: "Para concluir a sua ativação precisamos de informação adicional. Veja a observação abaixo e atualize a sua solicitação no painel.",
    },
    approved: {
      subject: "Ativação aprovada — Braxel Markets",
      heading: "Ativação aprovada",
      body: "A sua ativação foi aprovada e o seu plano de sinais está ativo. No painel encontrará os próximos passos para conectar a sua ferramenta de execução.",
    },
    rejected: {
      subject: "Ativação recusada — Braxel Markets",
      heading: "Ativação recusada",
      body: "A sua solicitação de ativação foi recusada. Veja a observação abaixo e, se aplicável, envie uma nova solicitação.",
    },
    suspended: {
      subject: "Vínculo de conta suspenso — Braxel Markets",
      heading: "Vínculo de conta suspenso",
      body: "O vínculo da sua conta foi suspenso. Veja a observação abaixo e contacte o suporte para mais detalhes.",
    },
    disconnected: {
      subject: "Vínculo de conta desligado — Braxel Markets",
      heading: "Vínculo de conta desligado",
      body: "O vínculo da sua conta foi desligado. Se ainda tiver um pagamento confirmado, pode enviar um novo pedido no painel.",
    },
  };

  const c = copy[to];
  return {
    to: email,
    subject: c.subject,
    heading: c.heading,
    body: c.body,
    details,
  };
}
