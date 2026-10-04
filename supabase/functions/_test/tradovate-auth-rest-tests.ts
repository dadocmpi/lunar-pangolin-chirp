// ============================================================================
// authService / restService / crypto unit tests (no network, no DB).
//
// Run: deno run -A supabase/functions/_test/tradovate-auth-rest-tests.ts
//
// Covers: token renewal margin, auth error classification, incremental
// /fill/list pagination and normalization, timestamp/timezone handling, and
// the AES-256-GCM credential envelope (round-trip + tamper detection +
// redaction).
// ============================================================================

import {
  authenticate,
  ensureToken,
  hostFor,
  needsRenewal,
  TOKEN_RENEW_MARGIN_MS,
} from "../_shared/tradovate/authService.ts";
import {
  fillList,
  normalizeFill,
  normalizeTimestamp,
} from "../_shared/tradovate/restService.ts";
import {
  decryptCredentials,
  encryptCredentials,
  redact,
} from "../_shared/tradovate/crypto.ts";
import { TradovateRateLimiter } from "../_shared/tradovate/rateLimiter.ts";

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${e instanceof Error ? e.message : e}`);
  }
}
function eq<T>(a: T, b: T, msg: string) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  }
}
function ok(c: boolean, m: string) {
  if (!c) throw new Error(m);
}

const noSleep = () => Promise.resolve();
function limiter() {
  return new TradovateRateLimiter({ sleep: noSleep });
}
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

console.log("\n[1] Hosts and token renewal margin");
await test("demo/live hosts", () => {
  eq(hostFor("demo"), "https://demo.tradovateapi.com/v1", "demo");
  eq(hostFor("live"), "https://live.tradovateapi.com/v1", "live");
});
await test("needsRenewal honours the 5-minute margin", () => {
  const now = Date.parse("2025-01-02T15:00:00Z");
  ok(needsRenewal(null, now), "null -> renew");
  ok(needsRenewal("not-a-date", now), "bad date -> renew");
  ok(needsRenewal("2025-01-02T15:04:00Z", now), "inside margin -> renew");
  ok(!needsRenewal("2025-01-02T15:10:00Z", now), "outside margin -> reuse");
  eq(TOKEN_RENEW_MARGIN_MS, 300000, "margin is 5 min");
});

console.log("\n[2] authenticate");
await test("success returns the token (never logged)", async () => {
  const fake = (() =>
    Promise.resolve(jsonResponse({
      accessToken: "tok-123",
      expirationTime: "2025-01-02T16:00:00Z",
      userId: 77,
      name: "demo-user",
    }))) as unknown as typeof fetch;
  const res = await authenticate({
    credentials: { name: "demo-user", password: "pw" },
    environment: "demo",
    limiter: limiter(),
    fetchImpl: fake,
  });
  ok(res.ok, "ok");
  if (res.ok) {
    eq(res.accessToken, "tok-123", "token");
    eq(res.userId, 77, "userId");
  }
});
await test("401 -> invalid_credentials", async () => {
  const fake = (() =>
    Promise.resolve(jsonResponse({ errorText: "Invalid credentials" }, 401))) as unknown as typeof fetch;
  const res = await authenticate({
    credentials: { name: "u", password: "bad" },
    environment: "demo",
    limiter: limiter(),
    fetchImpl: fake,
  });
  ok(!res.ok, "failed");
  if (!res.ok) eq(res.code, "invalid_credentials", "code");
});
await test("403 -> api_disabled", async () => {
  const fake = (() =>
    Promise.resolve(jsonResponse({ errorText: "API access not enabled" }, 403))) as unknown as typeof fetch;
  const res = await authenticate({
    credentials: { name: "u", password: "p" },
    environment: "live",
    limiter: limiter(),
    fetchImpl: fake,
  });
  ok(!res.ok, "failed");
  if (!res.ok) eq(res.code, "api_disabled", "code");
});
await test("no token in body -> unexpected", async () => {
  const fake = (() => Promise.resolve(jsonResponse({ userId: 1 }))) as unknown as typeof fetch;
  const res = await authenticate({
    credentials: { name: "u", password: "p" },
    environment: "demo",
    limiter: limiter(),
    fetchImpl: fake,
  });
  ok(!res.ok, "failed");
  if (!res.ok) eq(res.code, "unexpected", "code");
});

console.log("\n[3] ensureToken reuses a fresh token");
await test("reuses when outside margin", async () => {
  const now = Date.parse("2025-01-02T15:00:00Z");
  let called = 0;
  const fake = (() => {
    called++;
    return Promise.resolve(jsonResponse({ accessToken: "new" }));
  }) as unknown as typeof fetch;
  const res = await ensureToken({
    credentials: { name: "u", password: "p" },
    environment: "demo",
    limiter: limiter(),
    fetchImpl: fake,
    now: () => now,
    stored: { accessToken: "cached", expirationTime: "2025-01-02T16:00:00Z" },
  });
  ok(res.ok, "ok");
  eq(called, 0, "no network call");
  if (res.ok) eq(res.accessToken, "cached", "cached token reused");
});
await test("renews when inside margin", async () => {
  const now = Date.parse("2025-01-02T15:58:00Z");
  let called = 0;
  const fake = (() => {
    called++;
    return Promise.resolve(jsonResponse({
      accessToken: "fresh",
      expirationTime: "2025-01-02T17:00:00Z",
    }));
  }) as unknown as typeof fetch;
  const res = await ensureToken({
    credentials: { name: "u", password: "p" },
    environment: "demo",
    limiter: limiter(),
    fetchImpl: fake,
    now: () => now,
    stored: { accessToken: "cached", expirationTime: "2025-01-02T16:00:00Z" },
  });
  eq(called, 1, "network call made");
  if (res.ok) eq(res.accessToken, "fresh", "fresh token");
});

console.log("\n[4] fill/list normalization and pagination");
await test("normalizeFill maps qty/price/action/commission", () => {
  const f = normalizeFill({
    id: 5,
    orderId: 9,
    contractId: 1,
    accountId: 2,
    timestamp: "2025-01-02T15:30:00.000Z",
    action: "Buy",
    qty: 3,
    price: 123.25,
    commission: 1.5,
    active: true,
  });
  ok(f !== null, "parsed");
  if (f) {
    eq(f.tradovateFillId, 5, "id");
    eq(f.quantity, 3, "qty");
    eq(f.action, "Buy", "action");
    eq(f.price, 123.25, "price");
    eq(f.commission, 1.5, "commission");
  }
});
await test("normalizeFill rejects malformed rows", () => {
  eq(normalizeFill({ id: "x" }), null, "bad id");
  eq(normalizeFill(null), null, "null");
});
await test("normalizeTimestamp treats naive as UTC", () => {
  eq(normalizeTimestamp("2025-01-02T15:30:00"), "2025-01-02T15:30:00.000Z", "naive");
  eq(normalizeTimestamp("2025-01-02T15:30:00Z"), "2025-01-02T15:30:00.000Z", "Z");
});
await test("pagination walks until a short page", async () => {
  const pages: number[][] = [
    Array.from({ length: 2 }, (_, i) => i + 1),
    [3],
  ];
  let call = 0;
  const fake = ((_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    const page = pages[call++] ?? [];
    // Simulate server filtering by sinceId.
    const rows = page
      .filter((id) => id > body.sinceId)
      .map((id) => ({ id, qty: 1, price: 100, action: "Buy", timestamp: "2025-01-02T15:30:00Z", contractId: 1, accountId: 1 }));
    return Promise.resolve(jsonResponse(rows));
  }) as unknown as typeof fetch;
  const res = await fillList({
    environment: "demo",
    accessToken: "t",
    limiter: limiter(),
    fetchImpl: fake,
    sinceId: 0,
    limit: 2,
  });
  eq(res.fills.map((f) => f.tradovateFillId), [1, 2, 3], "all fills, sorted");
  eq(res.nextSinceId, 3, "cursor advanced");
});
await test("duplicate ids across pages are collapsed", async () => {
  let call = 0;
  const fake = ((_url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    call++;
    const rows = call === 1
      ? [{ id: 1 }, { id: 2 }]
      : [{ id: 2 }];
    return Promise.resolve(jsonResponse(
      rows.filter((r) => r.id > body.sinceId).map((r) => ({
        ...r, qty: 1, price: 100, action: "Buy", timestamp: "2025-01-02T15:30:00Z", contractId: 1, accountId: 1,
      })),
    ));
  }) as unknown as typeof fetch;
  const res = await fillList({
    environment: "demo",
    accessToken: "t",
    limiter: limiter(),
    fetchImpl: fake,
    sinceId: 0,
    limit: 2,
  });
  eq(res.fills.map((f) => f.tradovateFillId), [1, 2], "deduped");
});

console.log("\n[5] AES-256-GCM credential envelope");
await test("round-trips credentials", async () => {
  const secret = "test-key-0123456789";
  const parts = await encryptCredentials(
    { name: "demo-user", password: "s3cret", cid: "cid1", sec: "sec1" },
    secret,
  );
  ok(parts.ciphertext.length > 0 && parts.iv.length > 0 && parts.authTag.length > 0, "all parts present");
  const back = await decryptCredentials(parts, secret);
  eq(back, { name: "demo-user", password: "s3cret", cid: "cid1", sec: "sec1" }, "round trip");
});
await test("wrong key fails", async () => {
  const parts = await encryptCredentials({ name: "u", password: "p" }, "key-a");
  let threw = false;
  try {
    await decryptCredentials(parts, "key-b");
  } catch {
    threw = true;
  }
  ok(threw, "decryption rejected");
});
await test("tampered ciphertext fails (GCM auth)", async () => {
  const secret = "key-a";
  const parts = await encryptCredentials({ name: "u", password: "p" }, secret);
  const tampered = { ...parts, ciphertext: parts.ciphertext.slice(0, -2) + (parts.ciphertext.endsWith("A") ? "BB" : "AA") };
  let threw = false;
  try {
    await decryptCredentials(tampered, secret);
  } catch {
    threw = true;
  }
  ok(threw, "tamper detected");
});
await test("redact removes secrets from a log string", () => {
  const s = redact({ password: "hunter2", accessToken: "tok-abc", header: "Bearer xyz.123" });
  ok(!s.includes("hunter2"), "password gone");
  ok(!s.includes("tok-abc"), "token gone");
  ok(!s.includes("xyz.123"), "bearer gone");
});

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
