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

console.log("\n[3] syncIntegration never lets a provider failure escape");
await test("a 500 from /fill/list is classified, not thrown", async () => {
  // Regression: a 500 from /fill/list used to throw out of syncIntegration,
  // which would abort the whole scheduled fan-out batch. It must classify,
  // persist status=error, and return.
  const { syncIntegration } = await import("../_shared/tradovate/sync.ts");
  const crypto = await import("../_shared/tradovate/crypto.ts");
  const { TradovateRateLimiter } = await import("../_shared/tradovate/rateLimiter.ts");
  Deno.env.set("TRADOVATE_ENCRYPTION_KEY", "sync-regression-key");
  const parts = await crypto.encryptCredentials({ name: "u", password: "p" }, "sync-regression-key");

  const fakeAdmin = () => ({
    from(table: string) {
      const b: Record<string, unknown> = {};
      const chain = () => () => b;
      b.select = chain(); b.eq = chain(); b.neq = chain();
      b.update = chain(); b.upsert = chain(); b.order = chain();
      b.maybeSingle = () => Promise.resolve(
        table === "integrations"
          ? { data: { id: "integ", user_id: "u", environment: "demo", tradovate_account_id: 1, tradovate_user_id: 2, account_spec: "D", label: null, status: "connected", last_fill_id: 0, token_expires_at: null }, error: null }
          : { data: { ciphertext: parts.ciphertext, iv: parts.iv, auth_tag: parts.authTag, key_version: 1 }, error: null },
      );
      b.single = () => Promise.resolve({ data: { id: "integ" }, error: null });
      b.then = (res: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null, count: 0 }).then(res);
      return b;
    },
  } as never);

  const fetchImpl: typeof fetch = async (input) => {
    const url = String(input);
    if (url.includes("/auth/accesstokenrequest")) {
      return new Response(JSON.stringify({ accessToken: "t", expirationTime: new Date(Date.now() + 3600_000).toISOString(), userId: 2, name: "u" }), { status: 200 });
    }
    return new Response(JSON.stringify({ errorText: "boom" }), { status: 500 });
  };

  const r = await syncIntegration({
    admin: fakeAdmin(), userId: "u", integrationId: "integ",
    skipLock: true, fetchImpl,
    limiter: new TradovateRateLimiter({ sleep: async () => {} }),
  });
  eq(r.status, "error", "classified as error");
  eq(r.errorCode, "http_500", "error code records the provider status");
});

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
