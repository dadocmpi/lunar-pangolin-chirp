// Pure validation for a Stripe Checkout Session before it may confirm a
// payment. A redirect back to the success page — or a `checkout.session.completed`
// event — is NOT proof of payment on its own: the session must be complete,
// paid, in the expected mode and currency, and for the exact amount and plan
// the server recorded when it created the pending payment.
//
// This module is shared by stripe-webhook (event path) and stripe-reconcile
// (lost-event recovery path) so both apply the same rules.

export interface StripeCheckoutSessionLike {
  id?: unknown;
  mode?: unknown;
  currency?: unknown;
  amount_total?: unknown;
  payment_status?: unknown;
  customer?: unknown;
  subscription?: unknown;
  metadata?: Record<string, unknown> | null;
}

export interface PendingPaymentLike {
  id: string;
  user_id?: string | null;
  plan_id?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  metadata: Record<string, unknown> | null;
  status_enum?: string | null;
}

export interface SessionValidation {
  ok: boolean;
  code?: string;
  reason?: string;
}

// Stripe reports "paid" for a settled card payment and "no_payment_required"
// for a $0 first invoice (100% coupon / trial). "unpaid" must never confirm.
const CONFIRMABLE_PAYMENT_STATUSES = new Set(["paid", "no_payment_required"]);

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function idOf(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object") {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" && id.length > 0 ? id : null;
  }
  return null;
}

export function validateCheckoutSession(args: {
  session: StripeCheckoutSessionLike;
  pendingPayment: PendingPaymentLike;
  applicationPlanKey?: string | null;
  expectedCurrency?: string;
}): SessionValidation {
  const { session, pendingPayment } = args;
  const expectedCurrency = (args.expectedCurrency ?? "usd").toLowerCase();

  const sessionMeta = session.metadata ?? {};
  const metaPendingId = asNonEmptyString(sessionMeta.pending_payment_id);
  if (metaPendingId && metaPendingId !== pendingPayment.id) {
    return {
      ok: false,
      code: "pending_payment_mismatch",
      reason:
        `session metadata pending_payment_id ${metaPendingId} != ${pendingPayment.id}`,
    };
  }

  const mode = asNonEmptyString(session.mode);
  if (mode !== "subscription") {
    return {
      ok: false,
      code: "unexpected_mode",
      reason: `mode=${mode ?? "null"}`,
    };
  }

  const currency = asNonEmptyString(session.currency);
  if (!currency || currency.toLowerCase() !== expectedCurrency) {
    return {
      ok: false,
      code: "currency_mismatch",
      reason: `currency=${currency ?? "null"} expected=${expectedCurrency}`,
    };
  }

  const paymentStatus = asNonEmptyString(session.payment_status);
  if (!paymentStatus || !CONFIRMABLE_PAYMENT_STATUSES.has(paymentStatus)) {
    return {
      ok: false,
      code: "payment_not_paid",
      reason: `payment_status=${paymentStatus ?? "null"}`,
    };
  }

  const amountTotal = typeof session.amount_total === "number"
    ? session.amount_total
    : null;
  if (amountTotal === null || !Number.isFinite(amountTotal) || amountTotal < 0) {
    return {
      ok: false,
      code: "invalid_amount",
      reason: `amount_total=${String(session.amount_total)}`,
    };
  }

  const expectedCents = typeof pendingPayment.amount_cents === "number"
    ? pendingPayment.amount_cents
    : null;
  if (expectedCents === null || expectedCents <= 0) {
    return {
      ok: false,
      code: "missing_expected_amount",
      reason: "pending payment has no canonical amount",
    };
  }
  // A $0 total is allowed for a trial / 100% coupon; any other total must
  // equal the amount the server recorded, never under- or over-pay.
  if (amountTotal !== expectedCents && amountTotal !== 0) {
    return {
      ok: false,
      code: "amount_mismatch",
      reason: `amount_total=${amountTotal} expected=${expectedCents}`,
    };
  }

  const pendingCurrency = asNonEmptyString(pendingPayment.currency);
  if (pendingCurrency && pendingCurrency.toLowerCase() !== expectedCurrency) {
    return {
      ok: false,
      code: "pending_currency_mismatch",
      reason: `pending currency=${pendingCurrency}`,
    };
  }

  const applicationPlanKey = asNonEmptyString(args.applicationPlanKey);
  const pendingPlanId = asNonEmptyString(pendingPayment.plan_id);
  if (applicationPlanKey && pendingPlanId && applicationPlanKey !== pendingPlanId) {
    return {
      ok: false,
      code: "plan_mismatch",
      reason:
        `application plan=${applicationPlanKey} pending plan=${pendingPlanId}`,
    };
  }

  if (!idOf(session.subscription)) {
    return {
      ok: false,
      code: "missing_subscription",
      reason: "subscription mode without a subscription id",
    };
  }

  return { ok: true };
}
