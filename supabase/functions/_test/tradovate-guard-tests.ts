// ============================================================================
// Connect-gate routing unit tests (no DOM).
//
// Run: deno run -A supabase/functions/_test/tradovate-guard-tests.ts
//
// Proves the direct-URL bypass is blocked when REQUIRE_TRADOVATE_CONNECTION
// is ON, that a connected user skips the gate, and that the operator can turn
// the gate off entirely.
// ============================================================================

import {
  CONNECT_GATE_PATH,
  DASHBOARD_PATH,
  postGatePath,
  postLoginPath,
  shouldBlockDashboard,
} from "../../../src/lib/tradovate/guard.ts";

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

const g = (over: Partial<{ loading: boolean; required: boolean; connected: boolean }>) => ({
  loading: false,
  required: true,
  connected: false,
  ...over,
});

console.log("\n[1] Direct-URL bypass is blocked (flag ON)");
test("unconnected user hitting /dashboard is blocked", () => {
  eq(shouldBlockDashboard(g({ connected: false })), true, "blocked");
});
test("blocked user is redirected to the gate, not the dashboard", () => {
  eq(postGatePath(g({ connected: false }), DASHBOARD_PATH), CONNECT_GATE_PATH, "gate");
});
test("while loading the dashboard is blocked too (no flash)", () => {
  eq(shouldBlockDashboard(g({ loading: true, connected: true })), true, "blocked during load");
});

console.log("\n[2] Returning user with a valid connection skips the gate");
test("connected user reaches the dashboard", () => {
  eq(shouldBlockDashboard(g({ connected: true })), false, "not blocked");
  eq(postLoginPath(g({ connected: true }), DASHBOARD_PATH), DASHBOARD_PATH, "straight to dashboard");
});
test("connected user is not bounced back to the gate", () => {
  eq(postGatePath(g({ connected: true })), DASHBOARD_PATH, "dashboard");
});

console.log("\n[3] Post-login routing");
test("unconnected user is sent to the gate after login", () => {
  eq(postLoginPath(g({ connected: false })), CONNECT_GATE_PATH, "gate");
});
test("requested deep link is preserved once connected", () => {
  eq(postLoginPath(g({ connected: true }), "/settings"), "/settings", "from honoured");
});

console.log("\n[4] Operator disables the gate (flag OFF)");
test("nothing is blocked when not required", () => {
  eq(shouldBlockDashboard(g({ required: false, connected: false })), false, "not blocked");
  eq(postLoginPath(g({ required: false, connected: false })), DASHBOARD_PATH, "dashboard");
});

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
