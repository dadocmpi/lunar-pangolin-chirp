// ============================================================================
// Plan activation service.
//
// The single server-side path that turns a VERIFIED payment into a durable
// entitlement, an activation record, an append-only audit event and exactly
// one activation email.
//
// Security contract:
//   * Entitlement is decided here from the payment row the caller read with
//     the service role; the browser never supplies a plan, amount or status.
//   * A payment must be `confirmed` (or the legacy `payment_confirmed`) before
//     anything is created. A redirect, URL parameter, localStorage value,
//     customer button, arbitrary amount/plan/currency or customer-declared
//     status can never reach this function as a confirmation.
//   * Every write is idempotent: one activation per payment_id, one audit row
//     per lifecycle event, one activation email per activation.
//   * No credential, card number, token or provider secret is stored or
//     emailed.
//   * Customers choose their own password at signup, so no password is ever
//     generated or emailed. A future passwordless provisioning flow must send
//     a Supabase single-use invite/recovery link, never a password value.
// ============================================================================

import { normalizePaymentStatus } from "./entitlement.ts";
import { PLANS, type PlanId } from "../plans.ts";
import {
  buildAccountActivatedEmail,
  buildPaymentDisputedEmail,
  buildPaymentFailedEmail,
  buildPaymentPendingEmail,
  buildPaymentReceivedEmail,
  buildPaymentRefundedEmail,
  buildAccountSuspendedEmail,
  type EmailContext,
  type TransactionalEmail,
  type TransactionalTemplateKey,
} from "../emailTemplates.ts";
import { sendUserEmail } from "../userEmail.ts";

// The Supabase client type differs between the versions pinned by different
// Edge Functions (2.45.0 vs 2.99.0). This helper is deliberately version
// agnostic; every caller passes a real service-role client.
// deno-lint-ignore no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceClient = any;

import {
  activationEmailIdempotencyKey,
  deriveLifecycle,
  formatAmount,
  generateAccountId,
  isConfirmablePaymentStatus,
  isKnownPlanKey,
  lifecycleTone,
  nextActionKey,
  paymentEmailIdempotencyKey,
  resolveAppUrl,
  type LifecycleState,
  type NextActionKey,
  type PlanActivationStatus,
} from "./lifecycle.ts";

export {
  activationEmailIdempotencyKey,
  deriveLifecycle,
  formatAmount,
  generateAccountId,
  isConfirmablePaymentStatus,
  isKnownPlanKey,
  lifecycleTone,
  nextActionKey,
  paymentEmailIdempotencyKey,
  resolveAppUrl,
};
export type { LifecycleState, NextActionKey, PlanActivationStatus };

export interface PlanActivationRow {
  id: string;
  user_id: string;
  payment_id: string;
  plan_key: string;
  plan_name: string;
  amount_cents: number;
  currency: string;
  method: string | null;
  account_id: string;
  status: PlanActivationStatus;
  activated_at: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
  disconnected_at: string | null;
  disconnected_reason: string | null;
  activation_email_sent_at: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentForActivation {
  id: string;
  user_id: string;
  plan_id?: string | null;
  plan_name?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  method?: string | null;
  status_enum?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
}

export type ActivationSource =
  | "stripe"
  | "wise"
  | "crypto"
  | "admin"
  | "test"
  | "system";

export interface ActivateArgs {
  admin: ServiceClient;
  payment: PaymentForActivation;
  source: ActivationSource;
  actor: "system" | "operator" | "user";
  actorId?: string | null;
  reason: string;
}

export interface ActivateResult {
  ok: boolean;
  error?: string;
  alreadyActive?: boolean;
  activation?: PlanActivationRow;
}

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

const AUDIT_TABLE = "plan_activations";

async function logPlanActivationEvent(
  admin: ServiceClient,
  input: {
    activationId: string;
    userId: string;
    event: string;
    from: string | null;
    to: string;
    actor: "system" | "operator" | "user";
    actorId?: string | null;
    source: ActivationSource;
    reason: string;
    /** Stable event id for once-only events; timestamped for repeatable ones. */
    stable: boolean;
    at?: string;
  },
): Promise<void> {
  const at = input.at ?? new Date().toISOString();
  const eventId = input.stable
    ? `plan:${input.event}:${input.activationId}`
    : `plan:${input.event}:${input.activationId}:${at}`;
  const { error } = await admin.from("payment_audit_log").insert({
    payment_table: AUDIT_TABLE,
    payment_id: input.activationId,
    user_id: input.userId,
    actor: input.actor,
    actor_id: input.actorId ?? null,
    source: input.source,
    event_id: eventId,
    previous_status: input.from,
    new_status: input.to,
    reason: input.reason.slice(0, 200),
    created_at: at,
  });
  if (error && error.code !== "23505") {
    console.error("plan_activation_audit_failed", {
      activationId: input.activationId,
      event: input.event,
      code: error.code,
    });
  }
}

/** Create or update the entitlement row in public.services (best effort). */
async function upsertEntitlement(
  admin: ServiceClient,
  args: {
    userId: string;
    planKey: PlanId;
    planName: string;
    accountId: string;
    paymentId: string;
  },
): Promise<void> {
  try {
    let { data: existing, error: readError } = await admin
      .from("services")
      .select("id")
      .eq("user_id", args.userId)
      .eq("plan_id", args.planKey)
      .eq("activated", true)
      .limit(1)
      .maybeSingle();
    if (!existing && !readError) {
      // A legacy row may predate the plan_id column; the production unique
      // index is (user_id, plan_name), so match on that before inserting.
      const byName = await admin
        .from("services")
        .select("id")
        .eq("user_id", args.userId)
        .eq("plan_name", args.planName)
        .eq("activated", true)
        .limit(1)
        .maybeSingle();
      existing = byName.data;
      readError = byName.error;
    }
    if (readError) {
      console.error("entitlement_read_failed", { code: readError.code });
      return;
    }
    if (existing?.id) {
      const { error } = await admin
        .from("services")
        .update({
          plan_name: args.planName,
          account_id: args.accountId,
          status: "Active",
          activated: true,
          source_payment_id: args.paymentId,
        })
        .eq("id", existing.id);
      if (error) console.error("entitlement_update_failed", { code: error.code });
      return;
    }
    const { error } = await admin.from("services").insert({
      user_id: args.userId,
      plan_name: args.planName,
      plan_id: args.planKey,
      account_id: args.accountId,
      status: "Active",
      balance: 0,
      activated: true,
      source_payment_id: args.paymentId,
    });
    if (error) console.error("entitlement_insert_failed", { code: error.code });
  } catch (err) {
    // The activation record is authoritative; a legacy services shape must not
    // roll back an otherwise valid activation.
    console.error("entitlement_write_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

async function readActivation(
  admin: ServiceClient,
  paymentId: string,
): Promise<PlanActivationRow | null> {
  const { data, error } = await admin
    .from("plan_activations")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();
  if (error) {
    console.error("plan_activation_read_failed", { code: error.code });
    return null;
  }
  return (data as PlanActivationRow | null) ?? null;
}

/**
 * Create or update the activation for a verified payment.
 *
 * Idempotent by payment_id. An operator suspension/disconnection is never
 * overwritten by a repeated webhook.
 */
export async function activatePlanFromVerifiedPayment(
  args: ActivateArgs,
): Promise<ActivateResult> {
  const { admin, payment } = args;
  const status = normalizePaymentStatus({
    status_enum: payment.status_enum,
    status: payment.status,
  });
  if (!isConfirmablePaymentStatus(status)) {
    return { ok: false, error: "payment_not_confirmed" };
  }
  if (!isKnownPlanKey(payment.plan_id)) {
    return { ok: false, error: "unknown_plan" };
  }
  const plan = PLANS[payment.plan_id];
  const now = new Date().toISOString();
  const accountId = generateAccountId(payment.id);

  const existing = await readActivation(admin, payment.id);
  if (existing) {
    if (existing.status === "active") {
      return { ok: true, alreadyActive: true, activation: existing };
    }
    if (existing.status === "suspended" || existing.status === "disconnected") {
      // An operator decision wins over a repeated provider event.
      return { ok: true, activation: existing };
    }
    const { data, error } = await admin
      .from("plan_activations")
      .update({
        status: "active",
        activated_at: existing.activated_at ?? now,
        plan_name: plan.name,
        amount_cents: payment.amount_cents ?? plan.priceCents,
        currency: payment.currency ?? "USD",
        method: payment.method ?? null,
        updated_at: now,
      })
      .eq("id", existing.id)
      .select("*")
      .maybeSingle();
    if (error || !data) {
      console.error("plan_activation_update_failed", { code: error?.code });
      return { ok: false, error: "activation_write_failed" };
    }
    await logPlanActivationEvent(admin, {
      activationId: existing.id,
      userId: payment.user_id,
      event: "activated",
      from: existing.status,
      to: "active",
      actor: args.actor,
      actorId: args.actorId ?? null,
      source: args.source,
      reason: args.reason,
      stable: true,
      at: now,
    });
    await upsertEntitlement(admin, {
      userId: payment.user_id,
      planKey: payment.plan_id,
      planName: plan.name,
      accountId,
      paymentId: payment.id,
    });
    return { ok: true, activation: data as PlanActivationRow };
  }

  const { data: inserted, error: insertError } = await admin
    .from("plan_activations")
    .insert({
      user_id: payment.user_id,
      payment_id: payment.id,
      plan_key: payment.plan_id,
      plan_name: plan.name,
      amount_cents: payment.amount_cents ?? plan.priceCents,
      currency: payment.currency ?? "USD",
      method: payment.method ?? null,
      account_id: accountId,
      status: "active",
      activated_at: now,
      source: args.source,
      updated_at: now,
    })
    .select("*")
    .maybeSingle();

  if (insertError || !inserted) {
    // A concurrent delivery may have inserted first; re-read is idempotent.
    if (insertError?.code === "23505") {
      const raced = await readActivation(admin, payment.id);
      if (raced) return { ok: true, activation: raced };
    }
    console.error("plan_activation_insert_failed", { code: insertError?.code });
    return { ok: false, error: "activation_write_failed" };
  }

  await logPlanActivationEvent(admin, {
    activationId: inserted.id,
    userId: payment.user_id,
    event: "activated",
    from: null,
    to: "active",
    actor: args.actor,
    actorId: args.actorId ?? null,
    source: args.source,
    reason: args.reason,
    stable: true,
    at: now,
  });
  await upsertEntitlement(admin, {
    userId: payment.user_id,
    planKey: payment.plan_id,
    planName: plan.name,
    accountId,
    paymentId: payment.id,
  });

  return { ok: true, activation: inserted as PlanActivationRow };
}

/** Record a lifecycle transition for an existing activation (operator path). */
export async function setActivationStatus(args: {
  admin: ServiceClient;
  activationId: string;
  status: PlanActivationStatus;
  reason: string;
  actor: "system" | "operator" | "user";
  actorId?: string | null;
  source: ActivationSource;
  event: string;
}): Promise<{ ok: boolean; activation?: PlanActivationRow; error?: string }> {
  const { admin } = args;
  const { data: current, error: readError } = await admin
    .from("plan_activations")
    .select("*")
    .eq("id", args.activationId)
    .maybeSingle();
  if (readError) return { ok: false, error: "lookup_failed" };
  if (!current) return { ok: false, error: "not_found" };

  const from = (current as PlanActivationRow).status;
  if (from === args.status) {
    return { ok: true, activation: current as PlanActivationRow };
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status: args.status, updated_at: now };
  if (args.status === "active") {
    patch.activated_at = (current as PlanActivationRow).activated_at ?? now;
    patch.suspended_at = null;
    patch.suspended_reason = null;
    patch.disconnected_at = null;
    patch.disconnected_reason = null;
  }
  if (args.status === "suspended") {
    patch.suspended_at = now;
    patch.suspended_reason = args.reason.slice(0, 500);
  }
  if (args.status === "disconnected") {
    patch.disconnected_at = now;
    patch.disconnected_reason = args.reason.slice(0, 500);
  }

  const { data, error } = await admin
    .from("plan_activations")
    .update(patch)
    .eq("id", args.activationId)
    .select("*")
    .maybeSingle();
  if (error || !data) return { ok: false, error: "update_failed" };

  await logPlanActivationEvent(admin, {
    activationId: args.activationId,
    userId: (current as PlanActivationRow).user_id,
    event: args.event,
    from,
    to: args.status,
    actor: args.actor,
    actorId: args.actorId ?? null,
    source: args.source,
    reason: args.reason,
    stable: false,
    at: now,
  });

  return { ok: true, activation: data as PlanActivationRow };
}

// ---------------------------------------------------------------------------
// Customer email
// ---------------------------------------------------------------------------

interface CustomerIdentity {
  email: string | null;
  firstName: string;
}

async function loadCustomer(
  admin: ServiceClient,
  userId: string,
): Promise<CustomerIdentity> {
  let email: string | null = null;
  let firstName = "";
  try {
    const { data } = await admin.auth.admin.getUserById(userId);
    email = data?.user?.email ?? null;
    const meta = (data?.user?.user_metadata ?? {}) as Record<string, unknown>;
    if (typeof meta.full_name === "string") {
      firstName = meta.full_name.trim().split(/\s+/)[0] ?? "";
    }
  } catch (err) {
    console.error("customer_identity_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("first_name, full_name")
      .eq("id", userId)
      .maybeSingle();
    const row = profile as { first_name?: string | null; full_name?: string | null } | null;
    const profileFirst = (row?.first_name ?? "").trim();
    if (profileFirst) firstName = profileFirst;
    else if (!firstName && row?.full_name) {
      firstName = row.full_name.trim().split(/\s+/)[0] ?? "";
    }
  } catch {
    // A missing profile must not block the email.
  }
  return { email, firstName: firstName || "there" };
}

function supportEmail(): string {
  return Deno.env.get("SUPPORT_INBOX_EMAIL")?.trim() ||
    "marketsbraxel@ouvidor.net";
}

function dashboardUrl(): string {
  return `${resolveAppUrl(Deno.env.get("APP_URL"))}/dashboard`;
}

function contextFor(
  customer: CustomerIdentity,
  args: {
    planName: string;
    amountFormatted: string;
    method: string;
    reference: string;
    accountId?: string | null;
    activationDate?: string | null;
    status?: string | null;
    note?: string | null;
  },
): EmailContext {
  return {
    firstName: customer.firstName,
    planName: args.planName,
    amountFormatted: args.amountFormatted,
    method: args.method,
    reference: args.reference,
    accountId: args.accountId ?? null,
    activationDate: args.activationDate ?? null,
    status: args.status ?? null,
    note: args.note ?? null,
    dashboardUrl: dashboardUrl(),
    supportEmail: supportEmail(),
  };
}

async function deliver(
  to: string | null,
  template: TransactionalEmail,
  idempotencyKey: string,
): Promise<{ ok: boolean; skipped?: string; error?: string }> {
  return await sendUserEmail({
    to,
    subject: template.subject,
    heading: template.heading,
    body: template.body,
    details: template.details,
    bullets: template.bullets,
    cta: template.cta,
    footnote: template.footnote,
    idempotencyKey,
    templateKey: template.templateKey,
  });
}

/**
 * Send the activation email at most once per activation.
 *
 * The claim is a conditional UPDATE guarded by `activation_email_claimed_at
 * IS NULL`, which Postgres serialises, so two concurrent webhook deliveries
 * cannot both claim it. A delivery failure releases the claim so a retry can
 * try again; the Resend Idempotency-Key prevents a duplicate if the first
 * attempt actually succeeded but the response was lost.
 */
export async function sendActivationEmailOnce(args: {
  admin: ServiceClient;
  activation: PlanActivationRow;
}): Promise<{ ok: boolean; sent: boolean; skipped?: string; error?: string }> {
  const { admin, activation } = args;
  if (activation.activation_email_sent_at) {
    return { ok: true, sent: false, skipped: "already_sent" };
  }

  const token = crypto.randomUUID();
  const now = new Date().toISOString();
  const { data: claimed, error: claimError } = await admin
    .from("plan_activations")
    .update({
      activation_email_claimed_at: now,
      activation_email_claim_token: token,
    })
    .eq("id", activation.id)
    .is("activation_email_sent_at", null)
    .is("activation_email_claimed_at", null)
    .select("id")
    .maybeSingle();

  if (claimError) {
    console.error("activation_email_claim_failed", { code: claimError.code });
    return { ok: false, sent: false, error: "claim_failed" };
  }
  if (!claimed) {
    return { ok: true, sent: false, skipped: "already_claimed" };
  }

  const customer = await loadCustomer(admin, activation.user_id);
  const template = buildAccountActivatedEmail(
    contextFor(customer, {
      planName: activation.plan_name,
      amountFormatted: formatAmount(activation.amount_cents, activation.currency),
      method: activation.method ?? "card",
      reference: activation.payment_id,
      accountId: activation.account_id,
      activationDate: activation.activated_at ?? now,
      status: "Active",
    }),
  );

  const delivered = await deliver(
    customer.email,
    template,
    activationEmailIdempotencyKey(activation.payment_id),
  );

  if (!delivered.ok) {
    // Release the claim so a later retry can attempt delivery again.
    await admin
      .from("plan_activations")
      .update({ activation_email_claimed_at: null, activation_email_claim_token: null })
      .eq("id", activation.id)
      .eq("activation_email_claim_token", token);
    return {
      ok: false,
      sent: false,
      skipped: delivered.skipped,
      error: delivered.error ?? "send_failed",
    };
  }

  await admin
    .from("plan_activations")
    .update({ activation_email_sent_at: new Date().toISOString() })
    .eq("id", activation.id);
  return { ok: true, sent: true };
}

/** Send one payment-lifecycle email (idempotent at the provider). */
export async function sendPaymentLifecycleEmail(args: {
  admin: ServiceClient;
  payment: PaymentForActivation;
  template: TransactionalTemplateKey;
  note?: string | null;
  activation?: PlanActivationRow | null;
}): Promise<{ ok: boolean; skipped?: string; error?: string }> {
  const { admin, payment, template } = args;
  const customer = await loadCustomer(admin, payment.user_id);
  const planName = payment.plan_name ?? "your plan";
  const ctx = contextFor(customer, {
    planName,
    amountFormatted: formatAmount(payment.amount_cents, payment.currency),
    method: payment.method ?? "card",
    reference: payment.id,
    accountId: args.activation?.account_id ?? null,
    activationDate: args.activation?.activated_at ?? null,
    note: args.note ?? null,
  });

  const built = (() => {
    switch (template) {
      case "payment_received":
        return buildPaymentReceivedEmail(ctx);
      case "payment_pending_manual_review":
        return buildPaymentPendingEmail(ctx);
      case "payment_failed":
        return buildPaymentFailedEmail(ctx);
      case "account_activated":
        return buildAccountActivatedEmail(ctx);
      case "account_suspended":
        return buildAccountSuspendedEmail(ctx);
      case "payment_refunded":
        return buildPaymentRefundedEmail(ctx);
      case "payment_disputed":
        return buildPaymentDisputedEmail(ctx);
    }
  })();

  return await deliver(
    customer.email,
    built,
    paymentEmailIdempotencyKey(template, payment.id),
  );
}
