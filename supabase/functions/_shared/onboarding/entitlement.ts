// ============================================================================
// Payment entitlement resolver.
//
// The browser never decides whether a customer has paid. The server derives
// entitlement from the canonical payment rows:
//
//   pending_payments.status_enum (preferred) / status (legacy)
//
// The most recent payment with a decided status governs. A later refund or
// cancellation therefore overrides an earlier confirmation, and a later
// confirmation overrides an earlier refund. While only non-decided rows exist
// the entitlement is `pending`; with no rows at all it is `none`.
//
// A `services` row with activated = true is accepted as a fallback for legacy
// customers whose payment rows predate the canonical table.
//
// Pure and dependency-free so every rule is unit-tested directly.
// ============================================================================

export type EntitlementState =
  | "none"
  | "pending"
  | "active"
  | "failed"
  | "rejected"
  | "refunded"
  | "canceled"
  | "disputed";

export interface PaymentLike {
  id?: string | null;
  plan_id?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  status?: string | null;
  status_enum?: string | null;
  created_at?: string | null;
}

export interface ServiceLike {
  plan_id?: string | null;
  activated?: boolean | null;
  status?: string | null;
}

export interface Entitlement {
  state: EntitlementState;
  /** True only for `active`. This is the gate for every onboarding mutation. */
  active: boolean;
  /** The Braxel plan the customer is entitled to, or null when unknown. */
  planId: string | null;
  /** The governing payment id, when one exists. */
  paymentId: string | null;
  amountCents: number;
  currency: string;
}

const CONFIRMED = new Set(["confirmed", "payment_confirmed"]);
const DECIDED = new Set([
  "confirmed",
  "payment_confirmed",
  "refunded",
  "canceled",
  "disputed",
  "failed",
  "rejected",
]);

function normalizedStatus(p: PaymentLike): string {
  const raw = (p.status_enum ?? p.status ?? "").toString().trim().toLowerCase();
  return raw;
}

function decidedState(status: string): EntitlementState | null {
  if (CONFIRMED.has(status)) return "active";
  if (status === "refunded") return "refunded";
  if (status === "canceled") return "canceled";
  if (status === "disputed") return "disputed";
  if (status === "failed") return "failed";
  if (status === "rejected") return "rejected";
  return null;
}

function timeOf(p: PaymentLike, index: number): number {
  const parsed = p.created_at ? Date.parse(p.created_at) : NaN;
  return Number.isNaN(parsed) ? index : parsed;
}

function planOf(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Resolve the customer's entitlement from their own rows. `payments` may be in
 * any order; the most recent decided row wins.
 */
export function resolveEntitlement(
  payments: PaymentLike[],
  services: ServiceLike[] = [],
): Entitlement {
  const ordered = payments
    .map((p, i) => ({ p, i, t: timeOf(p, i) }))
    .sort((a, b) => b.t - a.t);

  for (const { p } of ordered) {
    const status = normalizedStatus(p);
    const state = decidedState(status);
    if (!state) continue;
    return {
      state,
      active: state === "active",
      planId: planOf(p.plan_id),
      paymentId: planOf(p.id),
      amountCents: Number.isFinite(Number(p.amount_cents)) ? Number(p.amount_cents) : 0,
      currency: (p.currency ?? "USD").toString().toUpperCase() || "USD",
    };
  }

  const activeService = services.find(
    (s) => s.activated === true || (s.status ?? "").toLowerCase() === "active",
  );
  if (activeService) {
    return {
      state: "active",
      active: true,
      planId: planOf(activeService.plan_id),
      paymentId: null,
      amountCents: 0,
      currency: "USD",
    };
  }

  return {
    state: payments.length > 0 ? "pending" : "none",
    active: false,
    planId: null,
    paymentId: null,
    amountCents: 0,
    currency: "USD",
  };
}

/** The single predicate every onboarding mutation uses. */
export function isPaidEntitlement(entitlement: Entitlement): boolean {
  return entitlement.active === true && entitlement.state === "active";
}

/** True when a decided payment exists but it is not active. */
export function isInactivePaymentState(state: EntitlementState): boolean {
  return state === "refunded" ||
    state === "canceled" ||
    state === "disputed" ||
    state === "failed" ||
    state === "rejected";
}
