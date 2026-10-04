// ============================================================================
// Payment destination resolver tests (no network, no DB).
//
// Run: deno run -A supabase/functions/_test/run-payment-destination-tests.ts
//
// Proves the LIVE-mode fail-closed rule: with no destination secrets the
// resolver returns null (so the checkout function refuses with 503) and never
// falls back to the test placeholder.
// ============================================================================

import {
  resolveBankDetails,
  resolveCryptoAddress,
  testBankDetails,
  testCryptoAddress,
} from "../_shared/payment-destinations.ts";
import {
  TEST_PLACEHOLDER_BANK,
  TEST_PLACEHOLDER_WALLET,
} from "../_shared/option_a/plans.ts";

let passed = 0;
let failed = 0;

function ok(condition: boolean, name: string) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}`);
  }
}

const WISE_KEYS = [
  "WISE_HOLDER_NAME",
  "WISE_BANK_NAME",
  "WISE_ACCOUNT_NUMBER",
  "WISE_IBAN",
  "WISE_ROUTING_NUMBER",
  "WISE_SWIFT",
];
const CRYPTO_KEYS = [
  "CRYPTO_DESTINATION_BTC",
  "CRYPTO_DESTINATION_TRC20",
  "CRYPTO_DESTINATION_ETH",
  "CRYPTO_DESTINATION_BNB",
  "CRYPTO_DESTINATION_POLYGON",
  "CRYPTO_DESTINATION_SOL",
];

function clearEnv() {
  for (const k of [...WISE_KEYS, ...CRYPTO_KEYS]) Deno.env.delete(k);
}

console.log("\n[1] Test placeholders are never real credentials");
clearEnv();
ok(testBankDetails().bank_name === TEST_PLACEHOLDER_BANK, "test bank is the placeholder");
ok(testCryptoAddress() === TEST_PLACEHOLDER_WALLET, "test wallet is the placeholder");

console.log("\n[2] LIVE with no secrets -> null (fail closed, no placeholder fallback)");
clearEnv();
ok(resolveBankDetails() === null, "no Wise secrets -> null");
ok(resolveCryptoAddress("BTC") === null, "no BTC secret -> null");

console.log("\n[3] Under-configured Wise still fails closed");
clearEnv();
Deno.env.set("WISE_HOLDER_NAME", "Braxel Markets Ltd");
ok(resolveBankDetails() === null, "holder only -> null");
Deno.env.set("WISE_BANK_NAME", "Wise");
ok(resolveBankDetails() === null, "holder + bank, no account -> null");

console.log("\n[4] Fully configured Wise resolves");
clearEnv();
Deno.env.set("WISE_HOLDER_NAME", "Braxel Markets Ltd");
Deno.env.set("WISE_BANK_NAME", "Wise");
Deno.env.set("WISE_ACCOUNT_NUMBER", "12345678");
Deno.env.set("WISE_SWIFT", "TRWIGB2T");
const bank = resolveBankDetails();
ok(bank !== null, "returns bank details");
ok(bank?.holder_name === "Braxel Markets Ltd", "holder is passed through");
ok(bank?.account_number === "12345678", "account number is passed through");
ok(bank?.swift === "TRWIGB2T", "swift is passed through");
ok(bank?.routing_number === "", "missing optional routing defaults to empty");

console.log("\n[5] IBAN satisfies the account requirement");
clearEnv();
Deno.env.set("WISE_HOLDER_NAME", "Braxel Markets Ltd");
Deno.env.set("WISE_BANK_NAME", "Wise");
Deno.env.set("WISE_IBAN", "GB00 XXXX 0000 0000");
ok(resolveBankDetails()?.account_number === "GB00 XXXX 0000 0000", "IBAN used as account");

console.log("\n[6] Crypto address resolves per network, unknown network -> null");
clearEnv();
Deno.env.set("CRYPTO_DESTINATION_BTC", "bc1qexample");
ok(resolveCryptoAddress("BTC") === "bc1qexample", "BTC address resolves");
ok(resolveCryptoAddress("TRC20") === null, "unset TRC20 -> null");
ok(resolveCryptoAddress("NOPE") === null, "unknown network -> null");

clearEnv();
console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
