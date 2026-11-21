// ============================================================================
// Server-side evidence checks for a Stripe payment confirmation.
//
// Nothing here trusts the browser. A payment may be confirmed only when the
// Stripe object proves all of the following:
//   * it is a subscription in a paid state;
//   * the Stripe Customer belongs to the pending payment's user;
//   * the Stripe Subscription belongs to the pending payment;
//   * the Price ID is the one configured for the pending payment's plan;
//   * the currency is the pending payment's currency;
//   * the paid amount equals the canonical server-side amount;
//   * the line item quantity is 1 and the price is a monthly recurring price.
//
// The functions are pure so they can be exercised without network or DB.
// ============================================================================

import { PLAN_IDS } from "../plans.ts";

export interface StripeObjectRef {
  id?: string | null;
}

export type StripeRef = string | StripeObjectRef | null | undefined;

export interface PendingPaymentLike {
  id: string;
  user_id: string;
  plan_id: string | null;
  plan_name?: string | null;
  amount_cents: number;
  currency: string;
  status?: string | null;
  status_enum?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface StripePriceLike {
  id?: string | null;
  currency?: string | null;
  unit_amount?: number | null;
  recurring?: { interval?: string | null } | null;
}

export interface StripeLineItemLike {
  price?: StripePriceLike | null;
  quantity?: number | null;
}

export interface StripeCheckoutSessionLike {
  id: string;
  mode?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer?: StripeRef;
  subscription?: StripeRef;
  payment_intent?: StripeRef;
  metadata?: Record<string, unknown> | null;
  line_items?: { data?: StripeLineItemLike[] | null } | null;
}

export interface StripeInvoiceLike {
  id: string;
  status?: string | null;
  paid?: boolean | null;
  amount_paid?: number | null;
  currency?: string | null;
  customer?: StripeRef;
  subscription?: StripeRef;
  payment_intent?: StripeRef;
  charge?: StripeRef;
  period_end?: number | null;
  lines?: { data?: StripeLineItemLike[] | null } | null;
  subscription_details?: { metadata?: Record<string, unknown> | null } | null;
}

export interface StripeSubscriptionLike {
  id: string;
  status?: string | null;
  customer?: StripeRef;
  metadata?: Record<string, unknown> | null;
  items?: { data?: StripeLineItemLike[] | null } | null;
}

export interface StripeCustomerLike {
  id: string;
  email?: string | null;
  metadata?: Record<string, unknown> | null;
}

export type StripeVerificationReason =
  | "ok"
  | "unknown_plan"
  | "price_not_configured"
  | "wrong_mode"
  | "not_paid"
  | "wrong_amount"
  | "wrong_currency"
  | "missing_customer"
  | "missing_subscription"
  | "customer_mismatch"
  | "customer_unverified"
  | "subscription_mismatch"
  | "subscription_unverified"
  | "subscription_not_active"
  | "wrong_price"
  | "wrong_quantity"
  | "wrong_interval"
  | "payment_mismatch"
  | "application_mismatch";

export interface StripeVerificationResult {
  ok: boolean;
  reason: StripeVerificationReason;
  detail?: string;
}

export interface StripeVerificationContext {
  pending: PendingPaymentLike;
  expectedPriceId: string | null;
  customer?: StripeCustomerLike | null;
  userEmail?: string | null;
  subscription?: StripeSubscriptionLike | null;
}

const PRICE_ENV_BY_PLAN: Record<string, string> = {
  starter: "STRIPE_PRICE_STARTER_USD",
  professional: "STRIPE_PRICE_PROFESSIONAL_USD",
  business: "STRIPE_PRICE_BUSINESS_USD",
  enterprise: "STRIPE_PRICE_ENTERPRISE_USD",
};

export function stripePriceEnvNameForPlan(
  planId: string | null | undefined,
): string | null {
  if (typeof planId !== "string") return null;
  return PRICE_ENV_BY_PLAN[planId] ?? null;
}

export function isCanonicalPlanId(planId: unknown): boolean {
  return typeof planId === "string" &&
    (PLAN_IDS as readonly string[]).includes(planId);
}

/**
 * Returns the configured Stripe Price ID for a canonical plan, or null when
 * the plan is unknown (including the Signals Plan, which is not a canonical
 * application plan) or the environment variable is unset.
 */
export function expectedPriceIdForPlan(
  planId: string | null | undefined,
  env: Record<string, string | undefined>,
): string | null {
  const envName = stripePriceEnvNameForPlan(planId);
  if (!envName) return null;
  const value = env[envName];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function refId(ref: StripeRef): string | null {
  if (typeof ref === "string") return ref.length > 0 ? ref : null;
  if (ref && typeof ref === "object" && typeof ref.id === "string") {
    return ref.id.length > 0 ? ref.id : null;
  }
  return null;
}

function metaString(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function sameCurrency(a: string | null | undefined, b: string): boolean {
  return typeof a === "string" && a.toLowerCase() === b.toLowerCase();
}

function verifyPrice(
  item: StripeLineItemLike | undefined,
  expectedPriceId: string,
  currency: string,
): StripeVerificationResult {
  if (!item || refId(item.price) !== expectedPriceId) {
    return { ok: false, reason: "wrong_price" };
  }
  if (item.quantity !== 1) {
    return { ok: false, reason: "wrong_quantity" };
  }
  if (!sameCurrency(item.price?.currency, currency)) {
    return { ok: false, reason: "wrong_currency" };
  }
  if (item.price?.recurring?.interval !== "month") {
    return { ok: false, reason: "wrong_interval" };
  }
  return { ok: true, reason: "ok" };
}

function verifyCustomerIdentity(
  ctx: StripeVerificationContext,
  customerId: string,
): StripeVerificationResult {
  const pendingCustomerId = metaString(ctx.pending.metadata, "stripe_customer_id");
  if (pendingCustomerId && pendingCustomerId !== customerId) {
    return { ok: false, reason: "customer_mismatch" };
  }

  const customer = ctx.customer;
  if (!customer) return { ok: false, reason: "customer_unverified" };
  if (customer.id !== customerId) {
    return { ok: false, reason: "customer_mismatch" };
  }

  const customerUserId = metaString(customer.metadata, "user_id");
  if (customerUserId) {
    return customerUserId === ctx.pending.user_id
      ? { ok: true, reason: "ok" }
      : { ok: false, reason: "customer_mismatch" };
  }

  const customerEmail = customer.email?.trim().toLowerCase();
  const userEmail = ctx.userEmail?.trim().toLowerCase();
  if (customerEmail && userEmail && customerEmail === userEmail) {
    return { ok: true, reason: "ok" };
  }
  return { ok: false, reason: "customer_unverified" };
}

function verifySubscriptionIdentity(
  ctx: StripeVerificationContext,
  subscriptionId: string,
  customerId: string,
  expectedPriceId: string,
  currency: string,
): StripeVerificationResult {
  const pendingSubscriptionId = metaString(
    ctx.pending.metadata,
    "stripe_subscription_id",
  );
  if (pendingSubscriptionId && pendingSubscriptionId !== subscriptionId) {
    return { ok: false, reason: "subscription_mismatch" };
  }

  const subscription = ctx.subscription;
  if (!subscription) return { ok: false, reason: "subscription_unverified" };
  if (subscription.id !== subscriptionId) {
    return { ok: false, reason: "subscription_mismatch" };
  }
  if (refId(subscription.customer) !== customerId) {
    return { ok: false, reason: "customer_mismatch" };
  }

  const subscriptionPendingId = metaString(
    subscription.metadata,
    "pending_payment_id",
  );
  if (subscriptionPendingId && subscriptionPendingId !== ctx.pending.id) {
    return { ok: false, reason: "subscription_mismatch" };
  }
  const subscriptionUserId = metaString(subscription.metadata, "user_id");
  if (subscriptionUserId && subscriptionUserId !== ctx.pending.user_id) {
    return { ok: false, reason: "subscription_mismatch" };
  }
  const subscriptionPlanId = metaString(subscription.metadata, "plan_id");
  if (subscriptionPlanId && subscriptionPlanId !== ctx.pending.plan_id) {
    return { ok: false, reason: "subscription_mismatch" };
  }

  const items = subscription.items?.data ?? [];
  if (items.length !== 1) {
    return { ok: false, reason: "wrong_price" };
  }
  return verifyPrice(items[0], expectedPriceId, currency);
}

function verifySessionMetadata(
  ctx: StripeVerificationContext,
  session: StripeCheckoutSessionLike,
): StripeVerificationResult {
  const sessionPendingId = metaString(session.metadata, "pending_payment_id");
  if (sessionPendingId && sessionPendingId !== ctx.pending.id) {
    return { ok: false, reason: "payment_mismatch" };
  }
  const sessionUserId = metaString(session.metadata, "user_id");
  if (sessionUserId && sessionUserId !== ctx.pending.user_id) {
    return { ok: false, reason: "payment_mismatch" };
  }
  const sessionPlanId = metaString(session.metadata, "plan_id");
  if (sessionPlanId && sessionPlanId !== ctx.pending.plan_id) {
    return { ok: false, reason: "payment_mismatch" };
  }
  const sessionApplicationId = metaString(session.metadata, "application_id");
  const pendingApplicationId = metaString(
    ctx.pending.metadata,
    "application_id",
  );
  if (
    sessionApplicationId && pendingApplicationId &&
    sessionApplicationId !== pendingApplicationId
  ) {
    return { ok: false, reason: "application_mismatch" };
  }
  return { ok: true, reason: "ok" };
}

/**
 * Validate a checkout.session.completed event. The session must have been
 * expanded with line_items.data.price before this is called.
 */
export function verifyCheckoutSession(
  ctx: StripeVerificationContext,
  session: StripeCheckoutSessionLike,
): StripeVerificationResult {
  if (!isCanonicalPlanId(ctx.pending.plan_id)) {
    return { ok: false, reason: "unknown_plan" };
  }
  if (!ctx.expectedPriceId) {
    return { ok: false, reason: "price_not_configured" };
  }
  if (session.mode !== "subscription") {
    return { ok: false, reason: "wrong_mode" };
  }
  if (session.payment_status !== "paid") {
    return { ok: false, reason: "not_paid" };
  }
  if (session.amount_total !== ctx.pending.amount_cents) {
    return {
      ok: false,
      reason: "wrong_amount",
      detail: `expected ${ctx.pending.amount_cents}, got ${session.amount_total}`,
    };
  }
  if (!sameCurrency(session.currency, ctx.pending.currency)) {
    return {
      ok: false,
      reason: "wrong_currency",
      detail: `expected ${ctx.pending.currency}, got ${session.currency}`,
    };
  }

  const customerId = refId(session.customer);
  const subscriptionId = refId(session.subscription);
  if (!customerId) return { ok: false, reason: "missing_customer" };
  if (!subscriptionId) return { ok: false, reason: "missing_subscription" };

  const meta = verifySessionMetadata(ctx, session);
  if (!meta.ok) return meta;

  const customer = verifyCustomerIdentity(ctx, customerId);
  if (!customer.ok) return customer;

  const subscription = verifySubscriptionIdentity(
    ctx,
    subscriptionId,
    customerId,
    ctx.expectedPriceId,
    ctx.pending.currency,
  );
  if (!subscription.ok) return subscription;

  const items = session.line_items?.data ?? [];
  if (items.length !== 1) return { ok: false, reason: "wrong_price" };
  return verifyPrice(items[0], ctx.expectedPriceId, ctx.pending.currency);
}

/**
 * Validate an invoice.paid event used as the recovery path for a lost
 * checkout.session.completed event. The invoice and subscription must both be
 * expanded with their price data before this is called.
 */
export function verifyInvoicePaid(
  ctx: StripeVerificationContext,
  invoice: StripeInvoiceLike,
  subscription: StripeSubscriptionLike,
): StripeVerificationResult {
  if (!isCanonicalPlanId(ctx.pending.plan_id)) {
    return { ok: false, reason: "unknown_plan" };
  }
  if (!ctx.expectedPriceId) {
    return { ok: false, reason: "price_not_configured" };
  }
  const expectedPriceId = ctx.expectedPriceId;
  if (invoice.status !== "paid" && invoice.paid !== true) {
    return { ok: false, reason: "not_paid" };
  }
  if (invoice.amount_paid !== ctx.pending.amount_cents) {
    return {
      ok: false,
      reason: "wrong_amount",
      detail: `expected ${ctx.pending.amount_cents}, got ${invoice.amount_paid}`,
    };
  }
  if (!sameCurrency(invoice.currency, ctx.pending.currency)) {
    return {
      ok: false,
      reason: "wrong_currency",
      detail: `expected ${ctx.pending.currency}, got ${invoice.currency}`,
    };
  }

  const customerId = refId(invoice.customer);
  const subscriptionId = refId(invoice.subscription);
  if (!customerId) return { ok: false, reason: "missing_customer" };
  if (!subscriptionId) return { ok: false, reason: "missing_subscription" };
  if (subscription.id !== subscriptionId) {
    return { ok: false, reason: "subscription_mismatch" };
  }
  if (refId(subscription.customer) !== customerId) {
    return { ok: false, reason: "customer_mismatch" };
  }
  if (subscription.status !== "active") {
    return { ok: false, reason: "subscription_not_active" };
  }

  const invoiceSubscriptionPendingId = metaString(
    invoice.subscription_details?.metadata,
    "pending_payment_id",
  );
  if (
    invoiceSubscriptionPendingId &&
    invoiceSubscriptionPendingId !== ctx.pending.id
  ) {
    return { ok: false, reason: "subscription_mismatch" };
  }

  const subscriptionCtx: StripeVerificationContext = { ...ctx, subscription };
  const customer = verifyCustomerIdentity(subscriptionCtx, customerId);
  if (!customer.ok) return customer;

  return verifySubscriptionIdentity(
    subscriptionCtx,
    subscriptionId,
    customerId,
    expectedPriceId,
    subscriptionCtx.pending.currency,
  );
}
