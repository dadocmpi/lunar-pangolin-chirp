// ============================================================================
// Effective link status.
//
// A stored `approved` link is only really connected while the payment behind it
// is still active. When the governing payment becomes refunded, canceled,
// disputed, failed or rejected, the customer must see `suspended` — even though
// no operator has touched the row. The stored status is never mutated on a
// read; the server derives the effective value for display and for the
// onboarding mutation gate.
//
// Pure and dependency-free.
// ============================================================================

import type { Entitlement } from "./entitlement.ts";
import type { LinkStatus } from "./status.ts";

export interface EffectiveLink {
  /** Stored status. */
  stored: LinkStatus;
  /** Status the customer and the API should see. */
  effective: LinkStatus;
  /** True when the difference is caused by an inactive payment. */
  suspendedByPayment: boolean;
}

export function deriveEffectiveLinkStatus(
  stored: LinkStatus,
  entitlement: Entitlement,
): EffectiveLink {
  if (stored === "approved" && !entitlement.active) {
    return { stored, effective: "suspended", suspendedByPayment: true };
  }
  return { stored, effective: stored, suspendedByPayment: false };
}
