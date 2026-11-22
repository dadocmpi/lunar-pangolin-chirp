// ============================================================================
// Payment lifecycle — pure client view-model.
//
// Mirrors the server resolver in
// supabase/functions/_shared/activation/lifecycle.ts. Kept dependency-free so
// it is unit-testable and so the UI copy can never drift from the server rule.
// The server remains the source of truth: this module only decides how the
// dashboard presents a value the server already returned.
// ============================================================================

export const PAYMENT_LIFECYCLE_STATES = [
  "created",
  "pending",
  "processing",
  "manual_review",
  "confirmed",
  "activation_pending",
  "active",
  "failed",
  "expired",
  "cancelled",
  "refunded",
  "disputed",
  "past_due",
  "suspended",
  "disconnected",
] as const;

export type PaymentLifecycleState = (typeof PAYMENT_LIFECYCLE_STATES)[number];

export const PAYMENT_NEXT_ACTIONS = [
  "complete_payment",
  "await_confirmation",
  "await_manual_review",
  "await_activation",
  "connect_provider",
  "update_payment_method",
  "restart_checkout",
  "contact_support",
  "none",
] as const;

export type PaymentNextAction = (typeof PAYMENT_NEXT_ACTIONS)[number];

export function lifecycleLabelKey(state: PaymentLifecycleState): string {
  return `paymentCard.statuses.${state}`;
}

export function nextActionLabelKey(action: PaymentNextAction): string {
  return `paymentCard.nextActions.${action}`;
}

export function methodLabelKey(
  method: string | null | undefined,
): string {
  const value = (method ?? "").toLowerCase();
  if (value === "stripe" || value === "card") return "paymentCard.methods.card";
  if (value === "crypto") return "paymentCard.methods.crypto";
  if (value === "wise" || value === "bank") return "paymentCard.methods.bank";
  return "paymentCard.methods.unknown";
}

export function lifecycleTone(
  state: PaymentLifecycleState,
): "neutral" | "progress" | "success" | "warning" | "error" {
  switch (state) {
    case "active":
      return "success";
    case "processing":
    case "activation_pending":
    case "confirmed":
    case "pending":
    case "created":
      return "progress";
    case "manual_review":
    case "past_due":
    case "suspended":
      return "warning";
    case "failed":
    case "expired":
    case "cancelled":
    case "refunded":
    case "disputed":
    case "disconnected":
      return "error";
    default:
      return "neutral";
  }
}

/** True while the server is still working on the payment/activation. */
export function isProcessingLifecycle(state: PaymentLifecycleState): boolean {
  return state === "processing" ||
    state === "activation_pending" ||
    state === "confirmed" ||
    state === "pending";
}

/** The provider connection step is only offered once the plan is active. */
export function canConnectProvider(state: PaymentLifecycleState): boolean {
  return state === "active";
}

/** Whole seconds remaining until an ISO expiry, or null when not applicable. */
export function remainingSeconds(
  expiresAt: string | null | undefined,
  nowMs: number = Date.now(),
): number | null {
  if (!expiresAt) return null;
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return null;
  return Math.max(0, Math.floor((target - nowMs) / 1000));
}

/** Format a remaining duration as HH:MM:SS (or MM:SS under an hour). */
export function formatCountdown(totalSeconds: number | null): string {
  if (totalSeconds === null || totalSeconds < 0) return "—";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Display a minor-unit amount in its currency (presentation only). */
export function formatPaymentAmount(
  cents: number | null | undefined,
  currency: string | null | undefined,
): string {
  const value = typeof cents === "number" && Number.isFinite(cents) ? cents : 0;
  const code = (currency ?? "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  } catch {
    return `${code} ${(value / 100).toFixed(2)}`;
  }
}
