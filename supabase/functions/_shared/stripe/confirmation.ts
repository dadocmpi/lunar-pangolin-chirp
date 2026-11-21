// ============================================================================
// Shared Stripe confirmation / lifecycle application.
//
// Both stripe-webhook and stripe-reconcile use these functions, so the same
// identity, Price ID, currency and amount checks run on every path that can
// mark a payment paid. A browser redirect never reaches this module.
// ============================================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import { notifyOwnerInBackground } from "../email.ts";
import {
  fetchCheckoutSession,
  fetchCustomer,
  fetchSubscription,
} from "./api.ts";
import {
  applicationPaymentStatusFor,
  isCanonicalPaymentStatus,
  mapStripeSubscriptionStatus,
  wasEventProcessed,
  type CanonicalPaymentStatus,
} from "./status.ts";
import {
  expectedPriceIdForPlan,
  refId,
  type PendingPaymentLike,
  type StripeCheckoutSessionLike,
  type StripeCustomerLike,
  type StripeInvoiceLike,
  type StripeSubscriptionLike,
  verifyCheckoutSession,
  verifyInvoicePaid,
} from "./verification.ts";

export type ConfirmationOutcome =
  | "confirmed"
  | "already_confirmed"
  | "already_processed"
  | "not_found"
  | "not_verified"
  | "no_change"
  | "status_applied"
  | "retryable_error";

export interface ConfirmationResult {
  status: ConfirmationOutcome;
  reason?: string;
  paymentId?: string;
  applicationId?: string | null;
  retryable?: boolean;
}

interface PendingRow extends PendingPaymentLike {
  metadata: Record<string, unknown> | null;
}

const PENDING_FIELDS =
  "id, user_id, plan_id, plan_name, amount_cents, currency, status, status_enum, metadata, confirmed_at";

function metaString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function processedEventIds(pending: PendingRow): string[] {
  const value = pending.metadata?.processed_event_ids;
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function isConfirmedStatus(pending: PendingRow): boolean {
  const value = (pending.status_enum ?? pending.status ?? "").toLowerCase();
  return value === "confirmed" || value === "payment_confirmed";
}

/** The enum column rejects the legacy "payment_confirmed" text value. */
function canonicalCurrentStatus(
  pending: PendingRow,
): CanonicalPaymentStatus | null {
  const value = (pending.status_enum ?? pending.status ?? "").toLowerCase();
  if (isCanonicalPaymentStatus(value)) return value;
  return isConfirmedStatus(pending) ? "confirmed" : null;
}

async function loadPendingById(
  supabase: SupabaseClient,
  id: string,
  expectedUserId?: string,
): Promise<PendingRow | null> {
  let query = supabase
    .from("pending_payments")
    .select(PENDING_FIELDS)
    .eq("id", id);
  if (expectedUserId) query = query.eq("user_id", expectedUserId);
  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as PendingRow;
}

async function findPendingBySubscription(
  supabase: SupabaseClient,
  subscriptionId: string,
  subscriptionMetadata: Record<string, unknown> | null | undefined,
  expectedUserId?: string,
): Promise<PendingRow | null> {
  const metadataPendingId = metaString(
    subscriptionMetadata,
    "pending_payment_id",
  );
  if (metadataPendingId) {
    const pending = await loadPendingById(
      supabase,
      metadataPendingId,
      expectedUserId,
    );
    if (!pending) return null;
    const metadataUserId = metaString(subscriptionMetadata, "user_id");
    if (metadataUserId && pending.user_id !== metadataUserId) return null;
    return pending;
  }

  let query = supabase
    .from("pending_payments")
    .select(PENDING_FIELDS)
    .eq("method", "stripe");
  if (expectedUserId) query = query.eq("user_id", expectedUserId);
  const { data, error } = await query;
  if (error || !data) return null;
  return (data as PendingRow[]).find((row) =>
    metaString(row.metadata, "stripe_subscription_id") === subscriptionId
  ) ?? null;
}

function subscriptionIdentityProblem(
  pending: PendingRow,
  subscription: StripeSubscriptionLike,
): "customer_mismatch" | "plan_mismatch" | null {
  const pendingCustomerId = metaString(
    pending.metadata,
    "stripe_customer_id",
  );
  const subscriptionCustomerId = refId(subscription.customer);
  if (
    pendingCustomerId && subscriptionCustomerId &&
    pendingCustomerId !== subscriptionCustomerId
  ) {
    return "customer_mismatch";
  }

  const subscriptionPlanId = metaString(subscription.metadata, "plan_id");
  if (
    pending.plan_id && subscriptionPlanId &&
    pending.plan_id !== subscriptionPlanId
  ) {
    return "plan_mismatch";
  }
  return null;
}

async function userEmailFor(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) return null;
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

export async function insertAuditOnce(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
): Promise<boolean> {
  const { error } = await supabase.from("payment_audit_log").insert(row);
  if (!error) return true;
  // The unique index on (payment_table, payment_id, event_id) makes a retry a
  // no-op. Any other error is logged but never aborts the webhook response.
  if ((error as { code?: string }).code !== "23505") {
    console.error("[stripe] audit insert failed", {
      code: (error as { code?: string }).code,
    });
  }
  return false;
}

async function updateApplicationForConfirmation(
  supabase: SupabaseClient,
  applicationId: string | null,
  now: string,
): Promise<void> {
  if (!applicationId) return;

  const { data: application, error } = await supabase
    .from("applications")
    .select("id, activation_status")
    .eq("id", applicationId)
    .maybeSingle();
  if (error || !application) return;

  const update: Record<string, unknown> = {
    payment_status: "payment_confirmed",
    updated_at: now,
  };
  // Never downgrade an already active application. Only the initial pending
  // row is moved to activation_pending; operator activation remains manual.
  if (application.activation_status === "pending") {
    update.activation_status = "activation_pending";
  }
  await supabase.from("applications").update(update).eq("id", applicationId);
}

async function confirmPending(
  supabase: SupabaseClient,
  pending: PendingRow,
  args: {
    eventId: string;
    source: "checkout.session.completed" | "invoice.paid" | "stripe-reconcile";
    customerId: string;
    subscriptionId: string;
    priceId: string;
    amountTotal: number;
    currency: string;
    invoiceId?: string | null;
    paymentIntentId?: string | null;
    chargeId?: string | null;
    periodEnd?: string | null;
  },
): Promise<ConfirmationResult> {
  const now = new Date().toISOString();
  const previousStatus = canonicalCurrentStatus(pending);
  const alreadyConfirmed = isConfirmedStatus(pending);

  if (alreadyConfirmed) {
    const metadata = {
      ...(pending.metadata ?? {}),
      ...(args.customerId ? { stripe_customer_id: args.customerId } : {}),
      ...(args.subscriptionId
        ? { stripe_subscription_id: args.subscriptionId }
        : {}),
      ...(args.priceId ? { stripe_price_id: args.priceId } : {}),
      stripe_amount_total: args.amountTotal,
      stripe_currency: args.currency,
      ...(args.invoiceId ? { stripe_latest_invoice_id: args.invoiceId } : {}),
      ...(args.paymentIntentId
        ? { stripe_latest_payment_intent: args.paymentIntentId }
        : {}),
      ...(args.chargeId ? { stripe_charge_id: args.chargeId } : {}),
      ...(args.periodEnd ? { current_period_end: args.periodEnd } : {}),
      processed_event_ids: [
        ...processedEventIds(pending).filter((id) => id !== args.eventId),
        args.eventId,
      ],
    };
    await supabase
      .from("pending_payments")
      .update({ metadata })
      .eq("id", pending.id)
      .eq("user_id", pending.user_id);
    return {
      status: "already_confirmed",
      paymentId: pending.id,
      applicationId: metaString(pending.metadata, "application_id"),
    };
  }

  const metadata = {
    ...(pending.metadata ?? {}),
    ...(args.customerId ? { stripe_customer_id: args.customerId } : {}),
    ...(args.subscriptionId
      ? { stripe_subscription_id: args.subscriptionId }
      : {}),
    ...(args.priceId ? { stripe_price_id: args.priceId } : {}),
    stripe_amount_total: args.amountTotal,
    stripe_currency: args.currency,
    ...(args.invoiceId ? { stripe_latest_invoice_id: args.invoiceId } : {}),
    ...(args.paymentIntentId
      ? { stripe_latest_payment_intent: args.paymentIntentId }
      : {}),
    ...(args.chargeId ? { stripe_charge_id: args.chargeId } : {}),
    ...(args.periodEnd ? { current_period_end: args.periodEnd } : {}),
    last_applied_status: "confirmed",
    confirmed_by: args.source,
    processed_event_ids: [
      ...processedEventIds(pending).filter((id) => id !== args.eventId),
      args.eventId,
    ],
  };

  const { error: updateError } = await supabase
    .from("pending_payments")
    .update({
      status: "confirmed",
      status_enum: "confirmed",
      confirmed_at: now,
      metadata,
    })
    .eq("id", pending.id)
    .eq("user_id", pending.user_id);

  if (updateError) {
    return {
      status: "retryable_error",
      reason: "pending_payment_update_failed",
      retryable: true,
    };
  }

  const applicationId = metaString(pending.metadata, "application_id");
  await updateApplicationForConfirmation(supabase, applicationId, now);

  await insertAuditOnce(supabase, {
    payment_table: "pending_payments",
    payment_id: pending.id,
    user_id: pending.user_id,
    actor: "system",
    source: "stripe",
    event_id: args.eventId,
    previous_status: previousStatus,
    new_status: "confirmed",
    reason: `Verified ${args.source}: ${args.currency.toUpperCase()} ${
      (args.amountTotal / 100).toFixed(2)
    } for ${pending.plan_id ?? "unknown-plan"}`,
    created_at: now,
  });

  notifyOwnerInBackground({
    type: "pagamento",
    subject: "Pagamento Stripe confirmado",
    data: {
      payment_id: pending.id,
      application_id: applicationId,
      plan_id: pending.plan_id,
      amount_cents: args.amountTotal,
      currency: args.currency,
      stripe_customer_id: args.customerId,
      stripe_subscription_id: args.subscriptionId,
      stripe_price_id: args.priceId,
      source: args.source,
      status: "confirmed",
    },
    idempotencyKey: `stripe-confirm:${pending.id}`,
  });

  return {
    status: "confirmed",
    paymentId: pending.id,
    applicationId,
  };
}

/**
 * Confirm from checkout.session.completed. The session is re-read with
 * line_items.data.price expanded so the Price ID can be verified.
 */
export async function confirmFromCheckoutSession(
  supabase: SupabaseClient,
  stripeSecretKey: string,
  session: StripeCheckoutSessionLike,
  eventId: string,
  expectedUserId?: string,
): Promise<ConfirmationResult> {
  const pendingPaymentId = metaString(session.metadata, "pending_payment_id");
  if (!pendingPaymentId) {
    return { status: "not_found", reason: "missing_pending_payment_id" };
  }

  const pending = await loadPendingById(
    supabase,
    pendingPaymentId,
    expectedUserId,
  );
  if (!pending) return { status: "not_found", reason: "pending_payment_missing" };

  if (wasEventProcessed(pending.metadata, eventId)) {
    return { status: "already_processed", paymentId: pending.id };
  }
  if (isConfirmedStatus(pending)) {
    return confirmPending(supabase, pending, {
      eventId,
      source: "checkout.session.completed",
      customerId: refId(session.customer) ??
        metaString(pending.metadata, "stripe_customer_id") ?? "",
      subscriptionId: refId(session.subscription) ??
        metaString(pending.metadata, "stripe_subscription_id") ?? "",
      priceId: metaString(pending.metadata, "stripe_price_id") ?? "",
      amountTotal: pending.amount_cents,
      currency: pending.currency,
      paymentIntentId: refId(session.payment_intent),
    });
  }

  const expanded = await fetchCheckoutSession<StripeCheckoutSessionLike>(
    session.id,
    stripeSecretKey,
  );
  if (!expanded.ok) {
    return {
      status: "retryable_error",
      reason: expanded.error,
      retryable: true,
    };
  }

  const subscriptionId = refId(expanded.data.subscription);
  const customerId = refId(expanded.data.customer);
  if (!subscriptionId) {
    return { status: "not_verified", reason: "missing_subscription" };
  }
  if (!customerId) {
    return { status: "not_verified", reason: "missing_customer" };
  }

  const subscription = await fetchSubscription<StripeSubscriptionLike>(
    subscriptionId,
    stripeSecretKey,
  );
  if (!subscription.ok) {
    return {
      status: "retryable_error",
      reason: subscription.error,
      retryable: true,
    };
  }

  const customer = await fetchCustomer<StripeCustomerLike>(
    customerId,
    stripeSecretKey,
  );
  if (!customer.ok) {
    return {
      status: "retryable_error",
      reason: customer.error,
      retryable: true,
    };
  }

  const verification = verifyCheckoutSession(
    {
      pending,
      expectedPriceId: expectedPriceIdForPlan(
        pending.plan_id,
        Deno.env.toObject(),
      ),
      customer: customer.data,
      userEmail: await userEmailFor(supabase, pending.user_id),
      subscription: subscription.data,
    },
    expanded.data,
  );
  if (!verification.ok) {
    return {
      status: "not_verified",
      reason: verification.reason,
      paymentId: pending.id,
    };
  }

  return confirmPending(supabase, pending, {
    eventId,
    source: "checkout.session.completed",
    customerId,
    subscriptionId,
    priceId: refId(expanded.data.line_items?.data?.[0]?.price) ?? "",
    amountTotal: expanded.data.amount_total ?? 0,
    currency: (expanded.data.currency ?? "").toLowerCase(),
    paymentIntentId: refId(expanded.data.payment_intent),
  });
}

/**
 * Confirm from invoice.paid. This is the recovery path when
 * checkout.session.completed was lost or delivered out of order.
 */
export async function confirmFromInvoicePaid(
  supabase: SupabaseClient,
  stripeSecretKey: string,
  invoice: StripeInvoiceLike,
  eventId: string,
  expectedUserId?: string,
): Promise<ConfirmationResult> {
  const subscriptionId = refId(invoice.subscription);
  if (!subscriptionId) {
    return { status: "not_found", reason: "missing_subscription" };
  }

  const subscription = await fetchSubscription<StripeSubscriptionLike>(
    subscriptionId,
    stripeSecretKey,
  );
  if (!subscription.ok) {
    return {
      status: "retryable_error",
      reason: subscription.error,
      retryable: true,
    };
  }

  const pending = await findPendingBySubscription(
    supabase,
    subscriptionId,
    subscription.data.metadata,
    expectedUserId,
  );
  if (!pending) return { status: "not_found", reason: "pending_payment_missing" };

  if (wasEventProcessed(pending.metadata, eventId)) {
    return { status: "already_processed", paymentId: pending.id };
  }
  if (isConfirmedStatus(pending)) {
    return confirmPending(supabase, pending, {
      eventId,
      source: "invoice.paid",
      customerId: refId(invoice.customer) ??
        metaString(pending.metadata, "stripe_customer_id") ?? "",
      subscriptionId,
      priceId: metaString(pending.metadata, "stripe_price_id") ?? "",
      amountTotal: pending.amount_cents,
      currency: pending.currency,
      invoiceId: invoice.id,
      paymentIntentId: refId(invoice.payment_intent),
      chargeId: refId(invoice.charge),
    });
  }

  const customerId = refId(invoice.customer);
  if (!customerId) {
    return { status: "not_verified", reason: "missing_customer" };
  }

  const customer = await fetchCustomer<StripeCustomerLike>(
    customerId,
    stripeSecretKey,
  );
  if (!customer.ok) {
    return {
      status: "retryable_error",
      reason: customer.error,
      retryable: true,
    };
  }

  const verification = verifyInvoicePaid(
    {
      pending,
      expectedPriceId: expectedPriceIdForPlan(
        pending.plan_id,
        Deno.env.toObject(),
      ),
      customer: customer.data,
      userEmail: await userEmailFor(supabase, pending.user_id),
      subscription: subscription.data,
    },
    invoice,
    subscription.data,
  );
  if (!verification.ok) {
    return {
      status: "not_verified",
      reason: verification.reason,
      paymentId: pending.id,
    };
  }

  const periodEnd = typeof invoice.period_end === "number"
    ? new Date(invoice.period_end * 1000).toISOString()
    : null;

  return confirmPending(supabase, pending, {
    eventId,
    source: "invoice.paid",
    customerId,
    subscriptionId,
    priceId: refId(subscription.data.items?.data?.[0]?.price) ?? "",
    amountTotal: invoice.amount_paid ?? 0,
    currency: (invoice.currency ?? "").toLowerCase(),
    invoiceId: invoice.id,
    paymentIntentId: refId(invoice.payment_intent),
    chargeId: refId(invoice.charge),
    periodEnd,
  });
}

/**
 * Apply a customer.subscription.updated event. A transition to "active" does
 * NOT confirm a payment by itself; only checkout/invoice evidence can do that.
 */
export async function applySubscriptionStatus(
  supabase: SupabaseClient,
  subscription: StripeSubscriptionLike,
  eventId: string,
): Promise<ConfirmationResult> {
  const pending = await findPendingBySubscription(
    supabase,
    subscription.id,
    subscription.metadata,
  );
  if (!pending) return { status: "not_found", reason: "pending_payment_missing" };

  const identityProblem = subscriptionIdentityProblem(pending, subscription);
  if (identityProblem) {
    return {
      status: "not_verified",
      reason: identityProblem,
      paymentId: pending.id,
    };
  }

  if (wasEventProcessed(pending.metadata, eventId)) {
    return { status: "already_processed", paymentId: pending.id };
  }

  const current = canonicalCurrentStatus(pending);
  let next = mapStripeSubscriptionStatus(subscription.status);
  let reason = `stripe subscription status: ${subscription.status ?? "unknown"}`;

  if (next === "confirmed" && current !== "confirmed") {
    // No invoice evidence in this event. Keep the payment unconfirmed until
    // invoice.paid (or a reconciliation) verifies the charge.
    next = "pending";
    reason = "active subscription without verified invoice";
  }

  const now = new Date().toISOString();
  const metadata = {
    ...(pending.metadata ?? {}),
    last_applied_status: next,
    processed_event_ids: [
      ...processedEventIds(pending).filter((id) => id !== eventId),
      eventId,
    ],
  };

  if (current === next) {
    await supabase
      .from("pending_payments")
      .update({ metadata })
      .eq("id", pending.id)
      .eq("user_id", pending.user_id);
    return { status: "no_change", paymentId: pending.id, reason };
  }

  const { error } = await supabase
    .from("pending_payments")
    .update({ status: next, status_enum: next, metadata })
    .eq("id", pending.id)
    .eq("user_id", pending.user_id);
  if (error) {
    return {
      status: "retryable_error",
      reason: "pending_payment_update_failed",
      retryable: true,
    };
  }

  const applicationId = metaString(pending.metadata, "application_id");
  if (applicationId) {
    await supabase
      .from("applications")
      .update({
        payment_status: applicationPaymentStatusFor(next),
        updated_at: now,
      })
      .eq("id", applicationId);
  }

  await insertAuditOnce(supabase, {
    payment_table: "pending_payments",
    payment_id: pending.id,
    user_id: pending.user_id,
    actor: "system",
    source: "stripe",
    event_id: eventId,
    previous_status: current || null,
    new_status: next,
    reason: reason.slice(0, 200),
    created_at: now,
  });

  if (next !== "confirmed") {
    notifyOwnerInBackground({
      type: "pagamento",
      subject: `Assinatura Stripe ${next}`,
      data: {
        payment_id: pending.id,
        application_id: applicationId,
        stripe_subscription_id: subscription.id,
        status: next,
        reason,
      },
      idempotencyKey: `stripe-subscription:${pending.id}:${eventId}`,
    });
  }

  return { status: "status_applied", paymentId: pending.id, reason };
}

/**
 * Apply invoice.payment_failed. A failed renewal always becomes "failed", never
 * "confirmed" and never an invalid Stripe lifecycle string.
 */
export async function markInvoicePaymentFailed(
  supabase: SupabaseClient,
  stripeSecretKey: string,
  invoice: StripeInvoiceLike,
  eventId: string,
): Promise<ConfirmationResult> {
  const subscriptionId = refId(invoice.subscription);
  if (!subscriptionId) {
    return { status: "not_found", reason: "missing_subscription" };
  }

  const subscription = await fetchSubscription<StripeSubscriptionLike>(
    subscriptionId,
    stripeSecretKey,
  );
  const subscriptionMetadata = subscription.ok
    ? subscription.data.metadata
    : null;

  const pending = await findPendingBySubscription(
    supabase,
    subscriptionId,
    subscriptionMetadata,
  );
  if (!pending) return { status: "not_found", reason: "pending_payment_missing" };

  if (subscription.ok) {
    const identityProblem = subscriptionIdentityProblem(
      pending,
      subscription.data,
    );
    if (identityProblem) {
      return {
        status: "not_verified",
        reason: identityProblem,
        paymentId: pending.id,
      };
    }
  }

  if (wasEventProcessed(pending.metadata, eventId)) {
    return { status: "already_processed", paymentId: pending.id };
  }

  const current = canonicalCurrentStatus(pending);
  const next: CanonicalPaymentStatus = "failed";
  const now = new Date().toISOString();
  const metadata = {
    ...(pending.metadata ?? {}),
    last_applied_status: next,
    last_payment_failure_at: now,
    processed_event_ids: [
      ...processedEventIds(pending).filter((id) => id !== eventId),
      eventId,
    ],
  };

  if (current === next) {
    await supabase
      .from("pending_payments")
      .update({ metadata })
      .eq("id", pending.id)
      .eq("user_id", pending.user_id);
    return { status: "no_change", paymentId: pending.id };
  }

  const { error } = await supabase
    .from("pending_payments")
    .update({ status: next, status_enum: next, metadata })
    .eq("id", pending.id)
    .eq("user_id", pending.user_id);
  if (error) {
    return {
      status: "retryable_error",
      reason: "pending_payment_update_failed",
      retryable: true,
    };
  }

  const applicationId = metaString(pending.metadata, "application_id");
  if (applicationId) {
    await supabase
      .from("applications")
      .update({ payment_status: "failed", updated_at: now })
      .eq("id", applicationId);
  }

  await insertAuditOnce(supabase, {
    payment_table: "pending_payments",
    payment_id: pending.id,
    user_id: pending.user_id,
    actor: "system",
    source: "stripe",
    event_id: eventId,
    previous_status: current || null,
    new_status: next,
    reason: "Stripe invoice.payment_failed: renewal failed",
    created_at: now,
  });

  notifyOwnerInBackground({
    type: "pagamento",
    subject: "Renovação Stripe falhou",
    data: {
      payment_id: pending.id,
      application_id: applicationId,
      stripe_subscription_id: subscriptionId,
      status: "failed",
    },
    idempotencyKey: `stripe-failed:${pending.id}:${eventId}`,
  });

  return { status: "status_applied", paymentId: pending.id };
}
