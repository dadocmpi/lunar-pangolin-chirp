// ============================================================================
// Account-activation configuration.
//
// The customer buys an evaluation/funded account directly from a prop firm
// through OUR affiliate link, then asks Braxel to activate the signals plan.
// Braxel never operates the customer's account and never stores broker
// credentials.
//
// Everything configurable lives here, sourced from Edge Function secrets —
// never hard-coded, never shipped in the browser bundle:
//
//   AFFILIATE_TRADEIFY_URL   affiliate link for Tradeify. Unset => the firm is
//                            NOT offered anywhere (no card, no select option).
//   AFFILIATE_LUCID_URL      affiliate link for Lucid. Same rule.
//   SIGNALS_PLAN_NAME        display name of the monthly signals plan.
//   SIGNALS_PLAN_PRICE_CENTS monthly fee in minor units (USD cents).
//   SIGNALS_PLAN_CURRENCY    ISO currency, default USD.
//
// Pure and dependency-free so it can be unit-tested without Deno.env.
// ============================================================================

export interface ActivationFirm {
  /** Stable machine id used in the DB and the API. */
  id: string;
  /** Brand name (a proper noun, identical in every locale). */
  name: string;
  /** Affiliate URL. Never empty: a firm without one is dropped. */
  affiliateUrl: string;
}

export interface ActivationPlanConfig {
  name: string;
  /** Minor units (USD cents). 0 when unconfigured. */
  priceCents: number;
  currency: string;
}

export interface ActivationConfig {
  /** False when ACTIVATION_FLOW_ENABLED is exactly "false". */
  enabled: boolean;
  /** Only firms with a configured affiliate URL, in a stable order. */
  firms: ActivationFirm[];
  plan: ActivationPlanConfig;
}

export interface ActivationEnv {
  ACTIVATION_FLOW_ENABLED?: string;
  AFFILIATE_TRADEIFY_URL?: string;
  AFFILIATE_LUCID_URL?: string;
  SIGNALS_PLAN_NAME?: string;
  SIGNALS_PLAN_PRICE_CENTS?: string;
  SIGNALS_PLAN_CURRENCY?: string;
}

/** Only an http(s) URL is accepted; anything else (or empty) drops the firm. */
export function sanitizeAffiliateUrl(raw: string | undefined | null): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  return value;
}

/** Parse a positive integer of minor units. Returns 0 when unusable. */
export function parsePriceCents(raw: string | undefined | null): number {
  const value = Number.parseInt((raw ?? "").trim(), 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function resolveActivationConfig(env: ActivationEnv): ActivationConfig {
  const firms: ActivationFirm[] = [];
  const tradeify = sanitizeAffiliateUrl(env.AFFILIATE_TRADEIFY_URL);
  if (tradeify) firms.push({ id: "tradeify", name: "Tradeify", affiliateUrl: tradeify });
  const lucid = sanitizeAffiliateUrl(env.AFFILIATE_LUCID_URL);
  if (lucid) firms.push({ id: "lucid", name: "Lucid", affiliateUrl: lucid });

  const currency = (env.SIGNALS_PLAN_CURRENCY ?? "USD").trim().toUpperCase() || "USD";

  return {
    enabled: env.ACTIVATION_FLOW_ENABLED !== "false",
    firms,
    plan: {
      name: (env.SIGNALS_PLAN_NAME ?? "").trim() || "Signals Plan",
      priceCents: parsePriceCents(env.SIGNALS_PLAN_PRICE_CENTS),
      currency,
    },
  };
}

/** The firm ids the server will accept. A request for anything else is rejected. */
export function configuredFirmIds(config: ActivationConfig): string[] {
  return config.firms.map((f) => f.id);
}

export function isConfiguredFirm(config: ActivationConfig, firmId: unknown): boolean {
  return typeof firmId === "string" && config.firms.some((f) => f.id === firmId);
}

/** Read the config from the Edge Function environment. */
export function activationConfigFromEnv(): ActivationConfig {
  return resolveActivationConfig({
    ACTIVATION_FLOW_ENABLED: Deno.env.get("ACTIVATION_FLOW_ENABLED") ?? undefined,
    AFFILIATE_TRADEIFY_URL: Deno.env.get("AFFILIATE_TRADEIFY_URL") ?? undefined,
    AFFILIATE_LUCID_URL: Deno.env.get("AFFILIATE_LUCID_URL") ?? undefined,
    SIGNALS_PLAN_NAME: Deno.env.get("SIGNALS_PLAN_NAME") ?? undefined,
    SIGNALS_PLAN_PRICE_CENTS: Deno.env.get("SIGNALS_PLAN_PRICE_CENTS") ?? undefined,
    SIGNALS_PLAN_CURRENCY: Deno.env.get("SIGNALS_PLAN_CURRENCY") ?? undefined,
  });
}
