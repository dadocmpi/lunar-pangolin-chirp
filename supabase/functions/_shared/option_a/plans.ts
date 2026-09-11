// ============================================================================
// Server-only plan and state-machine configuration.
// This file is the SINGLE SOURCE OF TRUTH for plan IDs, canonical prices,
// supported currencies, crypto networks, and the status transition table.
//
// IMPORTANT: This file runs on Deno (Edge Functions) only. It is NEVER
// bundled into the browser. The browser never declares a plan, price,
// currency, or network.
// ============================================================================

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export type PlanId = "starter" | "professional" | "business" | "enterprise";

export interface PlanConfig {
  id: PlanId;
  name: string;
  /** Price in USD cents to avoid float drift. */
  priceCents: number;
  managedCapitalUsd: number;
  description: string;
  /** Service tier reference (e.g., "25K") */
  tierReference: string;
  /** Billing interval */
  interval: "month";
}

/**
 * CANONICAL PRICE TABLE.
 * Values are the source of truth for all Edge Functions.
 * The browser never declares a plan or price.
 */
export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceCents: 200_00, // $200.00
    managedCapitalUsd: 25_000,
    description: "Starter service tier.",
    tierReference: "25K",
    interval: "month",
  },
  professional: {
    id: "professional",
    name: "Professional",
    priceCents: 350_00, // $350.00
    managedCapitalUsd: 50_000,
    description: "Professional service tier.",
    tierReference: "50K",
    interval: "month",
  },
  business: {
    id: "business",
    name: "Business",
    priceCents: 600_00, // $600.00
    managedCapitalUsd: 100_000,
    description: "Business service tier.",
    tierReference: "100K",
    interval: "month",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceCents: 820_00, // $820.00
    managedCapitalUsd: 150_000,
    description: "Enterprise service tier.",
    tierReference: "150K",
    interval: "month",
  },
};

export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

// ---------------------------------------------------------------------------
// Supported currencies
// ---------------------------------------------------------------------------

export const SUPPORTED_CURRENCIES = ["USD"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

// ---------------------------------------------------------------------------
// Crypto networks
// ---------------------------------------------------------------------------

export const CRYPTO_NETWORKS = [
  {
    id: "BTC",
    symbol: "BTC",
    minConfirmations: 1,
    addressEnv: "CRYPTO_DESTINATION_BTC",
  },
  {
    id: "TRC20",
    symbol: "USDT",
    minConfirmations: 1,
    addressEnv: "CRYPTO_DESTINATION_TRC20",
  },
  {
    id: "ETH",
    symbol: "ETH",
    minConfirmations: 12,
    addressEnv: "CRYPTO_DESTINATION_ETH",
  },
  {
    id: "BNB",
    symbol: "BNB",
    minConfirmations: 15,
    addressEnv: "CRYPTO_DESTINATION_BNB",
  },
  {
    id: "POLYGON",
    symbol: "MATIC",
    minConfirmations: 64,
    addressEnv: "CRYPTO_DESTINATION_POLYGON",
  },
  {
    id: "SOL",
    symbol: "SOL",
    minConfirmations: 32,
    addressEnv: "CRYPTO_DESTINATION_SOL",
  },
] as const;

export type CryptoNetworkId = (typeof CRYPTO_NETWORKS)[number]["id"];

/**
 * Test-only placeholder address. This is intentionally not a real wallet.
 * Production addresses must be set via Deno env, never in the browser bundle.
 */
export const TEST_PLACEHOLDER_WALLET =
  "tb1qtesttesttesttesttesttesttesttesttesttest";

/**
 * Test-only placeholder bank. This is intentionally not a real bank account.
 * Production bank details must be configured via Deno env, never in the browser bundle.
 */
export const TEST_PLACEHOLDER_BANK = "TEST-BANK-ROUTING-NOT-CONFIGURED";

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

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
  return typeof c === "string" &&
    (SUPPORTED_CURRENCIES as readonly string[]).includes(c);
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

const ALLOWED: Record<PaymentStatus, readonly PaymentStatus[]> = {
  created: ["pending", "failed", "canceled"],
  pending: ["processing", "pending_manual", "failed", "canceled", "rejected"],
  processing: ["confirmed", "failed", "rejected", "pending_manual"],
  pending_manual: ["confirmed", "rejected", "canceled"],
  confirmed: ["refunded", "disputed"],
  failed: ["pending"], // retry path
  rejected: [], // terminal
  refunded: [], // terminal
  disputed: ["refunded", "rejected"],
  canceled: [], // terminal
};

/**
 * Returns true if a transition is allowed.
 * `failed` is NOT terminal — it can retry to `pending`.
 */
export function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === to) return false;
  return ALLOWED[from]?.includes(to) ?? false;
}

export const TERMINAL_STATUSES: readonly PaymentStatus[] = [
  "confirmed",
  "rejected",
  "refunded",
  "canceled",
];
