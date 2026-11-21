// ============================================================================
// Account-link lifecycle state machine.
//
// Statuses: pending | in_review | approved | rejected | suspended | disconnected
//
//   pending      the customer submitted a request, no operator has looked yet
//   in_review    an operator opened it
//   approved     the operator approved it and the link is connected
//   rejected     the operator refused it (terminal)
//   suspended    the link is paused (operator action, or a payment that is no
//                longer active — see deriveEffectiveLinkStatus)
//   disconnected the link is closed (terminal)
//
// Pure and dependency-free so it is unit-tested directly and shared by the
// submit/review/disconnect functions and the client copy.
// ============================================================================

export const LINK_STATUSES = [
  "pending",
  "in_review",
  "approved",
  "rejected",
  "suspended",
  "disconnected",
] as const;

export type LinkStatus = (typeof LINK_STATUSES)[number];

export const LINK_ACTIONS = [
  "start_review",
  "approve",
  "reject",
  "suspend",
  "disconnect",
] as const;

export type LinkAction = (typeof LINK_ACTIONS)[number];

/** Action -> the status it produces. */
export const ACTION_RESULT: Record<LinkAction, LinkStatus> = {
  start_review: "in_review",
  approve: "approved",
  reject: "rejected",
  suspend: "suspended",
  disconnect: "disconnected",
};

const ALLOWED: Record<LinkStatus, ReadonlyArray<LinkStatus>> = {
  pending: ["in_review", "approved", "rejected"],
  in_review: ["approved", "rejected", "suspended"],
  approved: ["suspended", "disconnected"],
  // Re-approving a suspended link is the operator's reconnection path.
  suspended: ["approved", "rejected", "disconnected"],
  rejected: [],
  disconnected: [],
};

export function isLinkStatus(value: unknown): value is LinkStatus {
  return typeof value === "string" && (LINK_STATUSES as readonly string[]).includes(value);
}

export function isLinkAction(value: unknown): value is LinkAction {
  return typeof value === "string" && (LINK_ACTIONS as readonly string[]).includes(value);
}

export function canTransition(from: LinkStatus, to: LinkStatus): boolean {
  return ALLOWED[from].includes(to);
}

/** True while a request occupies the customer's one-open-link slot. */
export function isOpenLinkStatus(status: LinkStatus): boolean {
  return status === "pending" ||
    status === "in_review" ||
    status === "approved" ||
    status === "suspended";
}

export function isTerminalLinkStatus(status: LinkStatus): boolean {
  return status === "rejected" || status === "disconnected";
}

/**
 * Audit event name for a transition. `approve` from `suspended` is a
 * reconnection, everything else maps one-to-one.
 */
export function linkAuditEvent(action: LinkAction, from: LinkStatus): string {
  if (action === "approve") {
    return from === "suspended"
      ? "account_link_reconnected"
      : "account_link_connected";
  }
  if (action === "start_review") return "account_link_review_started";
  if (action === "reject") return "account_link_rejected";
  if (action === "suspend") return "account_link_suspended";
  if (action === "disconnect") return "account_link_disconnected";
  return "account_link_updated";
}

/** i18n key for the status label. */
export function linkStatusKey(status: LinkStatus): string {
  return `onboarding.status.${status}`;
}
