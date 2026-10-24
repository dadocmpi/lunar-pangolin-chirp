// ============================================================================
// activationStatus — pure client-side helpers for the activation lifecycle.
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
] as const;

export type ActivationStatus = (typeof ACTIVATION_STATUSES)[number];

export interface ActivationRow {
  id: string;
  firm: string;
  plan_name: string;
  account_login: string;
  purchase_email: string;
  receipt_path: string | null;
  status: ActivationStatus;
  operator_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
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

/** The signals plan is active only once an activation is approved. */
export function isApproved(status: ActivationStatus | null | undefined): boolean {
  return status === "approved";
}

/** A tone bucket for the status badge (maps to theme classes in the UI). */
export function statusTone(
  status: ActivationStatus,
): "pending" | "progress" | "needs_info" | "approved" | "rejected" {
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
 * one is already decided (approved/rejected) and they are starting over.
 */
export function canSubmitNewActivation(latest: ActivationRow | null): boolean {
  return latest === null || !isOpenStatus(latest.status);
}
