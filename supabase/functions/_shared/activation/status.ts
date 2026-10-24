// ============================================================================
// Account-activation status state machine.
//
// Client-visible statuses: pending | in_review | info_requested | approved |
// rejected. Pure and dependency-free so it is unit-tested directly and shared
// by activation-submit, activation-review and the front-end copy.
// ============================================================================

export const ACTIVATION_STATUSES = [
  "pending",
  "in_review",
  "info_requested",
  "approved",
  "rejected",
] as const;

export type ActivationStatus = (typeof ACTIVATION_STATUSES)[number];

export type ReviewAction = "start_review" | "approve" | "reject" | "request_info";

/** Action -> the status it produces. */
export const ACTION_RESULT: Record<ReviewAction, ActivationStatus> = {
  start_review: "in_review",
  approve: "approved",
  reject: "rejected",
  request_info: "info_requested",
};

const ALLOWED: Record<ActivationStatus, ReadonlyArray<ActivationStatus>> = {
  // A new submission lands as `pending` and is reviewed from there.
  pending: ["in_review", "approved", "rejected", "info_requested"],
  in_review: ["approved", "rejected", "info_requested"],
  // The client is asked for more detail; the operator may still act, or the
  // client may open a fresh submission (see isOpenStatus below).
  info_requested: ["in_review", "approved", "rejected"],
  approved: [],
  rejected: [],
};

export function isActivationStatus(value: unknown): value is ActivationStatus {
  return typeof value === "string" &&
    (ACTIVATION_STATUSES as readonly string[]).includes(value);
}

export function canReview(from: ActivationStatus, to: ActivationStatus): boolean {
  return ALLOWED[from].includes(to);
}

/** True for a status that is awaiting a decision (blocks a duplicate submit). */
export function isOpenStatus(status: ActivationStatus): boolean {
  return status === "pending" || status === "in_review";
}

/** Human-readable labels are i18n keys on the client; this maps to the key. */
export function activationStatusKey(status: ActivationStatus): string {
  return `activation.status.${status}`;
}
