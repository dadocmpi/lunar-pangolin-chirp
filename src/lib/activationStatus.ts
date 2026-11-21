// ============================================================================
// activationStatus — pure client-side helpers for the account-link lifecycle.
//
// Mirrors the server state machine in
// supabase/functions/_shared/activation/status.ts. Kept dependency-free so it
// is unit-testable and so the UI copy can never drift from the server rule.
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

export interface ActivationRow {
  id: string;
  firm: string;
  /** The plan the customer bought at the prop firm. */
  plan_name: string;
  /** Server-derived Braxel package. */
  braxel_plan_key?: string | null;
  braxel_plan_name?: string | null;
  payment_id?: string | null;
  payment_status?: string | null;
  account_login: string;
  purchase_email: string;
  receipt_path: string | null;
  status: ActivationStatus;
  operator_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  connected_at?: string | null;
  suspended_at?: string | null;
  suspended_reason?: string | null;
  disconnected_at?: string | null;
  disconnected_reason?: string | null;
  created_at: string;
}

export function isActivationStatus(value: unknown): value is ActivationStatus {
  return typeof value === "string" &&
    (ACTIVATION_STATUSES as readonly string[]).includes(value);
}

/** Statuses awaiting a decision (a duplicate submit is refused server-side). */
export function isOpenStatus(status: ActivationStatus): boolean {
  return status === "pending" || status === "in_review";
}

/**
 * True when a new request must be refused: pending, in review, approved or
 * suspended. Only a rejected or disconnected link may be replaced.
 */
export function blocksNewSubmission(status: ActivationStatus): boolean {
  return isOpenStatus(status) || status === "approved" || status === "suspended";
}

/** The signals plan is active only once an account link is approved. */
export function isApproved(status: ActivationStatus | null | undefined): boolean {
  return status === "approved";
}

export function isSuspended(status: ActivationStatus | null | undefined): boolean {
  return status === "suspended";
}

export function isDisconnected(status: ActivationStatus | null | undefined): boolean {
  return status === "disconnected";
}

/** A tone bucket for the status badge (maps to theme classes in the UI). */
export function statusTone(
  status: ActivationStatus,
): "pending" | "progress" | "needs_info" | "approved" | "rejected" | "suspended" | "disconnected" {
  switch (status) {
    case "pending":
      return "pending";
    case "in_review":
      return "progress";
    case "info_requested":
      return "needs_info";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "suspended":
      return "suspended";
    case "disconnected":
      return "disconnected";
  }
}

/** Pick the row the dashboard should surface: the most recent by created_at. */
export function latestActivation(rows: ActivationRow[]): ActivationRow | null {
  if (rows.length === 0) return null;
  return rows
    .slice()
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
}

/**
 * Whether the customer may open a new request: no prior request, or the latest
 * one is already decided (rejected/disconnected) and they are starting over.
 */
export function canSubmitNewActivation(latest: ActivationRow | null): boolean {
  return latest === null || !blocksNewSubmission(latest.status);
}

/** i18n key for a status label. */
export function statusLabelKey(status: ActivationStatus): string {
  return `onboarding.status.${status}`;
}

const ALLOWED: Record<ActivationStatus, ReadonlyArray<ActivationStatus>> = {
  pending: ["in_review", "approved", "rejected", "info_requested"],
  in_review: ["approved", "rejected", "info_requested"],
  info_requested: ["in_review", "approved", "rejected"],
  approved: ["suspended", "disconnected"],
  suspended: ["approved", "disconnected"],
  rejected: [],
  disconnected: [],
};

export function canReview(from: ActivationStatus, to: ActivationStatus): boolean {
  return ALLOWED[from].includes(to);
}
