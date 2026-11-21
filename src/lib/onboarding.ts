// ============================================================================
// onboarding — pure view-model helpers for the customer onboarding flow.
//
// These do not decide entitlement (the server does). They only map the
// server-reported payment reason and account-link status onto the copy/step
// the dashboard should render, so the UI is testable without a network.
// ============================================================================

import type { ActivationStatus } from "./activationStatus";

export type OnboardingStep =
  | "disabled"
  | "payment_required"
  | "form"
  | "awaiting_review"
  | "info_needed"
  | "active"
  | "rejected"
  | "suspended"
  | "disconnected";

export type PaymentReason =
  | "confirmed"
  | "no_payment"
  | "payment_pending"
  | "payment_refunded"
  | "payment_canceled"
  | "payment_failed"
  | "payment_disputed"
  | "unknown_plan"
  | "test_payment_in_live_mode";

/** i18n key for the payment status line. */
export function paymentReasonLabelKey(reason: string | null | undefined): string {
  switch (reason) {
    case "confirmed":
      return "onboarding.paymentConfirmed";
    case "payment_refunded":
      return "onboarding.paymentRefunded";
    case "payment_canceled":
      return "onboarding.paymentCanceled";
    case "payment_failed":
      return "onboarding.paymentFailed";
    case "payment_disputed":
      return "onboarding.paymentDisputed";
    case "no_payment":
      return "onboarding.paymentNone";
    default:
      return "onboarding.paymentPending";
  }
}

/**
 * Resolve the onboarding step from server-reported facts.
 *
 * `entitled` and `status` are server values; the browser never supplies them.
 */
export function resolveOnboardingStep(input: {
  enabled: boolean;
  entitled: boolean;
  status: ActivationStatus | null;
}): OnboardingStep {
  if (!input.enabled) return "disabled";
  const status = input.status;
  if (status === "approved") return "active";
  if (status === "suspended") return "suspended";
  if (status === "rejected") return "rejected";
  if (status === "disconnected") return input.entitled ? "form" : "payment_required";
  if (status === "pending" || status === "in_review") return "awaiting_review";
  if (status === "info_requested") {
    return input.entitled ? "info_needed" : "payment_required";
  }
  return input.entitled ? "form" : "payment_required";
}
