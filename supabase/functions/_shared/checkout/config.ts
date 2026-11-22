// ============================================================================
// Checkout configuration — what the configured providers can actually accept.
//
// The browser must never claim a payment method or asset that the backend
// cannot service. This module inspects the Edge Function secrets (presence
// only, never values) and reports which methods are usable, plus which crypto
// networks have a configured destination address.
//
// Pure: the env reader is injected, so the Deno tests can exercise every
// configuration combination without Deno.env.
// ============================================================================

import { CRYPTO_NETWORKS, SUPPORTED_CURRENCIES } from "../option_a/plans.ts";
import { resolveBankDetails, resolveCryptoAddress } from "../payment-destinations.ts";
import type {
  CheckoutConfig,
  CheckoutCryptoNetwork,
  CheckoutMethodAvailability,
} from "./logic.ts";

export type EnvReader = (name: string) => string | null;

export const STRIPE_PRICE_ENV_VARS = [
  "STRIPE_PRICE_STARTER_USD",
  "STRIPE_PRICE_PROFESSIONAL_USD",
  "STRIPE_PRICE_BUSINESS_USD",
  "STRIPE_PRICE_ENTERPRISE_USD",
] as const;

/** Real Deno env reader (values are only tested for presence). */
export function denoEnvReader(name: string): string | null {
  const value = Deno.env.get(name);
  return value && value.trim().length > 0 ? value.trim() : null;
}

function has(env: EnvReader, name: string): boolean {
  return Boolean(env(name));
}

/**
 * Card payments are available only when Stripe can actually create a session:
 * a secret key, both redirect URLs and every canonical USD Price ID.
 */
export function cardAvailability(env: EnvReader): CheckoutMethodAvailability {
  const ready = has(env, "STRIPE_SECRET_KEY") &&
    has(env, "STRIPE_SUCCESS_URL") &&
    has(env, "STRIPE_CANCEL_URL") &&
    STRIPE_PRICE_ENV_VARS.every((name) => has(env, name));
  return { available: ready, reason: ready ? null : "card_not_configured" };
}

/**
 * In test mode every network resolves to the safe placeholder wallet, so all
 * are selectable. In live mode only networks with a real destination secret are
 * offered; the rest are reported as unconfigured and never shown.
 */
export function cryptoNetworks(env: EnvReader, testMode: boolean): CheckoutCryptoNetwork[] {
  return CRYPTO_NETWORKS.map((network) => ({
    id: network.id,
    symbol: network.symbol,
    configured: testMode ? true : Boolean(resolveCryptoAddress(network.id, env)),
  }));
}

export function cryptoAvailability(
  env: EnvReader,
  testMode: boolean,
): CheckoutMethodAvailability & { networks: CheckoutCryptoNetwork[] } {
  const networks = cryptoNetworks(env, testMode);
  const available = networks.some((n) => n.configured);
  return { available, reason: available ? null : "crypto_not_configured", networks };
}

export function bankAvailability(env: EnvReader, testMode: boolean): CheckoutMethodAvailability {
  const available = testMode ? true : resolveBankDetails(env) !== null;
  return { available, reason: available ? null : "bank_not_configured" };
}

/**
 * The single checkout configuration the browser reads. Contains no secret and
 * no user data — only which methods/currencies are usable right now.
 */
export function checkoutConfigFromEnv(env: EnvReader, testMode: boolean): CheckoutConfig {
  return {
    testMode,
    currency: SUPPORTED_CURRENCIES[0],
    currencies: [...SUPPORTED_CURRENCIES],
    methods: {
      card: cardAvailability(env),
      crypto: cryptoAvailability(env, testMode),
      bank: bankAvailability(env, testMode),
    },
  };
}
