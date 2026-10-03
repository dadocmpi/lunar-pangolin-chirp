// Canonical plan amounts for the front-end, mirroring the server source of
// truth in supabase/functions/_shared/plans.ts. The server always wins for
// what is actually charged; these values are display-only.
//
// Amounts are USD. The monthly fee may be displayed in the visitor's local
// currency on the pricing page, but the amount due at checkout is always USD
// so it matches what the payment provider charges.

export interface PlanPricing {
  /** Canonical monthly service fee in USD. */
  monthlyUsd: number;
  /** Managed capital in USD (futures). */
  managedCapitalUsd: number;
}

export const PLAN_PRICING: Record<string, PlanPricing> = {
  starter: { monthlyUsd: 200, managedCapitalUsd: 25000 },
  professional: { monthlyUsd: 350, managedCapitalUsd: 50000 },
  business: { monthlyUsd: 600, managedCapitalUsd: 100000 },
  enterprise: { monthlyUsd: 820, managedCapitalUsd: 150000 },
};

export type PlanId = keyof typeof PLAN_PRICING;
export const PLAN_IDS = Object.keys(PLAN_PRICING) as PlanId[];

/** Formats an amount as a fixed USD string, e.g. 200 -> "$200.00". */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Resolves plan pricing by key (case-insensitive), falling back to Starter. */
export function getPlanPricing(
  planKey: string | null | undefined,
): PlanPricing {
  const key = (planKey ?? "").toLowerCase();
  return PLAN_PRICING[key] ?? PLAN_PRICING.starter;
}

/** True when `planKey` is one of the canonical plan keys. */
export function isKnownPlanKey(planKey: string | null | undefined): boolean {
  return typeof planKey === "string" && planKey in PLAN_PRICING;
}
