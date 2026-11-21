// ============================================================================
// Stripe subscription status -> canonical payment status.
//
// The canonical status set is the one already understood by payment-status,
// the checkout UI and the onboarding entitlement resolver. Stripe lifecycle
// values that have no canonical equivalent are mapped onto the safest existing
// value:
//
//   active                    -> confirmed
//   canceled                  -> canceled
//   past_due / unpaid         -> failed
//   incomplete / incomplete_expired -> failed
//   trialing / paused         -> pending
//   anything unknown          -> failed (fail closed)
//
// A failed renewal therefore never leaves the payment row at "confirmed".
// ============================================================================

export const CANONICAL_PAYMENT_STATUSES = [
  "created",
  "pending",
  "processing",
  "confirmed",
  "failed",
  "rejected",
  "refunded",
  "disputed",
  "canceled",
  "pending_manual",
] as const;

export type CanonicalPaymentStatus = (typeof CANONICAL_PAYMENT_STATUSES)[number];

export function isCanonicalPaymentStatus(
  value: unknown,
): value is CanonicalPaymentStatus {
  return typeof value === "string" &&
    (CANONICAL_PAYMENT_STATUSES as readonly string[]).includes(value);
}

/** True when this Stripe event id was already applied to the payment row. */
export function wasEventProcessed(
  metadata: Record<string, unknown> | null | undefined,
  eventId: string,
): boolean {
  const ids = metadata?.processed_event_ids;
  return Array.isArray(ids) &&
    ids.some((id) => typeof id === "string" && id === eventId);
}

/**
 * Map a Stripe subscription.status to a canonical payment status.
 * Unknown values fail closed to "failed", never to "confirmed".
 */
export function mapStripeSubscriptionStatus(
  status: unknown,
): CanonicalPaymentStatus {
  switch (String(status ?? "").trim().toLowerCase()) {
    case "active":
      return "confirmed";
    case "canceled":
    case "cancelled":
      return "canceled";
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "failed";
    case "trialing":
    case "paused":
      return "pending";
    default:
      return "failed";
  }
}

/**
 * The value written to applications.payment_status. Existing activation gates
 * require exactly "payment_confirmed", so only a confirmed canonical status
 * maps to it.
 */
export function applicationPaymentStatusFor(
  status: CanonicalPaymentStatus,
): string {
  switch (status) {
    case "confirmed":
      return "payment_confirmed";
    case "failed":
      return "failed";
    case "canceled":
      return "canceled";
    case "refunded":
      return "refunded";
    case "disputed":
      return "disputed";
    default:
      return status;
  }
}
