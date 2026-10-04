// ============================================================================
// Payments-flag unit tests (no network, no DB).
//
// Run: deno run -A supabase/functions/_test/run-payments-flag-tests.ts
//
// Proves the single source of truth for the server-side gate:
//   isPaymentsEnabled() is true iff PAYMENTS_ENABLED === "true"
//   OR TEST_PAYMENT_MODE === "true".
// ============================================================================

import {
  isLivePaymentMode,
  isPaymentsEnabled,
  isTestPaymentMode,
  paymentsDisabledBody,
  paymentsMode,
} from "../_shared/payments-flag.ts";

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

function setEnv(vars: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) Deno.env.delete(k);
    else Deno.env.set(k, v);
  }
}

const KEYS = ["PAYMENTS_ENABLED", "TEST_PAYMENT_MODE"];

console.log("\n[1] Both flags off -> disabled (fail closed)");
setEnv({ PAYMENTS_ENABLED: undefined, TEST_PAYMENT_MODE: undefined });
ok(isPaymentsEnabled() === false, "isPaymentsEnabled() is false");
ok(isTestPaymentMode() === false, "isTestPaymentMode() is false");
ok(isLivePaymentMode() === false, "isLivePaymentMode() is false");
ok(paymentsMode() === "disabled", "paymentsMode() is 'disabled'");
ok(
  paymentsDisabledBody().error === "payments_disabled",
  "disabled body carries error=payments_disabled",
);

console.log("\n[2] TEST mode only");
setEnv({ PAYMENTS_ENABLED: undefined, TEST_PAYMENT_MODE: "true" });
ok(isPaymentsEnabled() === true, "isPaymentsEnabled() is true");
ok(isTestPaymentMode() === true, "isTestPaymentMode() is true");
ok(isLivePaymentMode() === false, "isLivePaymentMode() is false");
ok(paymentsMode() === "test", "paymentsMode() is 'test'");

console.log("\n[3] LIVE mode only");
setEnv({ PAYMENTS_ENABLED: "true", TEST_PAYMENT_MODE: undefined });
ok(isPaymentsEnabled() === true, "isPaymentsEnabled() is true");
ok(isTestPaymentMode() === false, "isTestPaymentMode() is false");
ok(isLivePaymentMode() === true, "isLivePaymentMode() is true");
ok(paymentsMode() === "production", "paymentsMode() is 'production'");

console.log("\n[4] Both flags on -> production wins the label");
setEnv({ PAYMENTS_ENABLED: "true", TEST_PAYMENT_MODE: "true" });
ok(isPaymentsEnabled() === true, "isPaymentsEnabled() is true");
ok(paymentsMode() === "production", "paymentsMode() is 'production'");

console.log("\n[5] Non-'true' strings are treated as off (no truthy coercion)");
setEnv({ PAYMENTS_ENABLED: "1", TEST_PAYMENT_MODE: "yes" });
ok(isPaymentsEnabled() === false, "isPaymentsEnabled() is false");
setEnv({ PAYMENTS_ENABLED: "TRUE", TEST_PAYMENT_MODE: undefined });
ok(isPaymentsEnabled() === false, "uppercase 'TRUE' does not enable");

// Clean up.
setEnv({ PAYMENTS_ENABLED: undefined, TEST_PAYMENT_MODE: undefined });
for (const k of KEYS) Deno.env.delete(k);

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
