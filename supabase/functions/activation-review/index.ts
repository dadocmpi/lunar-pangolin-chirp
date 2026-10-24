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
import { notifyOwnerInBackground } from "../_shared/email.ts";
import { sendUserEmailInBackground } from "../_shared/userEmail.ts";

const BUCKET = "activation-receipts";
const SIGNED_URL_TTL_SECONDS = 300;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const REVIEW_ACTIONS: readonly ReviewAction[] = [
  "start_review",
  "approve",
  "reject",
  "request_info",
];

function isReviewAction(value: unknown): value is ReviewAction {
  return typeof value === "string" && (REVIEW_ACTIONS as readonly string[]).includes(value);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const config = activationConfigFromEnv();
  if (!config.enabled) {
    return json({ ok: false, error: "feature_disabled", feature: "activation_flow" }, 503);
  }

  let ctx;
  try {
    ctx = await requireOperator(req);
  } catch (e) {
    if (e instanceof ForbiddenError) return json({ error: "forbidden" }, 403);
    if (e instanceof UnauthorizedError) return json({ error: "unauthorized" }, 401);
    return json({ error: "unauthorized" }, 401);
  }

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
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const id = cleanText(body.id, 60);
  const action = body.action;
  if (!id) return json({ error: "missing_id" }, 400);
  if (!isReviewAction(action)) return json({ error: "invalid_action" }, 400);

  const note = cleanText(body.note, ACTIVATION_FIELD_LIMITS.operatorNote);
  if ((action === "reject" || action === "request_info") && !note) {
    return json({ error: "note_required" }, 400);
  }

  const { data: row, error: rowError } = await ctx.admin
    .from("account_activations")
    .select("id, user_id, status, firm, plan_name, account_login")
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
  const { error: updateError } = await ctx.admin
    .from("account_activations")
    .update({
      status: to,
      operator_note: note || null,
      reviewed_at: now,
      reviewed_by: ctx.user.id,
      updated_at: now,
    })
    .eq("id", id);
  if (updateError) return json({ error: "update_failed" }, 500);

  // Append-only audit trail. A failure here never rolls back the decision.
  const { error: auditError } = await ctx.admin.from("payment_audit_log").insert({
    payment_table: "account_activations",
    payment_id: id,
    user_id: row.user_id,
    actor: "operator",
    source: "admin",
    event_id: `activation-review:${id}:${action}:${now}`,
    previous_status: from,
    new_status: to,
    reason: `Activation ${action} by operator ${ctx.user.id}`.slice(0, 200),
    created_at: now,
  });
  if (auditError) console.error("activation audit log failed", { id, action });

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

  const { data: userData } = await ctx.admin.auth.admin.getUserById(row.user_id);
  const email = userData?.user?.email ?? null;
  sendUserEmailInBackground(customerEmail(to, row, note, email));

  return json({ ok: true, status: to, reviewedAt: now });
});

function customerEmail(
  to: ActivationStatus,
  row: { firm: string; plan_name: string },
  note: string,
  email: string | null,
) {
  const details: Array<[string, string]> = [
    ["Mesa", row.firm],
    ["Plano", row.plan_name],
  ];
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
