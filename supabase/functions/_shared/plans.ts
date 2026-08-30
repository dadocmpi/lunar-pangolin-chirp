// Shared, server-side-only payment configuration.
// IMPORTANT: This file is the single source of truth. The browser must never be
// trusted to declare a plan, price, currency, network, or status.

export type PlanId = "starter" | "pro" | "advanced" | "elite";

export interface PlanConfig {
  id: PlanId;
  name: string;
  /** Price is in USD cents to avoid float drift. */
  priceCents: number;
  /** Bookkeeping label only. */
  managedCapitalUsd: number;
  /** Human-readable description used in audit / receipts. */
  description: string;
  /** Plans are never "active" until confirmed; this field documents the
   *  intended outcome but has no execution effect. */
  isComingSoon: true;
}

/**
 * CANONICAL PRICE TABLE.
 * Values are duplicated from src/pages/Pricing.tsx PRICES_USD, but the server
 * does not read that file. If they diverge, the server wins.
 */
export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "STARTER 5K",
    priceCents: 8700, // $87.00
    managedCapitalUsd: 5_000,
    description: "Starter 5K managed capital tier.",
    isComingSoon: true,
  },
  pro: {
    id: "pro",
    name: "PRO 10K",
    priceCents: 13100, // $131.00
    managedCapitalUsd: 10_000,
    description: "Pro 10K managed capital tier.",
    isComingSoon: true,
  },
  advanced: {
    id: "advanced",
    name: "ADVANCED 25K",
    priceCents: 46900, // $469.00
    managedCapitalUsd: 25_000,
    description: "Advanced 25K managed capital tier.",
    isComingSoon: true,
  },
  elite: {
    id: "elite",
    name: "ELITE 100K",
    priceCents: 92700, // $927.00
    managedCapitalUsd: 100_000,
    description: "Elite 100K managed capital tier.",
    isComingSoon: true,
  },
};

export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

export const SUPPORTED_CURRENCIES = ["USD"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CRYPTO_NETWORKS = [
  { id: "BTC", symbol: "BTC", minConfirmations: 1, addressEnv: "TEST_WALLET_BTC" },
  { id: "TRC20", symbol: "USDT", minConfirmations: 1, addressEnv: "TEST_WALLET_TRC20" },
  { id: "ETH", symbol: "ETH", minConfirmations: 12, addressEnv: "TEST_WALLET_ETH" },
  { id: "BNB", symbol: "BNB", minConfirmations: 15, addressEnv: "TEST_WALLET_BNB" },
  { id: "POLYGON", symbol: "MATIC", minConfirmations: 64, addressEnv: "TEST_WALLET_POLYGON" },
  { id: "SOL", symbol: "SOL", minConfirmations: 32, addressEnv: "TEST_WALLET_SOL" },
] as const;

export type CryptoNetworkId = (typeof CRYPTO_NETWORKS)[number]["id"];

/**
 * Test-only placeholder addresses. These are intentionally not real,
 * production-style addresses. The real addresses must be configured later
 * via Deno env, never in the browser bundle.
 */
export const TEST_PLACEHOLDER_WALLET = "tb1qtesttesttesttesttesttesttesttesttesttest";
export const TEST_PLACEHOLDER_BANK = "TEST-BANK-ROUTING-NOT-CONFIGURED";

export function getPlan(id: unknown): PlanConfig {
  if (typeof id !== "string") throw new Error("invalid_plan_id");
  if (!PLAN_IDS.includes(id as PlanId)) throw new Error("invalid_plan_id");
  return PLANS[id as PlanId];
}

export function getCryptoNetwork(id: unknown) {
  if (typeof id !== "string") throw new Error("invalid_network");
  const found = CRYPTO_NETWORKS.find((n) => n.id === id);
  if (!found) throw new Error("invalid_network");
  return found;
}

export function isSupportedCurrency(c: unknown): c is SupportedCurrency {
  return typeof c === "string" && (SUPPORTED_CURRENCIES as readonly string[]).includes(c);
}

// ---------------------------------------------------------------------------
// Status state machine
// ---------------------------------------------------------------------------

export const PAYMENT_STATUSES = [
  "created",
  "pending",
  "processing",
  "confirmed",
  "failed",
  "rejected",
  "refunded",
  "disputed",
  "canceled",
  "pending_manual",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Allowed forward transitions. `pending_manual` is the only status Wise can
 * reach, and it can only move to `confirmed`, `rejected`, or `canceled` via a
 * manual admin path. Cryptocurrency follows the same shape but is allowed to
 * transition `pending -> processing -> confirmed` by the auto-confirm flow.
 */
const ALLOWED: Record<PaymentStatus, ReadonlyArray<PaymentStatus>> = {
  created: ["pending", "failed", "canceled"],
  pending: ["processing", "pending_manual", "failed", "canceled", "rejected"],
  processing: ["confirmed", "failed", "rejected", "pending_manual"],
  pending_manual: ["confirmed", "rejected", "canceled"],
  confirmed: ["refunded", "disputed"],
  failed: ["pending"], // retry path
  rejected: [],
  refunded: [],
  disputed: ["refunded", "rejected"],
  canceled: [],
};

export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === to) return false;
  return ALLOWED[from].includes(to);
}

/** Terminal statuses cannot transition out. */
export const TERMINAL_STATUSES: PaymentStatus[] = [
  "confirmed",
  "rejected",
  "refunded",
  "canceled",
  "failed",
];