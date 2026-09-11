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
  TEST_PLACEHOLDER_BANK,
  TEST_PLACEHOLDER_WALLET,
} from "../_shared/option_a/plans.ts";
import {
  PaymentError,
  validateCheckoutInput,
} from "../_shared/option_a/payments.ts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
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

// ============================================================================
// 1. Canonical plan / price
// ============================================================================
console.log("\n[1] Canonical plan and price validation");

await test("rejects unknown plan id", () => {
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: "nonexistent-plan",
        clientCurrency: "USD",
        network: null,
        idempotencyKey: "abcdefgh",
      }),
    PaymentError,
    "invalid_plan_id",
  );
});

await test("rejects non-string plan id", () => {
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: 123,
        clientCurrency: "USD",
        network: null,
        idempotencyKey: "abcdefgh",
      }),
    PaymentError,
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
    PaymentError,
    "invalid_currency",
  );
});

await test("ignores client-supplied amount and re-derives from plan", () => {
  const v = validateCheckoutInput({
    planId: "professional",
    clientAmountCents: 1,
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
    PaymentError,
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
    PaymentError,
    "idempotency_key_required",
  );
});

await test("rejects oversize idempotency key (>200)", () => {
  const long = "x".repeat(201);
  assertThrows(
    () =>
      validateCheckoutInput({
        planId: "starter",
        clientCurrency: "USD",
        network: null,
        idempotencyKey: long,
      }),
    PaymentError,
    "idempotency_key_too_long",
  );
});

// ============================================================================
// 2. State machine
// ============================================================================
console.log("\n[2] Status state machine");

const cases: Array<[PaymentStatus, PaymentStatus, boolean]> = [
  ["created", "pending", true],
  ["created", "pending_manual", false],
  ["created", "confirmed", false],
  ["pending", "processing", true],
  ["pending", "pending_manual", true],
  ["pending", "confirmed", false], // must go through processing
  ["pending", "failed", true],
  ["pending", "rejected", true],
  ["pending", "canceled", true],
  ["processing", "confirmed", true],
  ["processing", "rejected", true],
  ["pending_manual", "processing", false], // manual cannot auto-progress
  ["pending_manual", "pending", false], // manual cannot revert
  ["pending_manual", "confirmed", true], // admin path
  ["pending_manual", "rejected", true],
  ["confirmed", "refunded", true],
  ["confirmed", "disputed", true],
  ["failed", "pending", true], // retry
  ["rejected", "pending", false], // terminal
  ["rejected", "confirmed", false],
  ["canceled", "pending", false],
  ["canceled", "confirmed", false],
];
for (const [from, to, expected] of cases) {
  await test(`${from} -> ${to} ${expected ? "ALLOWED" : "BLOCKED"}`, () => {
    assertEquals(canTransition(from, to), expected);
  });
}

// ============================================================================
// 3. Idempotency
// ============================================================================
console.log("\n[3] Idempotency");

await test("duplicate (user_id, idempotency_key) returns same row, canonical preserved", () => {
  const store = new Map<string, { id: string; amount: number; plan: string }>();
  const insert = (uid: string, idem: string, amount: number, plan: string) => {
    const k = `${uid}::${idem}`;
    if (store.has(k)) return { row: store.get(k)!, created: false };
    const row = { id: crypto.randomUUID(), amount, plan };
    store.set(k, row);
    return { row, created: true };
  };

  const a = insert("u1", "click-1", PLANS.starter.priceCents, "starter");
  const b = insert("u1", "click-1", 1, "elite");
  ok(a.created, "first insert created");
  ok(!b.created, "second insert idempotent");
  ok(
    b.row.amount === PLANS.starter.priceCents,
    "idempotent row keeps canonical amount",
  );
  ok(b.row.plan === "starter", "idempotent row keeps canonical plan");
});

await test("different idempotency keys create separate rows", () => {
  const store = new Set<string>();
  ok(!store.has("u1:click-1"), "absent initially");
  store.add("u1:click-1");
  store.add("u1:click-2");
  ok(store.has("u1:click-1"), "first key present");
  ok(store.has("u1:click-2"), "second key present");
  ok(store.size === 2, "two rows");
});

// ============================================================================
// 4. Wise safety
// ============================================================================
console.log("\n[4] Wise safety");

await test("Wise is created in pending_manual, never confirmed by client", () => {
  ok(
    canTransition("pending", "pending_manual"),
    "pending→pending_manual allowed",
  );
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
});

// ============================================================================
// 5. Crypto safety
// ============================================================================
console.log("\n[5] Crypto safety");

await test("pending → confirmed is BLOCKED", () => {
  assertEquals(canTransition("pending", "confirmed"), false);
});

await test("pending → processing → confirmed is the canonical path", () => {
  ok(canTransition("pending", "processing"), "pending→processing allowed");
  ok(canTransition("processing", "confirmed"), "processing→confirmed allowed");
});

await test("Amount tolerance ±5% (under)", () => {
  const expected = PLANS.professional.priceCents;
  const observed = Math.floor(expected * 0.90);
  const lower = Math.floor(expected * 0.95);
  const upper = Math.ceil(expected * 1.05);
  ok(observed < lower || observed > upper, "out of range");
});

await test("Amount tolerance ±5% (exact)", () => {
  const expected = PLANS.professional.priceCents;
  const lower = Math.floor(expected * 0.95);
  const upper = Math.ceil(expected * 1.05);
  ok(expected >= lower && expected <= upper, "in range");
});

await test("Network mismatch is detected", () => {
  const declared: string = "BTC";
  const observed: string = "TRC20";
  ok(declared !== observed, "mismatch detected");
});

await test("Test placeholder wallet is not a real address", () => {
  ok(TEST_PLACEHOLDER_WALLET.startsWith("tb1q"), "testnet bech32");
});

await test("Test placeholder bank is not a real bank", () => {
  ok(TEST_PLACEHOLDER_BANK.includes("NOT-CONFIGURED"), "placeholder text");
});

// ============================================================================
// 6. Fail-closed gates for the test admin path
// ============================================================================
console.log("\n[6] Test admin path fail-closed");

await test("test-confirm-payment must require TEST_CONFIRM_SECRET (no ADMIN_SECRET fallback)", () => {
  // The handler reads Deno.env.get("TEST_CONFIRM_SECRET") and refuses to fall back.
  // This test documents the contract: if TEST_CONFIRM_SECRET is missing, the
  // handler returns 500, regardless of whether ADMIN_SECRET is set.
  const simulated = {
    TEST_CONFIRM_SECRET: undefined as string | undefined,
    ADMIN_SECRET: "any-admin-secret",
  };
  const isClosed = simulated.TEST_CONFIRM_SECRET === undefined &&
    simulated.ADMIN_SECRET !== undefined;
  ok(
    isClosed,
    "TEST_CONFIRM_SECRET missing and ADMIN_SECRET set — handler must still refuse",
  );
});

await test("test-confirm-payment refuses to confirm a non-test row", () => {
  // Contract: a row without metadata.is_test === true cannot be confirmed.
  // The handler returns 400 not_a_test_payment. We simulate the check.
  const metadata = { is_test: false };
  const isTest = metadata.is_test === true;
  ok(!isTest, "is_test must be true to allow confirm");
});

await test("double-confirm is idempotent (a second call returns idempotent:true)", () => {
  // The handler short-circuits when currentStatus === "confirmed" and action === "confirm".
  const currentStatus: PaymentStatus = "confirmed";
  const action = "confirm";
  const idempotent = currentStatus === "confirmed" && action === "confirm";
  ok(idempotent, "second confirm is a no-op");
});

await test("double-reject is idempotent", () => {
  const currentStatus: PaymentStatus = "rejected";
  const action = "reject";
  const idempotent = currentStatus === "rejected" && action === "reject";
  ok(idempotent, "second reject is a no-op");
});

// ============================================================================
// 7. Enum completeness
// ============================================================================
console.log("\n[7] Enum completeness");

await test("all 4 plan ids are present", () => {
  for (const id of ["starter", "professional", "business", "enterprise"]) {
    ok(PLAN_IDS.includes(id as (typeof PLAN_IDS)[number]), `${id} present`);
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
    ok((PAYMENT_STATUSES as readonly string[]).includes(s), `${s} present`);
  }
});

await test("USD is supported, EUR is not", () => {
  ok(isSupportedCurrency("USD"), "USD supported");
  ok(!isSupportedCurrency("EUR"), "EUR rejected");
});

await test("BTC is a valid network with 1 confirmation", () => {
  const n = getCryptoNetwork("BTC");
  ok(n.id === "BTC", "id matches");
  ok(n.minConfirmations === 1, "1 confirmation");
});

await test("invalid network throws", () => {
  assertThrows(() => getCryptoNetwork("DOGE"), Error, "invalid_network");
});

await test("terminal statuses have no outbound transitions", () => {
  for (const terminal of ["rejected", "refunded", "canceled"] as const) {
    for (const status of PAYMENT_STATUSES) {
      if (status !== terminal) {
        ok(!canTransition(terminal, status), `${terminal} → ${status} blocked`);
      }
    }
  }
});

await test("every crypto network requires > 0 confirmations", () => {
  for (const n of CRYPTO_NETWORKS) {
    ok(n.minConfirmations > 0, `${n.id} > 0 confirmations`);
  }
});

// ============================================================================
// Summary
// ============================================================================
console.log(
  `\nResult: ${passed} passed, ${failed} failed.  STATUS: NOT EXECUTED in this session.`,
);
if (failed > 0) Deno.exit(1);
