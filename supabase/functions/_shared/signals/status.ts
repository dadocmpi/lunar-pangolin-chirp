// ============================================================================
// Signals-subscription status — the single mapping from a Stripe subscription
// status to the plan's state.
//
// Pure and dependency-free so it is unit-tested directly and shared by
// signals-checkout, stripe-webhook and the front-end copy. The plan is active
// ONLY when this module says so, and the input always comes from a verified
// Stripe webhook — never from the browser.
//
// Vocabulary (mirrors the CHECK constraint in
// 20261011000000_signals_subscription.sql):
//   none       — no subscription started yet
//   pending    — a Checkout Session was created, payment not confirmed
//   active     — Stripe confirmed payment: the plan is ON
//   past_due   — a charge failed; the plan is OFF until payment recovers
//   unpaid     — Stripe gave up retrying; the plan is OFF
//   incomplete — first payment never completed; the plan is OFF
//   canceled   — subscription cancelled/expired; the plan is OFF
// ============================================================================

export const SUBSCRIPTION_STATUSES = [
  "none",
  "pending",
  "active",
  "past_due",
  "unpaid",
  "incomplete",
  "canceled",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return typeof value === "string" &&
    (SUBSCRIPTION_STATUSES as readonly string[]).includes(value);
}

/**
 * Map a Stripe subscription.status to our vocabulary. Anything unknown maps to
 * the safe, INACTIVE side ('incomplete') rather than to 'active', so an
 * unrecognised status can never silently switch the plan on.
 *
 * 'trialing' counts as active (a trial still grants access). 'paused' and
 * 'incomplete_expired' are both inactive and recoverable only by paying again,
 * so they map to 'past_due' and 'canceled' respectively.
 */
export function stripeSubscriptionToStatus(stripeStatus: unknown): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "canceled";
    case "paused":
      return "past_due";
    case "canceled":
      return "canceled";
    default:
      return "incomplete";
  }
}

/** The plan is ON for exactly one status: 'active'. */
export function isPlanActive(status: SubscriptionStatus | null | undefined): boolean {
  return status === "active";
}

/**
 * Whether the customer should be shown a way to pay (or pay again). True for
 * every non-active status: a fresh plan, a failed charge, a cancellation or an
 * incomplete checkout can all be fixed by paying.
 */
export function needsPayment(status: SubscriptionStatus | null | undefined): boolean {
  return !isPlanActive(status);
}

/**
 * Whether a Stripe event should move the plan OFF. Used by the webhook to log a
 * deactivation and to notify the customer. `invoice.payment_failed` maps to
 * 'past_due', cancellation to 'canceled'.
 */
export function isInactiveStatus(status: SubscriptionStatus): boolean {
  return status !== "active";
}

/** i18n key for the customer-facing label. The client owns the actual copy. */
export function subscriptionStatusKey(status: SubscriptionStatus): string {
  return `subscription.status.${status}`;
}
