// ============================================================================
// Payment + activation lifecycle — pure helpers.
//
// Shared by the payment-status endpoint, the operator function and the Deno
// tests. No I/O, no Deno.env, no Supabase client, so it can be imported by the
// browser-facing view-model too.
// ============================================================================

import { PLAN_IDS, type PlanId } from "../plans.ts";
import type { TransactionalTemplateKey } from "../emailTemplates.ts";

export type PlanActivationStatus =
  | "activation_pending"
  | "active"
  | "suspended"
  | "disconnected";

export const PLAN_ACTIVATION_STATUSES: readonly PlanActivationStatus[] = [
  "activation_pending",
  "active",
  "suspended",
  "disconnected",
];

/**
 * Combined customer-visible lifecycle. The first thirteen values are the
 * product's canonical states; `suspended` and `disconnected` are activation
 * states that the card also needs to surface honestly.
 */
export type LifecycleState =
  | "created"
  | "pending"
  | "processing"
  | "manual_review"
  | "confirmed"
  | "activation_pending"
  | "active"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded"
  | "disputed"
  | "past_due"
  | "suspended"
  | "disconnected";

export const LIFECYCLE_STATES: readonly LifecycleState[] = [
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
];

export type NextActionKey =
  | "complete_payment"
  | "await_confirmation"
  | "await_manual_review"
  | "await_activation"
  | "connect_provider"
  | "update_payment_method"
  | "restart_checkout"
  | "contact_support"
  | "none";

export function isKnownPlanKey(value: unknown): value is PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);
}

/** Stable, non-secret public account reference derived from the payment id. */
export function generateAccountId(paymentId: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < paymentId.length; i++) {
    hash ^= paymentId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `BRX-${hash.toString(16).toUpperCase().padStart(8, "0")}`;
}

export function activationEmailIdempotencyKey(paymentId: string): string {
  return `braxel-activation-${paymentId}`;
}

export function paymentEmailIdempotencyKey(
  template: TransactionalTemplateKey,
  paymentId: string,
): string {
  return `braxel-${template}-${paymentId}`;
}

/** Format minor units for display, e.g. "USD 350.00". */
export function formatAmount(
  cents: number | null | undefined,
  currency: string | null | undefined,
): string {
  const value = typeof cents === "number" && Number.isFinite(cents) ? cents : 0;
  const code = (currency ?? "USD").toUpperCase();
  return `${code} ${(value / 100).toFixed(2)}`;
}

/** Resolve the dashboard base URL from the environment, http(s) only. */
export function resolveAppUrl(raw: string | undefined | null): string {
  const fallback = "https://braxelmarkets.vercel.app";
  const value = (raw ?? "").trim() || fallback;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return fallback;
    return value.replace(/\/+$/, "");
  } catch {
    return fallback;
  }
}

/**
 * Combine the canonical payment status with the activation status.
 * A terminal payment outcome (refund/dispute/failure) always wins so the
 * customer never sees "active" for a refunded or disputed payment.
 */
export function deriveLifecycle(
  paymentStatus: string | null | undefined,
  activationStatus: PlanActivationStatus | null | undefined,
): LifecycleState {
  const p = (paymentStatus ?? "").trim().toLowerCase();

  if (p === "refunded") return "refunded";
  if (p === "disputed") return "disputed";
  if (p === "failed" || p === "rejected") return "failed";
  if (p === "canceled" || p === "cancelled") return "cancelled";
  if (p === "incomplete_expired") return "expired";
  if (p === "past_due") return "past_due";

  if (activationStatus === "active") return "active";
  if (activationStatus === "suspended") return "suspended";
  if (activationStatus === "disconnected") return "disconnected";
  if (activationStatus === "activation_pending") return "activation_pending";

  switch (p) {
    case "confirmed":
    case "payment_confirmed":
      return "confirmed";
    case "pending_manual":
      return "manual_review";
    case "processing":
      return "processing";
    case "created":
      return "created";
    case "incomplete":
    case "trialing":
    case "paused":
    case "pending":
    default:
      return "pending";
  }
}

export function nextActionKey(state: LifecycleState): NextActionKey {
  switch (state) {
    case "created":
    case "pending":
      return "complete_payment";
    case "processing":
      return "await_confirmation";
    case "manual_review":
      return "await_manual_review";
    case "confirmed":
    case "activation_pending":
      return "await_activation";
    case "active":
      return "connect_provider";
    case "failed":
    case "past_due":
      return "update_payment_method";
    case "expired":
    case "cancelled":
      return "restart_checkout";
    case "refunded":
    case "disputed":
    case "suspended":
    case "disconnected":
      return "contact_support";
    default:
      return "none";
  }
}

/** True while the server is still working on the payment/activation. */
export function isProcessingLifecycle(state: LifecycleState): boolean {
  return state === "processing" ||
    state === "activation_pending" ||
    state === "confirmed" ||
    state === "pending";
}

export function lifecycleTone(
  state: LifecycleState,
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

export const CONFIRMED_PAYMENT_STATUS = "confirmed";

/** Only a canonical confirmed status may start activation. */
export function isConfirmablePaymentStatus(status: string | null | undefined): boolean {
  const value = (status ?? "").trim().toLowerCase();
  return value === "confirmed" || value === "payment_confirmed";
}

/** Map any raw DB status onto the ten canonical payment-status values. */
export function canonicalPaymentStatus(raw: string | null | undefined): string {
  const value = (raw ?? "").trim().toLowerCase();
  const allowed = new Set([
    "created",
    "pending",
    "processing",
    "confirmed",
    "failed",
    "rejected",
    "refunded",
    "disputed",
    "canceled",
    "past_due",
    "pending_manual",
  ]);
  if (value === "payment_confirmed") return "confirmed";
  if (allowed.has(value)) return value;
  return "pending";
}
