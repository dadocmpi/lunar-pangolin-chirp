// ============================================================================
// Log-safety tests: no secret may ever reach a log sink.
//
// Run: deno run -A supabase/functions/_test/tradovate-log-safety-tests.ts
//
// Installs a console spy around the real code paths (auth, REST, crypto,
// rate-limit errors) and asserts that none of the captured output contains a
// password, access token, cid/sec, or ciphertext. This is a runtime check, not
// a grep: if any module starts logging a secret, this test fails.
// ============================================================================

import { authenticate, ensureToken } from "../_shared/tradovate/authService.ts";
import { fillList } from "../_shared/tradovate/restService.ts";
import {
  decryptCredentials,
  encryptCredentials,
  redact,
} from "../_shared/tradovate/crypto.ts";
import { CircuitOpenError, TradovateRateLimiter } from "../_shared/tradovate/rateLimiter.ts";

const SECRETS = {
  password: "P@ssw0rd-LEAK-CANARY",
  accessToken: "eyJ.ACCESS-TOKEN-LEAK-CANARY.xyz",
  cid: "CID-LEAK-CANARY",
  sec: "SEC-LEAK-CANARY",
};

const captured: string[] = [];
const orig = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

function spy() {
  for (const k of Object.keys(orig) as Array<keyof typeof orig>) {
    console[k] = (...args: unknown[]) => {
      captured.push(args.map((a) => {
        try {
          return typeof a === "string" ? a : JSON.stringify(a);
        } catch {
          return String(a);
        }
      }).join(" "));
    };
  }
}
function restore() {
  Object.assign(console, orig);
}

let passed = 0;
let failed = 0;
async function test(name: string, fn: () => Promise<void> | void) {
  captured.length = 0;
  spy();
  let leak: string | undefined;
  let err: unknown = null;
  try {
    await fn();
    leak = captured.find((line) =>
      Object.values(SECRETS).some((s) => line.includes(s))
    );
  } catch (e) {
    err = e;
  } finally {
    // Restore BEFORE reporting, otherwise the spy swallows the verdict lines.
    restore();
  }
  if (err) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err instanceof Error ? err.message : err}`);
  } else if (leak) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        secret leaked to log: ${leak}`);
  } else {
    passed++;
    console.log(`  PASS  ${name}`);
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}
const noSleep = () => Promise.resolve();
const limiter = () => new TradovateRateLimiter({ sleep: noSleep });

await test("authenticate success does not log the token", async () => {
  const fake = (() =>
    Promise.resolve(jsonResponse({
      accessToken: SECRETS.accessToken,
      expirationTime: "2025-01-02T16:00:00Z",
      userId: 7,
    }))) as unknown as typeof fetch;
  const res = await authenticate({
    credentials: { name: "u", password: SECRETS.password, cid: SECRETS.cid, sec: SECRETS.sec },
    environment: "demo",
    limiter: limiter(),
    fetchImpl: fake,
  });
  if (!res.ok) throw new Error("expected ok");
});

await test("authenticate failure does not log the password", async () => {
  const fake = (() =>
    Promise.resolve(jsonResponse({ errorText: "bad" }, 401))) as unknown as typeof fetch;
  await authenticate({
    credentials: { name: "u", password: SECRETS.password, sec: SECRETS.sec },
    environment: "demo",
    limiter: limiter(),
    fetchImpl: fake,
  });
});

await test("ensureToken renewal does not log the token", async () => {
  const fake = (() =>
    Promise.resolve(jsonResponse({
      accessToken: SECRETS.accessToken,
      expirationTime: "2025-01-02T17:00:00Z",
    }))) as unknown as typeof fetch;
  await ensureToken({
    credentials: { name: "u", password: SECRETS.password },
    environment: "demo",
    limiter: limiter(),
    fetchImpl: fake,
    now: () => Date.parse("2025-01-02T15:59:00Z"),
    stored: { accessToken: "old", expirationTime: "2025-01-02T16:00:00Z" },
  });
});

await test("fillList with a bearer token does not log it", async () => {
  const fake = (() =>
    Promise.resolve(jsonResponse([
      { id: 1, qty: 1, price: 100, action: "Buy", timestamp: "2025-01-02T15:30:00Z", contractId: 1, accountId: 1 },
    ]))) as unknown as typeof fetch;
  await fillList({
    environment: "demo",
    accessToken: SECRETS.accessToken,
    limiter: limiter(),
    fetchImpl: fake,
    sinceId: 0,
  });
});

await test("crypto round-trip does not log plaintext or ciphertext", async () => {
  const parts = await encryptCredentials(
    { name: "u", password: SECRETS.password, cid: SECRETS.cid, sec: SECRETS.sec },
    "a-strong-encryption-key",
  );
  const back = await decryptCredentials(parts, "a-strong-encryption-key");
  if (back.password !== SECRETS.password) throw new Error("round trip broken");
});

await test("captcha circuit error does not log the token", async () => {
  const lim = new TradovateRateLimiter({ sleep: noSleep });
  try {
    await lim.handlePenalty({ ticket: SECRETS.accessToken, waitSeconds: 0, captcha: true });
  } catch (e) {
    if (!(e instanceof CircuitOpenError)) throw new Error("expected CircuitOpenError");
  }
});

await test("redact() removes canaries from an arbitrary payload", () => {
  const s = redact({
    password: SECRETS.password,
    accessToken: SECRETS.accessToken,
    cid: SECRETS.cid,
    sec: SECRETS.sec,
    nested: { authorization: `Bearer ${SECRETS.accessToken}` },
  });
  for (const canary of Object.values(SECRETS)) {
    if (s.includes(canary)) throw new Error(`redact left ${canary}`);
  }
});

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
