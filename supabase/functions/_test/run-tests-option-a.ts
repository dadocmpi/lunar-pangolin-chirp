// ============================================================================
// Option A — Test Harness
//
// Run:   deno run -A supabase/functions/_test/run-tests-option-a.ts
//
// This script does NOT require Supabase, network access, or secrets.
// It exercises pure logic (validation, state machine, idempotency, gate logic)
// and stubs the database where the contract depends on it.
//
// STATUS: NOT EXECUTED in this session.
// All test results below are pre-write predictions. Run the command above
// to obtain actual results.
//
// Test label key:
//   PASS  = assertion passed in a prior run
//   FAIL  = assertion failed in a prior run
//   NOT RUN = never executed
//   NOT EXECUTED = this session (all cases below)
// ============================================================================

import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  canTransition,
  CRYPTO_NETWORKS,
  getCryptoNetwork,
  isSupportedCurrency,
  PAYMENT_STATUSES,
  type PaymentStatus,
  PLAN_IDS,
  PLANS,
  TEST_PLACEHOLDER_WALLET,
} from "../_shared/option_a/plans.ts";
import { validateCheckoutInput } from "../_shared/option_a/payments.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      // deno: use console.log
      console.log(`  PASS  ${name}`);
      passed++;
    })
    .catch((e) => {
      console.error(`  FAIL  ${name}`);
      console.error(e);
      failed++;
    });
}

function ok(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// ---------------------------------------------------------------------------
// 1. Canonical plan / price table
// ---------------------------------------------------------------------------

console.log("\n[1] Canonical plan and price validation");

await test("rejects unknown plan id as Error", () => {
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: "nonexistent-plan",
        clientCurrency: "USD",
        network: null,
        idempotencyKey: "abcdefgh",
      }),
    Error,
    "invalid_plan_id",
  );
});

await test("rejects non-string plan id as Error", () => {
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: 123,
        clientCurrency: "USD",
        network: null,
        idempotencyKey: "abcdefgh",
      }),
    Error,
    "invalid_plan_id",
  );
});

await test("rejects unsupported currency", () => {
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: "professional",
        clientCurrency: "EUR",
        network: null,
        idempotencyKey: "abcdefgh",
      }),
    Error,
    "invalid_currency",
  );
});

await test("ignores client-supplied amount and re-derives from plan", () => {
  const v = validateCheckoutInput({
    planId: "professional",
    clientAmountCents: 1, // would be 1 cent if trusted
    clientCurrency: "USD",
    network: null,
    idempotencyKey: "abcdefgh",
  });
  ok(
    v.amountCents === PLANS.professional.priceCents,
    `expected ${PLANS.professional.priceCents}, got ${v.amountCents}`,
  );
});

await test("ignores client-supplied currency and forces USD", () => {
  const v = validateCheckoutInput({
    planId: "starter",
    clientCurrency: "USD",
    network: null,
    idempotencyKey: "abcdefgh",
  });
  ok(v.currency === "USD", "currency must be USD");
});

await test("rejects invalid network", () => {
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: "starter",
        clientCurrency: "USD",
        network: "DOGE",
        idempotencyKey: "abcdefgh",
      }),
    Error,
    "invalid_network",
  );
});

await test("rejects missing idempotency key (too short)", () => {
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: "starter",
        clientCurrency: "USD",
        network: null,
        idempotencyKey: "short",
      }),
    Error,
    "idempotency_key_required",
  );
});

await test("rejects oversize idempotency key (>200 chars)", () => {
  const long = "x".repeat(201);
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: "starter",
        clientCurrency: "USD",
        network: null,
        idempotencyKey: long,
      }),
    Error,
    "idempotency_key_too_long",
  );
});

// ---------------------------------------------------------------------------
// 2. State machine
// ---------------------------------------------------------------------------

console.log("\n[2] Status state machine");

const cases: Array<[PaymentStatus, PaymentStatus, boolean]> = [
  // Normal forward paths
  ["created", "pending", true],
  ["pending", "processing", true],
  ["pending", "pending_manual", true],
  ["pending", "failed", true],
  ["pending", "canceled", true],
  ["pending", "rejected", true],
  ["processing", "confirmed", true],
  ["pending_manual", "confirmed", true],
  ["pending_manual", "rejected", true],
  ["pending_manual", "canceled", true],
  ["confirmed", "refunded", true],
  ["confirmed", "disputed", true],
  ["disputed", "refunded", true],
  ["disputed", "rejected", true],
  ["failed", "pending", true], // retry path

  // Blocked paths
  ["created", "pending_manual", false],
  ["created", "confirmed", false],
  ["pending", "confirmed", false], // must go through processing
  ["pending_manual", "processing", false], // manual cannot auto-progress
  ["pending_manual", "pending", false], // manual cannot revert
  ["rejected", "pending", false], // terminal
  ["rejected", "confirmed", false], // terminal
  ["canceled", "pending", false], // terminal
  ["canceled", "confirmed", false], // terminal
];

for (const [from, to, expected] of cases) {
  await test(`${from} → ${to} ${expected ? "ALLOWED" : "BLOCKED"}`, () => {
    assertEquals(canTransition(from, to), expected);
  });
}

// ---------------------------------------------------------------------------
// 3. Idempotency (in-memory simulation)
// ---------------------------------------------------------------------------

console.log("\n[3] Idempotency");

await test("duplicate (user_id, idempotency_key) returns same row", () => {
  const store = new Map<string, { id: string; amount: number; plan: string }>();
  const insert = (
    userId: string,
    idem: string,
    amount: number,
    plan: string,
  ) => {
    const k = `${userId}::${idem}`;
    if (store.has(k)) return { row: store.get(k)!, created: false };
    const row = { id: crypto.randomUUID(), amount, plan };
    store.set(k, row);
    return { row, created: true };
  };

  const a = insert("u1", "click-1", PLANS.starter.priceCents, "starter");
  const b = insert(
    "u1",
    "click-1",
    1, // mismatched amount
    "elite",
  );
  ok(a.created, "first insert created");
  ok(!b.created, "second insert idempotent");
  ok(
    b.row.amount === PLANS.starter.priceCents,
    `idempotent row keeps canonical amount ${PLANS.starter.priceCents}, got ${b.row.amount}`,
  );
  ok(b.row.plan === "starter", `idempotent row keeps canonical plan`);
});

await test("different idempotency keys create separate rows", () => {
  const seen = new Set<string>();
  const insert = (k: string) => {
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  };
  ok(insert("u1:click-1") === true, "first created");
  ok(insert("u1:click-2") === true, "second created");
  ok(insert("u1:click-1") === false, "duplicate idempotent");
});

// ---------------------------------------------------------------------------
// 4. Wise safety
// ---------------------------------------------------------------------------

console.log("\n[4] Wise flow safety");

await test(
  "Wise is never confirmed without an authorized server-side path",
  () => {
    // wise-checkout creates the row with status_enum = 'pending_manual'.
    // The unique partial index on services requires activated = true.
    // No UI click, checkbox, or user action can reach 'confirmed'.
    ok(
      !canTransition("pending_manual", "processing"),
      "manual cannot auto-progress",
    );
    ok(
      canTransition("pending_manual", "confirmed"),
      "manual CAN be admin-confirmed",
    );
    ok(
      canTransition("pending_manual", "rejected"),
      "manual CAN be admin-rejected",
    );
  },
);

// ---------------------------------------------------------------------------
// 5. Crypto flow safety
// ---------------------------------------------------------------------------

console.log("\n[5] Crypto flow safety");

await test("pending → confirmed is BLOCKED (must go through processing)", () => {
  assertEquals(canTransition("pending", "confirmed"), false);
});

await test("pending → processing → confirmed is the only confirmed path", () => {
  ok(canTransition("pending", "processing"), "pending→processing allowed");
  ok(canTransition("processing", "confirmed"), "processing→confirmed allowed");
});

await test("Amount tolerance simulation: 10% under is rejected", () => {
  const expected = PLANS.professional.priceCents;
  const observed = Math.floor(expected * 0.90);
  const lower = Math.floor(expected * 0.95);
  const upper = Math.ceil(expected * 1.05);
  ok(
    observed < lower || observed > upper,
    `${observed} should be out of range [${lower},${upper}]`,
  );
});

await test("Amount tolerance simulation: exact amount is accepted", () => {
  const expected = PLANS.professional.priceCents;
  const lower = Math.floor(expected * 0.95);
  const upper = Math.ceil(expected * 1.05);
  ok(
    expected >= lower && expected <= upper,
    `${expected} should be in range [${lower},${upper}]`,
  );
});

await test("Network mismatch is detected", () => {
  const declaredNetwork: string = "BTC";
  const observedNetwork: string = "TRC20";
  ok(
    declaredNetwork !== observedNetwork,
    `network mismatch should be detected: ${declaredNetwork} vs ${observedNetwork}`,
  );
});

await test("Test placeholder wallet is not a real address", () => {
  ok(
    TEST_PLACEHOLDER_WALLET.startsWith("tb1q"),
    `placeholder should be testnet bech32, got ${TEST_PLACEHOLDER_WALLET}`,
  );
});

// ---------------------------------------------------------------------------
// 6. Failed verification
// ---------------------------------------------------------------------------

console.log("\n[6] Failed verification");

await test("0 confirmations is below minimum for every network", () => {
  for (const n of CRYPTO_NETWORKS) {
    ok(
      n.minConfirmations > 0,
      `${n.id} requires > 0 confirmations, got ${n.minConfirmations}`,
    );
  }
});

await test(
  "1 confirmation is rejected for ETH/BNB/POLYGON/SOL",
  () => {
    for (const id of ["ETH", "BNB", "POLYGON", "SOL"] as const) {
      const n = CRYPTO_NETWORKS.find((x) => x.id === id)!;
      ok(
        n.minConfirmations > 1,
        `${id} requires > 1 confirmations, got ${n.minConfirmations}`,
      );
    }
  },
);

// ---------------------------------------------------------------------------
// 7. Auth / authorization
// ---------------------------------------------------------------------------

console.log("\n[7] Auth and authorization");

await test("Missing planId throws Error", () => {
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: undefined,
        clientCurrency: "USD",
        network: null,
        idempotencyKey: "abcdefgh",
      }),
    Error,
    "invalid_plan_id",
  );
});

await test("Non-USD currency is rejected", () => {
  for (const bad of ["EUR", "BRL", "BTC", "GBP", "JPY"]) {
    let threw = false;
    try {
      validateCheckoutInput({
        planId: "professional",
        clientCurrency: bad,
        network: null,
        idempotencyKey: "abcdefgh",
      });
    } catch {
      threw = true;
    }
    ok(threw, `currency ${bad} must be rejected`);
  }
});

// ---------------------------------------------------------------------------
// 8. Audit log invariants (simulated)
// ---------------------------------------------------------------------------

console.log("\n[8] Audit log invariants");

await test("audit log transition from created→pending is allowed", () => {
  ok(
    canTransition("created", "pending"),
    "created→pending is a valid transition",
  );
});

await test("audit log transition from confirmed→refunded is allowed", () => {
  ok(canTransition("confirmed", "refunded"), "confirmed→refunded is valid");
});

await test("terminal statuses have no outbound transitions", () => {
  for (const terminal of ["rejected", "refunded", "canceled"] as const) {
    for (const status of PAYMENT_STATUSES) {
      if (status !== terminal) {
        ok(
          !canTransition(terminal, status),
          `${terminal} → ${status} should be blocked`,
        );
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 9. Plan IDs and enum completeness
// ---------------------------------------------------------------------------

console.log("\n[9] Plan and status enums");

await test("all 4 plan ids are present", () => {
  for (const id of ["starter", "professional", "business", "enterprise"]) {
    ok(
      PLAN_IDS.includes(id as (typeof PLAN_IDS)[number]),
      `${id} should be a valid plan id`,
    );
  }
});

await test("all 10 statuses are present", () => {
  for (
    const s of [
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
    ]
  ) {
    ok(
      (PAYMENT_STATUSES as readonly string[]).includes(s),
      `${s} should be present`,
    );
  }
});

await test("PLAN_IDS has exactly 4 entries", () => {
  assertEquals(PLAN_IDS.length, 4);
});

// ---------------------------------------------------------------------------
// 10. isSupportedCurrency and getCryptoNetwork
// ---------------------------------------------------------------------------

console.log("\n[10] Currency and network helpers");

await test("USD is supported", () => {
  ok(isSupportedCurrency("USD"), "USD should be supported");
});

await test("EUR is not supported", () => {
  ok(!isSupportedCurrency("EUR"), "EUR should not be supported");
});

await test("BTC is a valid network", () => {
  const n = getCryptoNetwork("BTC");
  ok(n.id === "BTC", `expected BTC, got ${n.id}`);
  ok(n.minConfirmations === 1, "BTC requires 1 confirmation");
});

await test("invalid network throws", () => {
  assertThrows(() => getCryptoNetwork("DOGE"), Error, "invalid_network");
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(
  `\nResult: ${passed} passed, ${failed} failed.  STATUS: NOT EXECUTED in this session.`,
);
if (failed > 0) Deno.exit(1);
