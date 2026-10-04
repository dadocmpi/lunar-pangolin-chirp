// ============================================================================
// tradovate connect-error classification tests (no network, no DB).
//
// Run: deno run -A supabase/functions/_test/tradovate-connect-error-tests.ts
//
// Proves the four (plus) cases the connect panel must distinguish, and that
// the user's internet is never blamed unless the browser is actually offline.
// ============================================================================

import {
  classifyConnectError,
  type ConnectErrorCode,
} from "../../../src/lib/tradovateConnectError.ts";

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
  if (a !== b) throw new Error(`${msg}: expected ${b}, got ${a}`);
}

console.log("\n[1] Our own service is unavailable (not Tradovate, not the user)");
await test("fetch threw while online -> service_unavailable", () => {
  eq(
    classifyConnectError({ networkError: true, online: true }),
    "service_unavailable" as ConnectErrorCode,
    "online network failure",
  );
});
await test("HTTP 404 (function not deployed) -> service_unavailable", () => {
  eq(classifyConnectError({ status: 404, online: true }), "service_unavailable", "404");
});
await test("HTTP 500 -> service_unavailable", () => {
  eq(classifyConnectError({ status: 500, online: true }), "service_unavailable", "500");
});
await test("HTTP 502 -> service_unavailable", () => {
  eq(classifyConnectError({ status: 502, online: true }), "service_unavailable", "502");
});
await test("HTTP 503 -> service_unavailable", () => {
  eq(classifyConnectError({ status: 503, online: true }), "service_unavailable", "503");
});
await test("timeout is a network error -> service_unavailable", () => {
  eq(classifyConnectError({ networkError: true, online: true }), "service_unavailable", "timeout");
});

console.log("\n[2] Offline is the ONLY case that blames the user's internet");
await test("fetch threw while offline -> offline", () => {
  eq(classifyConnectError({ networkError: true, online: false }), "offline", "offline");
});
await test("network failure while online is NOT offline", () => {
  if (classifyConnectError({ networkError: true, online: true }) === "offline") {
    throw new Error("must not blame the user's internet when navigator.onLine is true");
  }
});

console.log("\n[3] Tradovate rejected the credentials");
await test("server code invalid_credentials -> invalid_credentials", () => {
  eq(classifyConnectError({ status: 422, serverCode: "invalid_credentials", online: true }), "invalid_credentials", "invalid_credentials");
});

console.log("\n[4] Tradovate unreachable / rate limited");
await test("server code transport -> tradovate_unreachable", () => {
  eq(classifyConnectError({ status: 422, serverCode: "transport", online: true }), "tradovate_unreachable", "transport");
});
await test("server code rate_limited -> rate_limited (p-ticket)", () => {
  eq(classifyConnectError({ status: 422, serverCode: "rate_limited", online: true }), "rate_limited", "rate_limited");
});
await test("server code circuit_open -> circuit_open (p-captcha)", () => {
  eq(classifyConnectError({ status: 422, serverCode: "circuit_open", online: true }), "circuit_open", "circuit_open");
});

console.log("\n[5] Account without API access");
await test("server code api_disabled -> api_disabled", () => {
  eq(classifyConnectError({ status: 422, serverCode: "api_disabled", online: true }), "api_disabled", "api_disabled");
});

console.log("\n[6] Session and unknown failures stay accurate");
await test("HTTP 401 -> session_expired (Braxel session, not Tradovate)", () => {
  eq(classifyConnectError({ status: 401, online: true }), "session_expired", "401");
});
await test("HTTP 403 -> session_expired", () => {
  eq(classifyConnectError({ status: 403, online: true }), "session_expired", "403");
});
await test("unknown body -> unexpected", () => {
  eq(classifyConnectError({ status: 422, serverCode: "something_new", online: true }), "unexpected", "unknown");
});

console.log(
  `\nResult: ${passed} passed, ${failed} failed.`,
);
if (failed > 0) Deno.exit(1);
