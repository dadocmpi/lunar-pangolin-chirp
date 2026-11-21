// ============================================================================
// Payment entitlement for the onboarding / account-link flow.
//
// The browser NEVER declares whether the customer paid, which Braxel package
// they bought, or what the payment status is. activation-submit reads the
// customer's payment row with the service role, scoped to the JWT user, and
// this module turns that row into a single server-side decision.
//
// Pure and dependency-free so it can be unit-tested without Deno.env.
// ============================================================================

import { PLAN_IDS, type PlanId } from "../plans.ts";

export type EntitlementReason =
  | "confirmed"
  | "no_payment"
  | "payment_pending"
  | "payment_refunded"
  | "payment_canceled"
  | "payment_failed"
  | "payment_disputed"
  | "unknown_plan"
  | "test_payment_in_live_mode";

export interface PaymentRowLike {
  id?: string | null;
  plan_id?: string | null;
  plan_name?: string | null;
  status_enum?: string | null;
  status?: string | null;
  method?: string | null;
  created_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface PaymentEntitlement {
  /** True only for a confirmed, non-test payment on a known canonical plan. */
  entitled: boolean;
  reason: EntitlementReason;
  paymentId: string | null;
  /** Canonical Braxel plan key, copied from the payment row. */
  planKey: PlanId | null;
  /** Display name, copied from the payment row (never from the browser). */
  planName: string | null;
  /** Normalised payment status. */
  status: string | null;
  method: string | null;
  isTest: boolean;
}

const CANONICAL_STATUS: Record<string, EntitlementReason> = {
  confirmed: "confirmed",
  payment_confirmed: "confirmed",
  refunded: "payment_refunded",
  canceled: "payment_canceled",
  cancelled: "payment_canceled",
  failed: "payment_failed",
  rejected: "payment_failed",
  disputed: "payment_disputed",
};

/** Normalise the two status columns into the canonical lowercase value. */
export function normalizePaymentStatus(row: PaymentRowLike | null | undefined): string {
  const raw = row?.status_enum ?? row?.status ?? "";
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

export function isKnownPlanKey(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);
}

/**
 * Resolve the entitlement from the payment row.
 *
 * `testMode` mirrors the server-side TEST_PAYMENT_MODE flag. A payment marked
 * `metadata.is_test = true` only counts while test mode is on, so a test row
 * can never unlock a production account.
 */
export function resolveEntitlement(
  row: PaymentRowLike | null | undefined,
  options: { testMode?: boolean } = {},
): PaymentEntitlement {
  const testMode = options.testMode === true;
  if (!row) {
    return {
      entitled: false,
      reason: "no_payment",
      paymentId: null,
      planKey: null,
      planName: null,
      status: null,
      method: null,
      isTest: false,
    };
  }

  const status = normalizePaymentStatus(row);
  const isTest = row.metadata?.is_test === true;
  const planKey = isKnownPlanKey(row.plan_id) ? row.plan_id : null;
  const planName = typeof row.plan_name === "string" ? row.plan_name : null;
  const paymentId = typeof row.id === "string" ? row.id : null;
  const method = typeof row.method === "string" ? row.method : null;

  const base = {
    paymentId,
    planKey,
    planName,
    status: status || null,
    method,
    isTest,
  };

  if (isTest && !testMode) {
    return { ...base, entitled: false, reason: "test_payment_in_live_mode" };
  }

  const mapped = CANONICAL_STATUS[status];
  if (!mapped) {
    return { ...base, entitled: false, reason: "payment_pending" };
  }
  if (mapped !== "confirmed") {
    return { ...base, entitled: false, reason: mapped };
  }
  if (!planKey) {
    return { ...base, entitled: false, reason: "unknown_plan" };
  }
  return { ...base, entitled: true, reason: "confirmed" };
}

/**
 * The canonical error code returned when the customer is not entitled. The
 * caller must never reveal whether the missing row belongs to someone else.
 */
export const PAYMENT_NOT_CONFIRMED = "payment_not_confirmed";
