// ============================================================================
// Account-link status state machine.
//
// Client-visible statuses: pending | in_review | info_requested | approved |
// rejected | suspended | disconnected. Pure and dependency-free so it is
// unit-tested directly and shared by activation-submit, activation-review,
// account-link and the front-end copy.
//
// The first five states existed before the onboarding phase. `suspended` and
// `disconnected` were added for the managed-account lifecycle:
//   * suspended    — an approved link is paused (operator decision);
//   * disconnected — the link is closed (operator or customer). A new request
//                    may be submitted afterwards.
// ============================================================================

export const ACTIVATION_STATUSES = [
  "pending",
  "in_review",
  "info_requested",
  "approved",
  "rejected",
  "suspended",
  "disconnected",
] as const;

export type ActivationStatus = (typeof ACTIVATION_STATUSES)[number];

export type ReviewAction =
  | "start_review"
  | "approve"
  | "reject"
  | "request_info"
  | "suspend"
  | "disconnect"
  | "reinstate";

/** Action -> the status it produces. */
export const ACTION_RESULT: Record<ReviewAction, ActivationStatus> = {
  start_review: "in_review",
  approve: "approved",
  reject: "rejected",
  request_info: "info_requested",
  suspend: "suspended",
  disconnect: "disconnected",
  reinstate: "approved",
};

const ALLOWED: Record<ActivationStatus, ReadonlyArray<ActivationStatus>> = {
  // A new submission lands as `pending` and is reviewed from there.
  pending: ["in_review", "approved", "rejected", "info_requested"],
  in_review: ["approved", "rejected", "info_requested"],
  // The client is asked for more detail; the operator may still act, or the
  // client may open a fresh submission (see isOpenStatus below).
  info_requested: ["in_review", "approved", "rejected"],
  // An approved link can be paused or closed. Reinstating a suspended link
  // re-approves it (documented operator action, audited separately).
  approved: ["suspended", "disconnected"],
  suspended: ["approved", "disconnected"],
  rejected: [],
  disconnected: [],
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

/**
 * True when a new account-link request must be refused because the customer
 * already has an open, approved or suspended link. Only a rejected or
 * disconnected link may be replaced.
 */
export function blocksNewSubmission(status: ActivationStatus): boolean {
  return status === "pending" ||
    status === "in_review" ||
    status === "approved" ||
    status === "suspended";
}

/** True when the link is connected (approved) and the plan is usable. */
export function isConnectedStatus(status: ActivationStatus | null | undefined): boolean {
  return status === "approved";
}

/** Human-readable labels are i18n keys on the client; this maps to the key. */
export function activationStatusKey(status: ActivationStatus): string {
  return `onboarding.status.${status}`;
}
