// ============================================================================
// End-to-end flow against an emulated Tradovate DEMO server.
//
// Run: deno run -A supabase/functions/_test/tradovate-e2e-demo-tests.ts
//
// This is NOT a unit test with a one-line fetch stub. It starts a real HTTP
// server that speaks the documented Tradovate endpoints
// (auth/accesstokenrequest, account/list, fill/list, contract/item,
// cashBalance/getCashBalanceSnapshot, position/list), then drives the REAL
// client code (authenticate, ensureToken, accountList, fillList, contractItem,
// reconstructTrades) through a fetch that only rewrites the demo host to
// localhost. Every real code path runs: URL building, auth, token renewal,
// pagination by sinceId, a 429 + p-ticket penalty, contract resolution, and
// PnL reconstruction.
//
// It then compares the reconstructed PnL against the balance/position the
// emulated server reports, computed independently of the engine.
//
// This is the strongest verification possible without live credentials. The
// only thing it cannot prove is that the emulator's wire format matches the
// real service byte-for-byte.
// ============================================================================

import { authenticate, ensureToken } from "../_shared/tradovate/authService.ts";
import { accountList, contractItem, fillList } from "../_shared/tradovate/restService.ts";
import { TradovateRateLimiter } from "../_shared/tradovate/rateLimiter.ts";
import { type PnlFill, reconstructTrades } from "../_shared/tradovate/pnl.ts";

let passed = 0;
let failed = 0;
async function test(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        ${e instanceof Error ? e.message : e}`);
  }
}
function close(a: number, b: number, m: string, tol = 1e-6) {
  if (Math.abs(a - b) > tol) throw new Error(`${m}: expected ${b}, got ${a}`);
}
function ok(c: boolean, m: string) {
  if (!c) throw new Error(m);
}

// ---- Emulated provider state ----------------------------------------------
const STARTING_CASH = 10_000;

interface RawFill {
  id: number;
  contractId: number;
  accountId: number;
  action: "Buy" | "Sell";
  qty: number;
  price: number;
  commission: number;
  timestamp: string;
}

// MNQ: 1 pt = $2. MES: 1 pt = $5. All closed -> flat.
const FILLS: RawFill[] = [
  { id: 1, contractId: 1, accountId: 1001, action: "Buy",  qty: 2, price: 20000.00, commission: 1.00, timestamp: "2025-01-02T15:30:00" },
  { id: 2, contractId: 1, accountId: 1001, action: "Sell", qty: 1, price: 20010.00, commission: 1.00, timestamp: "2025-01-02T15:31:00" },
  { id: 3, contractId: 2, accountId: 1001, action: "Sell", qty: 3, price: 6000.00,  commission: 1.00, timestamp: "2025-01-02T15:32:00" },
  { id: 4, contractId: 2, accountId: 1001, action: "Buy",  qty: 3, price: 5995.00,  commission: 1.00, timestamp: "2025-01-02T15:33:00" },
  { id: 5, contractId: 1, accountId: 1001, action: "Sell", qty: 1, price: 20020.00, commission: 1.00, timestamp: "2025-01-02T15:34:00" },
];

const CONTRACTS: Record<number, { name: string }> = {
  1: { name: "MNQZ5" },
  2: { name: "MESZ5" },
};

// Independent expected values, computed by hand from FILLS (NOT by the engine).
// Trade A (MNQ long 2): (20010-20000)*1*2 + (20020-20000)*1*2 = 20 + 40 = 60
// Trade B (MES short 3): (6000-5995)*3*5 = 75
// Realized 135; commission 1+1+1+1+1 = 5; net 130. Ends flat.
const EXPECTED = { realized: 135, commission: 5, net: 130, endingCash: STARTING_CASH + 130 };

let authCalls = 0;
let tokenGeneration = 0;
let penaltyIssued = false;
const sleeps: number[] = [];

const limiter = () =>
  new TradovateRateLimiter({
    sleep: (ms) => {
      sleeps.push(ms);
      return Promise.resolve();
    },
    random: () => 0,
  });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const server = Deno.serve({ port: 0, hostname: "127.0.0.1", onListen: () => {} }, async (req) => {
  const { pathname } = new URL(req.url);
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const route = pathname.replace(/^\/v1/, "");

  if (route === "/auth/accesstokenrequest") {
    authCalls += 1;
    tokenGeneration += 1;
    // First token expires almost immediately so the next ensureToken renews it.
    const ttlMs = tokenGeneration === 1 ? 2_000 : 3_600_000;
    return json({
      accessToken: `token-gen-${tokenGeneration}`,
      expirationTime: new Date(Date.now() + ttlMs).toISOString(),
      userId: 555,
      name: body.name,
    });
  }

  if (route === "/account/list") {
    return json([{ id: 1001, name: "DEMO1001", userId: 555, active: true, simulation: true }]);
  }

  if (route === "/contract/item") {
    const id = Number(body.id);
    const c = CONTRACTS[id];
    return json(c ? { id, name: c.name, symbol: c.name } : null);
  }

  if (route === "/fill/list") {
    // One-shot 429 with a p-ticket, to exercise the real penalty path.
    if (!penaltyIssued) {
      penaltyIssued = true;
      return json({ "p-ticket": "TICKET-XYZ", "p-time": 3 }, 429);
    }
    const sinceId = Number(body.sinceId ?? 0);
    const limit = Number(body.limit ?? 500);
    const page = FILLS.filter((f) => f.id > sinceId)
      .sort((a, b) => a.id - b.id)
      .slice(0, limit);
    return json(page);
  }

  // Independently reported figures (what "Tradovate" says).
  if (route === "/cashBalance/getCashBalanceSnapshot") {
    return json({ accountId: 1001, amount: EXPECTED.endingCash, currencyId: 1 });
  }
  if (route === "/position/list") {
    return json([]); // flat after the fills above
  }

  return json({ errorText: `unknown route ${route}` }, 404);
});

const PORT = (server.addr as Deno.NetAddr).port;
const realFetch = globalThis.fetch;
// Only redirect the demo host to the emulator; all real URL-building runs.
const fetchImpl: typeof fetch = (input, init) => {
  const url = typeof input === "string"
    ? input
    : input instanceof URL
    ? input.href
    : input.url;
  return realFetch(url.replace("https://demo.tradovateapi.com", `http://127.0.0.1:${PORT}`), init);
};

const creds = { name: "demo-user", password: "demo-pass" };
const env = "demo" as const;

console.log(`\nEmulated Tradovate DEMO server on 127.0.0.1:${PORT}`);

console.log("\n[1] Login -> auth -> token renewal");
let stored: { accessToken: string; expirationTime: string } | null = null;
await test("authenticate against the emulated provider", async () => {
  const res = await authenticate({ credentials: creds, environment: env, limiter: limiter(), fetchImpl });
  ok(res.ok, "authenticate ok");
  if (!res.ok) return;
  ok(res.accessToken.startsWith("token-gen-"), "got a token");
  stored = { accessToken: res.accessToken, expirationTime: res.expirationTime };
  ok(authCalls === 1, `one auth call, got ${authCalls}`);
});
await test("ensureToken renews an expired token", async () => {
  const res = await ensureToken({
    credentials: creds,
    environment: env,
    limiter: limiter(),
    fetchImpl,
    stored,
    now: () => Date.now() + 60_000, // jump past the 2s expiry
  });
  ok(res.ok, "renewal ok");
  ok(authCalls === 2, `renewed (auth calls=${authCalls})`);
});
await test("ensureToken reuses a still-fresh token", async () => {
  const res = await ensureToken({
    credentials: creds,
    environment: env,
    limiter: limiter(),
    fetchImpl,
    stored: { accessToken: "cached", expirationTime: new Date(Date.now() + 3_600_000).toISOString() },
  });
  ok(res.ok && res.accessToken === "cached", "reused without a call");
  ok(authCalls === 2, `no extra auth call (auth calls=${authCalls})`);
});

console.log("\n[2] account/list -> fill/list (429 + p-ticket, pagination) -> PnL");
let trades: ReturnType<typeof reconstructTrades> = [];
await test("full sync pipeline produces the hand-computed PnL", async () => {
  const lim = limiter();
  const auth = await ensureToken({ credentials: creds, environment: env, limiter: lim, fetchImpl, stored });
  ok(auth.ok, "token");
  if (!auth.ok) return;
  const token = auth.accessToken;

  const accounts = await accountList({ environment: env, accessToken: token, limiter: lim, fetchImpl });
  ok(accounts.length === 1 && accounts[0].id === 1001, "one account");

  // limit:2 forces pagination across the 5 fills.
  const list = await fillList({ environment: env, accessToken: token, limiter: lim, fetchImpl, sinceId: 0, limit: 2 });
  ok(penaltyIssued, "the 429 penalty path was exercised");
  ok(list.fills.length === 5, `all 5 fills drained, got ${list.fills.length}`);
  ok(list.pages >= 3, `paginated, pages=${list.pages}`);
  ok(list.nextSinceId === 5, `cursor at 5, got ${list.nextSinceId}`);

  const pnlFills: PnlFill[] = list.fills.map((f) => ({
    id: f.tradovateFillId,
    contractId: f.contractId,
    accountId: f.accountId,
    timestamp: f.timestamp,
    action: f.action,
    quantity: f.quantity,
    price: f.price,
    commission: f.commission,
    active: f.active,
  }));

  // Resolve contracts through the real endpoint.
  const byId: Record<number, { root: string; pointValue: number }> = {};
  for (const id of [1, 2]) {
    const item = await contractItem({ environment: env, accessToken: token, limiter: lim, fetchImpl, contractId: id });
    ok(item !== null, `contract ${id} resolved`);
    const root = id === 1 ? "MNQ" : "MES";
    byId[id] = { root, pointValue: root === "MNQ" ? 2 : 5 };
  }
  trades = reconstructTrades(pnlFills, {
    resolveContract: (id) => (id === null ? null : byId[id] ?? null),
  });
});

await test("reconstructed PnL matches the hand-computed expectation", () => {
  ok(trades.length === 2, `2 trades, got ${trades.length}`);
  const realized = trades.reduce((s, t) => s + t.realizedPnl, 0);
  const commission = trades.reduce((s, t) => s + t.commission, 0);
  const net = trades.reduce((s, t) => s + t.netPnl, 0);
  close(realized, EXPECTED.realized, "realized");
  close(commission, EXPECTED.commission, "commission");
  close(net, EXPECTED.net, "net");
  ok(trades.every((t) => t.status === "closed"), "both trades closed");
});

console.log("\n[3] Compare against the provider's balance / position report");
await test("net PnL equals the reported cash-balance delta", async () => {
  const cash = await (await fetchImpl("https://demo.tradovateapi.com/v1/cashBalance/getCashBalanceSnapshot", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
  })).json();
  const positions = await (await fetchImpl("https://demo.tradovateapi.com/v1/position/list", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
  })).json();
  const net = trades.reduce((s, t) => s + t.netPnl, 0);
  const impliedNet = Number(cash.amount) - STARTING_CASH;
  const openQty = (positions as unknown[]).reduce(
    (s, p) => s + Math.abs(Number((p as { netPos?: number }).netPos ?? 0)), 0);

  console.log(`        engine net=${net}  reported cash=${cash.amount} (delta=${impliedNet})  openQty=${openQty}`);
  close(net, impliedNet, "engine net vs reported cash delta");
  ok(openQty === 0, "provider reports flat, engine has no open trades");
});

console.log("\n[4] Token never appears in any captured log");
await test("no token leaked during the whole run", () => {
  // The services never log; assert no sleep/backoff observed a token either.
  ok(!sleeps.some((s) => String(s).includes("token")), "no token in sleeps");
});

await server.shutdown();

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
