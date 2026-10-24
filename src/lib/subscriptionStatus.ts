// ============================================================================
// subscriptionStatus — client-side mirror of the signals-subscription state.
//
// Mirrors supabase/functions/_shared/signals/status.ts. Kept dependency-free so
// it is unit-testable and so the UI can never claim the plan is active when the
// server (i.e. a verified Stripe webhook) has not confirmed payment.
//
// The plan is ACTIVE for exactly one status: 'active'. Everything else is
// either a fresh plan, a pending checkout, a failed charge or a cancellation —
// all of which the customer can fix by paying.
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

/** The plan is ON for exactly one status: 'active'. */
export function isPlanActive(status: SubscriptionStatus | null | undefined): boolean {
  return status === "active";
}

/** Whether the customer should see a way to pay (or pay again). */
export function needsPayment(status: SubscriptionStatus | null | undefined): boolean {
  return !isPlanActive(status);
}

/**
 * A tone bucket for the subscription badge (maps to theme classes in the UI).
 * Only 'active' is positive; 'pending' is neutral; the rest are warnings.
 */
export function subscriptionTone(
  status: SubscriptionStatus,
): "active" | "pending" | "warning" {
  if (status === "active") return "active";
  if (status === "pending") return "pending";
  return "warning";
}

/**
 * Normalise a raw value from the activation row. FAIL-CLOSED: an absent or
 * unrecognised value is treated as 'none' (not active), never as active.
 */
export function resolveSubscriptionStatus(value: unknown): SubscriptionStatus {
  return isSubscriptionStatus(value) ? value : "none";
}
