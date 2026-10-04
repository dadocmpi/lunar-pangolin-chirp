// ============================================================================
// Rate-limit handling unit tests (no network, no real sleeping).
//
// Run: deno run -A supabase/functions/_test/tradovate-rate-limit-tests.ts
//
// Covers: rolling-window limiter, plain 429 exponential backoff, the
// {p-ticket,p-time} wait-and-resend contract, the {p-captcha} ~1h circuit
// breaker, and the same handling inside requestJson via an injected fetch.
// ============================================================================

import {
  CircuitOpenError,
  parseTimePenalty,
  TradovateRateLimiter,
} from "../_shared/tradovate/rateLimiter.ts";
import { requestJson } from "../_shared/tradovate/http.ts";

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
function ok(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}
function close(a: number, b: number, msg: string, eps = 1e-9) {
  if (Math.abs(a - b) > eps) throw new Error(`${msg}: expected ${b}, got ${a}`);
}

/** Fake clock + sleep that records requested waits without waiting. */
function fakeClock() {
  let now = 1_000_000;
  const waits: number[] = [];
  return {
    now: () => now,
    sleep: (ms: number) => {
      waits.push(ms);
      now += Math.max(0, ms);
      return Promise.resolve();
    },
    advance: (ms: number) => {
      now += ms;
    },
    waits,
  };
}

console.log("\n[1] parseTimePenalty");
await test("parses p-ticket / p-time / p-captcha", () => {
  eq(parseTimePenalty({ "p-ticket": "abc", "p-time": 30 }), { ticket: "abc", waitSeconds: 30, captcha: false }, "ticket+time");
  eq(parseTimePenalty({ "p-captcha": true }), { ticket: null, waitSeconds: 0, captcha: true }, "captcha");
  eq(parseTimePenalty({ error: "x" }), null, "not a penalty");
  eq(parseTimePenalty(null), null, "null body");
});

console.log("\n[2] Rolling-window limiter");
await test("second window forces a wait", async () => {
  const clock = fakeClock();
  const lim = new TradovateRateLimiter({
    requestsPerSecond: 2,
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    sleep: clock.sleep,
    now: clock.now,
    random: () => 0,
  });
  await lim.waitForSlot();
  await lim.waitForSlot();
  await lim.waitForSlot(); // must wait ~1s for the first slot to age out
  ok(clock.waits.length === 1, "one wait occurred");
  close(clock.waits[0], 1000, "waited one second");
});
await test("circuit closed allows work", () => {
  const lim = new TradovateRateLimiter();
  ok(lim.isCircuitOpen() === false, "closed");
  lim.assertCircuitClosed();
});

console.log("\n[3] Plain 429 backoff");
await test("exponential growth with zero jitter", async () => {
  const clock = fakeClock();
  const lim = new TradovateRateLimiter({
    baseBackoffMs: 500,
    maxBackoffMs: 30_000,
    sleep: clock.sleep,
    now: clock.now,
    random: () => 0,
  });
  close(await lim.backoffFor429(), 500, "1st");
  close(await lim.backoffFor429(), 1000, "2nd");
  close(await lim.backoffFor429(), 2000, "3rd");
});
await test("sustained 429 opens the circuit", async () => {
  const clock = fakeClock();
  const lim = new TradovateRateLimiter({
    baseBackoffMs: 1,
    rateLimitCircuitMs: 60_000,
    sleep: clock.sleep,
    now: clock.now,
    random: () => 0,
  });
  for (let i = 0; i < 5; i++) await lim.backoffFor429();
  ok(lim.isCircuitOpen(), "circuit open after 5 x 429");
});

console.log("\n[4] p-time / p-ticket");
await test("waits p-time and returns the ticket", async () => {
  const clock = fakeClock();
  const lim = new TradovateRateLimiter({ sleep: clock.sleep, now: clock.now });
  const ticket = await lim.handlePenalty({ ticket: "T1", waitSeconds: 30, captcha: false });
  eq(ticket, "T1", "ticket returned");
  close(clock.waits[0], 30_000, "waited p-time");
});

console.log("\n[5] p-captcha circuit breaker (~1h)");
await test("opens circuit for 1h and throws", async () => {
  const clock = fakeClock();
  const lim = new TradovateRateLimiter({ captchaCircuitMs: 3_600_000, sleep: clock.sleep, now: clock.now });
  let threw = false;
  try {
    await lim.handlePenalty({ ticket: null, waitSeconds: 0, captcha: true });
  } catch (e) {
    threw = e instanceof CircuitOpenError;
    close((e as CircuitOpenError).retryAfterMs, 3_600_000, "retryAfter");
  }
  ok(threw, "CircuitOpenError thrown");
  ok(lim.isCircuitOpen(), "circuit open");
  clock.advance(3_600_001);
  ok(lim.isCircuitOpen() === false, "circuit closes after 1h");
});

console.log("\n[6] requestJson integration");
await test("429 with p-ticket is resent with the ticket attached", async () => {
  const clock = fakeClock();
  const lim = new TradovateRateLimiter({ sleep: clock.sleep, now: clock.now, random: () => 0 });
  const bodies: Array<Record<string, unknown> | undefined> = [];
  let call = 0;
  const fakeFetch = ((_url: string, init: RequestInit) => {
    bodies.push(init.body ? JSON.parse(String(init.body)) : undefined);
    call++;
    if (call === 1) {
      return Promise.resolve(new Response(JSON.stringify({ "p-ticket": "TK", "p-time": 5 }), { status: 429 }));
    }
    return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  }) as unknown as typeof fetch;

  const res = await requestJson<{ ok: boolean }>({
    url: "https://demo.tradovateapi.com/v1/fill/list",
    limiter: lim,
    fetchImpl: fakeFetch,
    body: { sinceId: 0 },
  });
  eq(res.ok, true, "succeeded on retry");
  eq(bodies.length, 2, "two attempts");
  eq(bodies[1]?.["p-ticket"], "TK", "ticket echoed in body");
  close(clock.waits[0], 5000, "waited p-time");
});
await test("plain 429 retries then succeeds", async () => {
  const clock = fakeClock();
  const lim = new TradovateRateLimiter({ baseBackoffMs: 100, sleep: clock.sleep, now: clock.now, random: () => 0 });
  let call = 0;
  const fakeFetch = (() => {
    call++;
    return Promise.resolve(
      call < 3
        ? new Response("{}", { status: 429 })
        : new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
  }) as unknown as typeof fetch;
  const res = await requestJson<{ ok: boolean }>({
    url: "https://demo.tradovateapi.com/v1/account/list",
    limiter: lim,
    fetchImpl: fakeFetch,
    body: {},
  });
  eq(res.ok, true, "succeeded");
  eq(call, 3, "three attempts");
});
await test("p-captcha aborts with CircuitOpenError", async () => {
  const clock = fakeClock();
  const lim = new TradovateRateLimiter({ captchaCircuitMs: 3_600_000, sleep: clock.sleep, now: clock.now });
  const fakeFetch = (() =>
    Promise.resolve(new Response(JSON.stringify({ "p-captcha": true }), { status: 429 }))) as unknown as typeof fetch;
  let threw = false;
  try {
    await requestJson({
      url: "https://demo.tradovateapi.com/v1/auth/accesstokenrequest",
      limiter: lim,
      fetchImpl: fakeFetch,
      body: {},
    });
  } catch (e) {
    threw = e instanceof CircuitOpenError;
  }
  ok(threw, "CircuitOpenError");
  ok(lim.isCircuitOpen(), "circuit open");
});

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
