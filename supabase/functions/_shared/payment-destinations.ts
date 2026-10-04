// ============================================================================
// Payment destinations (Wise bank details, crypto deposit addresses).
//
// TEST mode  : returns the literal placeholders from plans.ts. No real money
//              can be sent to them.
// LIVE mode  : resolves the real destination from Edge Function secrets. When a
//              destination is not configured the resolver returns null and the
//              calling function fails closed (HTTP 503) — it never falls back to
//              the test placeholder while live, because that would collect real
//              funds into an account nobody controls.
//
// Secrets are server-only. They are never returned to the browser except as the
// single destination the payer must send funds to.
// ============================================================================

import {
  CRYPTO_NETWORKS,
  TEST_PLACEHOLDER_BANK,
  TEST_PLACEHOLDER_WALLET,
} from "./option_a/plans.ts";

export interface BankDetails {
  holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  swift: string;
  reference: string;
}

const TRANSFER_REFERENCE =
  "Include your user email in the transfer reference";

function env(name: string): string | null {
  const value = Deno.env.get(name);
  return value && value.trim().length > 0 ? value.trim() : null;
}

/**
 * Real Wise bank details from secrets, or null when under-configured.
 * Requires at least a holder, a bank name, and an account number or IBAN.
 */
export function resolveBankDetails(): BankDetails | null {
  const holder = env("WISE_HOLDER_NAME");
  const bankName = env("WISE_BANK_NAME");
  const account = env("WISE_ACCOUNT_NUMBER");
  const iban = env("WISE_IBAN");
  if (!holder || !bankName || (!account && !iban)) return null;
  return {
    holder_name: holder,
    bank_name: bankName,
    account_number: account ?? iban ?? "",
    routing_number: env("WISE_ROUTING_NUMBER") ?? "",
    swift: env("WISE_SWIFT") ?? "",
    reference: TRANSFER_REFERENCE,
  };
}

/** The real deposit address for a network, or null when unset. */
export function resolveCryptoAddress(networkId: string): string | null {
  const network = CRYPTO_NETWORKS.find((n) => n.id === networkId);
  if (!network) return null;
  return env(network.addressEnv);
}

export function testBankDetails(): BankDetails {
  return {
    holder_name: "TEST HOLDER — DO NOT TRANSFER REAL FUNDS",
    bank_name: TEST_PLACEHOLDER_BANK,
    account_number: "TEST-ACCOUNT-0000",
    routing_number: "TEST-ROUTING-0000",
    swift: "TESTSWIFTXX",
    reference: TRANSFER_REFERENCE,
  };
}

export function testCryptoAddress(): string {
  return TEST_PLACEHOLDER_WALLET;
}
