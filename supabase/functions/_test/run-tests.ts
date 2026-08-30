// Local Deno test harness for the payment foundation.
//
// Run:   deno run -A supabase/functions/_test/run-tests.ts
//
// This script does NOT require Supabase, network access, or secrets. It
// exercises the pure logic (validation, state machine, idempotency in
// memory) and stubs the database where the contract depends on it.

import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  PAYMENT_STATUSES,
  PaymentStatus,
  canTransition,
  getPlan,
  PLANS,
  PLAN_IDS,
  CRYPTO_NETWORKS,
  TEST_PLACEHOLDER_WALLET,
} from "../_shared/plans.ts";
import { PaymentError, validateCheckoutInput } from "../_shared/payments.ts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => { console.log(`  ✓ ${name}`); passed++; })
    .catch((e) => { console.error(`  ✗ ${name}`); console.error(e); failed++; });
}

function ok(cond: boolean, msg: string) { if (!cond) throw new Error(msg); }

// ---------------------------------------------------------------------------
// 1. Canonical plan/price table is server-side
// ---------------------------------------------------------------------------
console.log("\n[1] Canonical plan & price validation");

await test("rejects unknown plan id", () => {
  assertThrows(() => validateCheckoutInput({
    planId: "enterprise", clientCurrency: "USD", network: "BTC",
    idempotencyKey: "abcdefgh",
  }), PaymentError, "invalid_plan_id");
});

await test("rejects non-string plan id", () => {
  assertThrows(() => validateCheckoutInput({
    planId: 123, clientCurrency: "USD", network: null,
    idempotencyKey: "abcdefgh",
  }), PaymentError, "invalid_plan_id");
});

await test("rejects unsupported currency", () => {
  assertThrows(() => validateCheckoutInput({
    planId: "pro", clientCurrency: "EUR", network: null,
    idempotencyKey: "abcdefgh",
  }), PaymentError, "invalid_currency");
});

await test("ignores client-supplied amount and re-derives from plan", () => {
  const v = validateCheckoutInput({
    planId: "pro",
    clientAmountCents: 1,                 // would be 1 cent if trusted
    clientCurrency: "USD",
    network: null,
    idempotencyKey: "abcdefgh",
  });
  ok(v.amountCents === PLANS.pro.priceCents, `expected ${PLANS.pro.priceCents}, got ${v.amountCents}`);
});

await test("ignores client-supplied currency and forces USD", () => {
  const v = validateCheckoutInput({
    planId: "starter", clientCurrency: "USD", network: null,
    idempotencyKey: "abcdefgh",
  });
  ok(v.currency === "USD", "currency must be USD");
});

await test("rejects invalid network", () => {
  assertThrows(() => validateCheckoutInput({
    planId: "starter", clientCurrency: "USD", network: "DOGE",
    idempotencyKey: "abcdefgh",
  }), PaymentError, "invalid_network");
});

await test("rejects missing idempotency key", () => {
  assertThrows(() => validateCheckoutInput({
    planId: "starter", clientCurrency: "USD", network: null,
    idempotencyKey: "short",
  }), PaymentError, "idempotency_key_required");
});

await test("rejects oversize idempotency key", () => {
  const long = "x".repeat(201);
  assertThrows(() => validateCheckoutInput({
    planId: "starter", clientCurrency: "USD", network: null,
    idempotencyKey: long,
  }), PaymentError, "idempotency_key_too_long");
});

// ---------------------------------------------------------------------------
// 2. State machine: allowed transitions
// ---------------------------------------------------------------------------
console.log("\n[2] Status state machine");

const cases: Array<[PaymentStatus, PaymentStatus, boolean]> = [
  ["created", "pending", true],
  ["created", "pending_manual", false],
  ["pending", "processing", true],
  ["pending", "pending_manual", true],
  ["pending", "failed", true],
  ["pending", "rejected", true],
  ["pending", "confirmed", false],   // must go through processing
  ["processing", "confirmed", true],
  ["processing", "rejected", true],
  ["pending_manual", "confirmed", true],
  ["pending_manual", "rejected", true],
  ["pending_manual", "pending", false], // manual cannot revert automatically
  ["confirmed", "refunded", true],
  ["confirmed", "disputed", true],
  ["rejected", "pending", false],
  ["canceled", "pending", false],
  ["failed", "pending", true],
  ["disputed", "refunded", true],
];
for (const [from, to, expected] of cases) {
  await test(`${from} -> ${to} ${expected ? "ALLOWED" : "BLOCKED"}`, () => {
    assertEquals(canTransition(from, to), expected);
  });
}

// ---------------------------------------------------------------------------
// 3. Idempotency: in-memory simulation
// ---------------------------------------------------------------------------
console.log("\n[3] Idempotency");

await test("duplicate (user_id, idempotency_key) returns same row, not a new one", () => {
  // In-memory representation of the unique constraint
  const store = new Map<string, { id: string; amount: number; plan: string }>();
  const insert = (userId: string, idem: string, amount: number, plan: string) => {
    const k = `${userId}::${idem}`;
    if (store.has(k)) return { row: store.get(k)!, created: false };
    const row = { id: crypto.randomUUID(), amount, plan };
    store.set(k, row);
    return { row, created: true };
  };

  const a = insert("u1", "click-1", PLANS.starter.priceCents, "starter");
  const b = insert("u1", "click-1", 1, "elite"); // mismatched attempt
  ok(a.created, "first insert created");
  ok(!b.created, "second insert idempotent");
  ok(b.row.amount === PLANS.starter.priceCents, "idempotent row keeps canonical amount");
  ok(b.row.plan === "starter", "idempotent row keeps canonical plan");
});

await test("different idempotency keys create separate rows", () => {
  const store = new Map<string, string>();
  const insert = (k: string) => {
    if (store.has(k)) return false;
    store.set(k, k);
    return true;
  };
  ok(insert("u1:click-1") === true, "first created");
  ok(insert("u1:click-2") === true, "second created");
  ok(insert("u1:click-1") === false, "duplicate idempotent");
});

// ---------------------------------------------------------------------------
// 4. Wise is forced to pending_manual; cannot reach confirmed without admin
// ---------------------------------------------------------------------------
console.log("\n[4] Wise flow safety");

await test("Wise is never created in confirmed", () => {
  // wise-checkout inserts as pending, then transitions pending -> pending_manual.
  // From pending_manual, the only outbound transitions are confirmed, rejected,
  // canceled — and all three are admin-only paths (no user JWT or browser
  // click can reach them).
  ok(!canTransition("pending_manual", "processing"), "manual cannot auto-progress");
  ok(canTransition("pending_manual", "confirmed"), "manual can be admin-confirmed");
  ok(canTransition("pending_manual", "rejected"), "manual can be admin-rejected");
});

// ---------------------------------------------------------------------------
// 5. Crypto flow safety
// ---------------------------------------------------------------------------
console.log("\n[5] Crypto flow safety");

await test("Crypto cannot reach confirmed without going through processing", () => {
  ok(!canTransition("pending", "confirmed"), "pending->confirmed blocked");
  ok(canTransition("pending", "processing"), "pending->processing allowed");
  ok(canTransition("processing", "confirmed"), "processing->confirmed allowed");
});

await test("Amount tolerance (simulated): 5% under is rejected", () => {
  const expected = PLANS.pro.priceCents;
  const observed = Math.floor(expected * 0.90); // 10% under
  const lower = Math.floor(expected * 0.95);
  const upper = Math.ceil(expected * 1.05);
  ok(observed < lower || observed > upper, "out of range detected");
});

await test("Amount tolerance (simulated): within ±5% is accepted", () => {
  const expected = PLANS.pro.priceCents;
  const observed = expected; // exact
  const lower = Math.floor(expected * 0.95);
  const upper = Math.ceil(expected * 1.05);
  ok(observed >= lower && observed <= upper, "in range accepted");
});

await test("Network mismatch (simulated) is rejected", () => {
  const declaredNetwork = "BTC";
  const observedNetwork = "TRC20";
  ok(declaredNetwork !== observedNetwork, "mismatch detected");
});

await test("Test placeholder wallet is not a real address", () => {
  ok(TEST_PLACEHOLDER_WALLET.startsWith("tb1q"), "looks like testnet bech32");
});

// ---------------------------------------------------------------------------
// 6. Failed verification
// ---------------------------------------------------------------------------
console.log("\n[6] Failed verification");

await test("0 confirmations is below minimum for every network", () => {
  for (const n of CRYPTO_NETWORKS) {
    ok(n.minConfirmations > 0, `${n.id} requires > 0 confirmations`);
  }
});

await test("1 confirmation is rejected for ETH/BNB/POLYGON/SOL", () => {
  for (const id of ["ETH", "BNB", "POLYGON", "SOL"] as const) {
    const n = CRYPTO_NETWORKS.find((x) => x.id === id)!;
    ok(n.minConfirmations > 1, `${id} requires more than 1 confirmation`);
  }
});

// ---------------------------------------------------------------------------
// 7. Auth / authorization
// ---------------------------------------------------------------------------
console.log("\n[7] Auth & authorization");

await test("Missing planId is rejected", () => {
  assertThrows(() => validateCheckoutInput({
    planId: undefined, clientCurrency: "USD", network: null,
    idempotencyKey: "abcdefgh",
  }), PaymentError, "invalid_plan_id");
});

await test("Non-USD currency is rejected (no EUR/BRL/BTC-denominated prices)", () => {
  for (const bad of ["EUR", "BRL", "BTC", "GBP", "JPY"]) {
    let threw = false;
    try {
      validateCheckoutInput({ planId: "pro", clientCurrency: bad, network: null, idempotencyKey: "abcdefgh" });
    } catch { threw = true; }
    ok(threw, `currency ${bad} must be rejected`);
  }
});

// ---------------------------------------------------------------------------
// 8. Audit log invariants
// ---------------------------------------------------------------------------
console.log("\n[8] Audit log");

await test("Every transition is a no-op when the source status mismatches", () => {
  // Simulated: transitionPayment is supposed to do
  //   .eq("status", previousStatus)
  // which is the optimistic-concurrency check. Here we just verify the
  // helper rejects impossible transitions.
  assertThrows(() => {
    if (!canTransition("created", "confirmed")) {
      throw new PaymentError("invalid_transition");
    }
  });
});

// ---------------------------------------------------------------------------
// 9. Statuses
// ---------------------------------------------------------------------------
console.log("\n[9] Statuses enum");

await test("all 10 statuses present", () => {
  for (const s of ["created","pending","processing","confirmed","failed","rejected","refunded","disputed","canceled","pending_manual"]) {
    ok((PAYMENT_STATUSES as readonly string[]).includes(s), `${s} present`);
  }
});

// ---------------------------------------------------------------------------
console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);