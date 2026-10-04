// ============================================================================
// PnL engine unit tests (no network, no DB).
//
// Run: deno run -A supabase/functions/_test/tradovate-pnl-tests.ts
//
// Covers: FIFO vs weighted average, shorts, partial closes, flips with a
// partial close, contract rollover, duplicate and out-of-order fills,
// timezones, multiple accounts per user, micros (MNQ/MES/MGC) and per-account
// commission.
// ============================================================================

import {
  type ContractInfo,
  POINT_VALUES,
  type PnlFill,
  pointValueFor,
  reconstructTrades,
  rootFromSymbol,
  utcDate,
} from "../_shared/tradovate/pnl.ts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${e instanceof Error ? e.message : e}`);
  }
}

function eq<T>(actual: T, expected: T, msg: string) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg}: expected ${b}, got ${a}`);
}

function close(actual: number, expected: number, msg: string, eps = 1e-6) {
  if (Math.abs(actual - expected) > eps) {
    throw new Error(`${msg}: expected ${expected}, got ${actual}`);
  }
}

// Contract registry used by the resolver.
const CONTRACTS: Record<number, ContractInfo> = {
  1: { root: "MNQ", symbol: "MNQZ5", pointValue: 2 },
  2: { root: "MES", symbol: "MESZ5", pointValue: 5 },
  3: { root: "MGC", symbol: "MGCZ5", pointValue: 10 },
  10: { root: "NQ", symbol: "NQZ5", pointValue: 20 },
  11: { root: "NQ", symbol: "NQH6", pointValue: 20 },
};
const resolve = (id: number | null) => (id === null ? null : CONTRACTS[id] ?? null);

let nextId = 1;
function fill(
  partial: Partial<PnlFill> & { price: number; quantity: number; action: "Buy" | "Sell" },
  ts: string,
  contractId: number,
  accountId: number | null = 1,
): PnlFill {
  return {
    id: partial.id ?? nextId++,
    contractId,
    accountId,
    timestamp: ts,
    action: partial.action,
    quantity: partial.quantity,
    price: partial.price,
    commission: partial.commission,
    active: partial.active,
  };
}

console.log("\n[1] Point values incl. micros");
test("MNQ=2 MES=5 MGC=10 and full-size siblings", () => {
  eq(pointValueFor("MNQ"), 2, "MNQ");
  eq(pointValueFor("MES"), 5, "MES");
  eq(pointValueFor("MGC"), 10, "MGC");
  eq(pointValueFor("NQ"), 20, "NQ");
  eq(pointValueFor("ES"), 50, "ES");
  eq(pointValueFor("GC"), 100, "GC");
  eq(POINT_VALUES.MNQ, 2, "POINT_VALUES.MNQ");
});
test("unknown root falls back", () => {
  eq(pointValueFor("ZZZ", 7), 7, "fallback");
});
test("rootFromSymbol strips month/year", () => {
  eq(rootFromSymbol("MNQZ5"), "MNQ", "MNQZ5");
  eq(rootFromSymbol("NQH6"), "NQ", "NQH6");
  eq(rootFromSymbol("MESZ5"), "MES", "MESZ5");
});

console.log("\n[2] Long and short round trips (FIFO)");
test("long +10.00 on MNQ (1pt = 2 USD)", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 1, action: "Buy", id: 1 }, "2025-01-02T15:30:00Z", 1),
    fill({ price: 110, quantity: 1, action: "Sell", id: 2 }, "2025-01-02T15:31:00Z", 1),
  ], { resolveContract: resolve });
  eq(t.length, 1, "one trade");
  eq(t[0].status, "closed", "closed");
  eq(t[0].side, "long", "long");
  close(t[0].realizedPnl, 20, "realized");
  close(t[0].exitPrice ?? 0, 110, "exit");
});
test("short +20.00 on MNQ", () => {
  const t = reconstructTrades([
    fill({ price: 110, quantity: 1, action: "Sell", id: 1 }, "2025-01-02T15:30:00Z", 1),
    fill({ price: 100, quantity: 1, action: "Buy", id: 2 }, "2025-01-02T15:31:00Z", 1),
  ], { resolveContract: resolve });
  eq(t[0].side, "short", "short");
  close(t[0].realizedPnl, 20, "realized");
});

console.log("\n[3] Partial close");
test("buy 2, sell 1 leaves an open position with realized PnL", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 2, action: "Buy", id: 1 }, "2025-01-02T15:30:00Z", 1),
    fill({ price: 110, quantity: 1, action: "Sell", id: 2 }, "2025-01-02T15:31:00Z", 1),
  ], { resolveContract: resolve });
  eq(t.length, 1, "one trade");
  eq(t[0].status, "open", "still open");
  eq(t[0].quantity, 2, "original qty");
  close(t[0].realizedPnl, 20, "realized on 1 lot");
  // An open trade has no final exit, so exitPrice stays null even though one
  // lot was closed. It is set only when the whole position is flat.
  eq(t[0].exitPrice, null, "no exit while open");
});

console.log("\n[4] Flip with partial close");
test("buy 2 then sell 3 -> close long 2, open short 1", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 2, action: "Buy", id: 1 }, "2025-01-02T15:30:00Z", 1),
    fill({ price: 110, quantity: 3, action: "Sell", id: 2 }, "2025-01-02T15:31:00Z", 1),
  ], { resolveContract: resolve });
  eq(t.length, 2, "two trades");
  const long = t.find((x) => x.side === "long")!;
  const short = t.find((x) => x.side === "short")!;
  eq(long.status, "closed", "long closed");
  close(long.realizedPnl, 40, "long realized (2 x 10 x 2)");
  eq(short.status, "open", "short open");
  eq(short.quantity, 1, "short residual qty");
  close(short.entryPrice, 110, "short entry");
});

console.log("\n[5] Contract rollover does not net across months");
test("buy NQZ5 then sell NQH6 -> two separate positions", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 1, action: "Buy", id: 1 }, "2025-03-15T15:30:00Z", 10),
    fill({ price: 110, quantity: 1, action: "Sell", id: 2 }, "2025-03-16T15:30:00Z", 11),
  ], { resolveContract: resolve });
  eq(t.length, 2, "two trades");
  eq(t.every((x) => x.status === "open"), true, "both open");
  close(t.reduce((s, x) => s + x.realizedPnl, 0), 0, "no cross-month PnL");
});

console.log("\n[6] Duplicate and out-of-order fills");
test("duplicate fill id is collapsed", () => {
  const f = fill({ price: 100, quantity: 1, action: "Buy", id: 42 }, "2025-01-02T15:30:00Z", 1);
  const t = reconstructTrades([f, { ...f }], { resolveContract: resolve });
  eq(t.length, 1, "one open trade");
  eq(t[0].quantity, 1, "qty not doubled");
});
test("out-of-order arrival still reconstructs the round trip", () => {
  const sell = fill({ price: 110, quantity: 1, action: "Sell", id: 2 }, "2025-01-02T15:31:00Z", 1);
  const buy = fill({ price: 100, quantity: 1, action: "Buy", id: 1 }, "2025-01-02T15:30:00Z", 1);
  const t = reconstructTrades([sell, buy], { resolveContract: resolve });
  eq(t.length, 1, "one trade");
  eq(t[0].status, "closed", "closed");
  close(t[0].realizedPnl, 20, "realized");
});
test("inactive fill is ignored", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 1, action: "Buy", id: 1 }, "2025-01-02T15:30:00Z", 1),
    fill({ price: 110, quantity: 1, action: "Sell", id: 2, active: false }, "2025-01-02T15:31:00Z", 1),
  ], { resolveContract: resolve });
  eq(t[0].status, "open", "still open");
});

console.log("\n[7] Timezones (UTC, naive, offset)");
test("naive timestamp is treated as UTC", () => {
  eq(utcDate("2025-01-02T15:30:00"), "2025-01-02", "naive");
  eq(utcDate("2025-01-02T15:30:00Z"), "2025-01-02", "explicit Z");
});
test("offset is converted to UTC and can cross midnight", () => {
  eq(utcDate("2025-01-02T23:30:00-05:00"), "2025-01-03", "crosses to next day UTC");
});
test("order uses absolute time regardless of representation", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 1, action: "Buy", id: 1 }, "2025-01-02T10:00:00Z", 1),
    fill({ price: 110, quantity: 1, action: "Sell", id: 2 }, "2025-01-02T04:30:00-05:00", 1),
  ], { resolveContract: resolve });
  eq(t[0].status, "closed", "closed");
  close(t[0].realizedPnl, 20, "realized");
});

console.log("\n[8] Multiple accounts per user");
test("same contract on two accounts stays separate", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 1, action: "Buy", id: 1 }, "2025-01-02T15:30:00Z", 1, 1),
    fill({ price: 100, quantity: 1, action: "Buy", id: 2 }, "2025-01-02T15:30:00Z", 1, 2),
    fill({ price: 110, quantity: 1, action: "Sell", id: 3 }, "2025-01-02T15:31:00Z", 1, 1),
  ], { resolveContract: resolve });
  eq(t.length, 2, "two trades");
  const a1 = t.find((x) => x.accountId === 1)!;
  const a2 = t.find((x) => x.accountId === 2)!;
  eq(a1.status, "closed", "account 1 closed");
  eq(a2.status, "open", "account 2 open");
});

console.log("\n[9] Commission attribution");
test("per-fill commission is subtracted from net", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 1, action: "Buy", id: 1, commission: 1.5 }, "2025-01-02T15:30:00Z", 1),
    fill({ price: 110, quantity: 1, action: "Sell", id: 2, commission: 1.5 }, "2025-01-02T15:31:00Z", 1),
  ], { resolveContract: resolve });
  close(t[0].realizedPnl, 20, "gross");
  close(t[0].commission, 3, "commission");
  close(t[0].netPnl, 17, "net");
});
test("per-contract fallback commission", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 2, action: "Buy", id: 1 }, "2025-01-02T15:30:00Z", 1),
    fill({ price: 110, quantity: 2, action: "Sell", id: 2 }, "2025-01-02T15:31:00Z", 1),
  ], { resolveContract: resolve, commissionPerContract: 1.25 });
  close(t[0].commission, 5, "2 lots x 2 sides x 1.25");
  close(t[0].netPnl, 40 - 5, "net");
});
test("per-account commission function", () => {
  const t = reconstructTrades([
    fill({ price: 100, quantity: 1, action: "Buy", id: 1 }, "2025-01-02T15:30:00Z", 1, 9),
    fill({ price: 110, quantity: 1, action: "Sell", id: 2 }, "2025-01-02T15:31:00Z", 1, 9),
  ], { resolveContract: resolve, commissionPerContract: (acct) => acct === 9 ? 2 : 5 });
  close(t[0].commission, 4, "account 9 -> 2/side");
});

console.log("\n[10] Weighted average vs FIFO");
test("weighted average entry differs from FIFO", () => {
  const fills = [
    fill({ price: 100, quantity: 1, action: "Buy", id: 1 }, "2025-01-02T15:30:00Z", 1),
    fill({ price: 120, quantity: 1, action: "Buy", id: 2 }, "2025-01-02T15:31:00Z", 1),
    fill({ price: 130, quantity: 1, action: "Sell", id: 3 }, "2025-01-02T15:32:00Z", 1),
  ];
  const fifo = reconstructTrades(fills, { resolveContract: resolve, method: "fifo" });
  const wa = reconstructTrades(fills, { resolveContract: resolve, method: "weighted_average" });
  close(fifo[0].realizedPnl, 60, "fifo uses 100 entry");
  close(wa[0].realizedPnl, 40, "wa uses 110 avg entry");
});

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
