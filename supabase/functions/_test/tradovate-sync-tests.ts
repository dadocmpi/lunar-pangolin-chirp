// ============================================================================
// Sync idempotency unit tests (no network, no DB).
//
// Run: deno run -A supabase/functions/_test/tradovate-sync-tests.ts
//
// Proves the properties the scheduled poller relies on:
//   * merging an overlapping fill batch does not duplicate fills,
//   * reconstructing trades from the merged set is deterministic, so a repeat
//     run produces the same dedupe keys and therefore upserts, not duplicates.
// ============================================================================

import { mergeFills } from "../_shared/tradovate/sync.ts";
import {
  type ContractInfo,
  type PnlFill,
  reconstructTrades,
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
function eq<T>(a: T, b: T, m: string) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`${m}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  }
}

const CONTRACTS: Record<number, ContractInfo> = { 1: { root: "MNQ", pointValue: 2 } };
const resolve = (id: number | null) => (id === null ? null : CONTRACTS[id] ?? null);

function f(id: number, price: number, action: "Buy" | "Sell", ts: string): PnlFill {
  return { id, contractId: 1, accountId: 1, timestamp: ts, action, quantity: 1, price };
}

console.log("\n[1] Fill merge idempotency");
test("re-merging the same batch adds nothing", () => {
  const batch = [f(1, 100, "Buy", "2025-01-02T15:30:00Z"), f(2, 110, "Sell", "2025-01-02T15:31:00Z")];
  const once = mergeFills([], batch);
  const twice = mergeFills(once, batch);
  eq(twice.length, 2, "still two fills");
  eq(twice.map((x) => x.id), [1, 2], "ids unchanged");
});
test("overlapping batch only appends the new fill", () => {
  const existing = [f(1, 100, "Buy", "2025-01-02T15:30:00Z")];
  const incoming = [f(1, 100, "Buy", "2025-01-02T15:30:00Z"), f(2, 110, "Sell", "2025-01-02T15:31:00Z")];
  const merged = mergeFills(existing, incoming);
  eq(merged.length, 2, "one appended");
});
test("corrected fill (same id) replaces the old value", () => {
  const existing = [f(5, 100, "Buy", "2025-01-02T15:30:00Z")];
  const corrected = [{ ...f(5, 105, "Buy", "2025-01-02T15:30:00Z") }];
  const merged = mergeFills(existing, corrected);
  eq(merged[0].price, 105, "latest wins");
});

console.log("\n[2] Deterministic trade rebuild");
test("rebuild twice yields identical dedupe keys", () => {
  const fills = [
    f(1, 100, "Buy", "2025-01-02T15:30:00Z"),
    f(2, 110, "Sell", "2025-01-02T15:31:00Z"),
  ];
  const a = reconstructTrades(fills, { resolveContract: resolve });
  const b = reconstructTrades(fills, { resolveContract: resolve });
  eq(a.map((t) => t.dedupeKey), b.map((t) => t.dedupeKey), "same keys");
  eq(a.map((t) => t.netPnl), b.map((t) => t.netPnl), "same pnl");
});
test("adding a later fill does not change an earlier closed trade's key", () => {
  const base = [
    f(1, 100, "Buy", "2025-01-02T15:30:00Z"),
    f(2, 110, "Sell", "2025-01-02T15:31:00Z"),
  ];
  const first = reconstructTrades(base, { resolveContract: resolve });
  const later = reconstructTrades(
    mergeFills(base, [f(3, 120, "Buy", "2025-01-02T15:32:00Z")]),
    { resolveContract: resolve },
  );
  const closedFirst = first.find((t) => t.status === "closed")!;
  const closedLater = later.find((t) => t.dedupeKey === closedFirst.dedupeKey);
  eq(!!closedLater, true, "earlier closed trade preserved by key");
});

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
