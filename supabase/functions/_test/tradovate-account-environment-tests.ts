// ============================================================================
// tradovate-account-environment-tests — demo-only enforcement + account
// auto-selection + disabled-vs-unavailable messaging.
//
// Run: deno run -A supabase/functions/_test/tradovate-account-environment-tests.ts
//
// Pure unit tests (no network, no DB, no secrets) plus file-reading assertions
// that pin the wiring in the connect function and the panel.
// ============================================================================

import {
  allowedEnvironments,
  parseAllowedEnvironments,
  resolveRequestedEnvironment,
} from "../_shared/tradovate/environment.ts";
import { selectAccount } from "../_shared/tradovate/accountSelection.ts";
import { classifyConnectError } from "../../../src/lib/tradovateConnectError.ts";

const ROOT = new URL("../../../", import.meta.url);
const read = (p: string) => Deno.readTextFileSync(new URL(p, ROOT));

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
function eq<T>(a: T, b: T, m: string) {
  if (a !== b) throw new Error(`${m}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}
function ok(c: boolean, m: string) {
  if (!c) throw new Error(m);
}

// ============================================================================
console.log("\n[1] Server-side environment policy is demo-only by default");
await test("unset -> [demo]", () => {
  eq(parseAllowedEnvironments(undefined).join(","), "demo", "unset");
});
await test("empty string -> [demo]", () => {
  eq(parseAllowedEnvironments("").join(","), "demo", "empty");
});
await test('"demo" -> [demo]', () => {
  eq(parseAllowedEnvironments("demo").join(","), "demo", "demo");
});
await test('"demo,live" re-enables live with no code change', () => {
  eq(parseAllowedEnvironments("demo,live").join(","), "demo,live", "both");
});
await test("unknown tokens are ignored, never widened", () => {
  eq(parseAllowedEnvironments("staging,prod").join(","), "demo", "unknown -> default");
  eq(parseAllowedEnvironments("demo,staging").join(","), "demo", "known kept");
});
await test("allowedEnvironments reads the secret", () => {
  eq(allowedEnvironments((k) => k === "TRADOVATE_ALLOWED_ENVIRONMENTS" ? "demo,live" : undefined).join(","), "demo,live", "read");
});

console.log("\n[2] A crafted live request is rejected when the setting is demo");
await test("live rejected when TRADOVATE_ALLOWED_ENVIRONMENTS is demo", () => {
  const d = resolveRequestedEnvironment("live", (k) => k === "TRADOVATE_ALLOWED_ENVIRONMENTS" ? "demo" : undefined);
  ok(!d.ok, "must reject");
  if (!d.ok) eq(d.code, "environment_not_allowed", "code");
});
await test("live rejected when the secret is UNSET (default demo)", () => {
  const d = resolveRequestedEnvironment("live", () => undefined);
  ok(!d.ok, "must reject");
  if (!d.ok) eq(d.code, "environment_not_allowed", "code");
});
await test("live accepted when the secret is demo,live", () => {
  const d = resolveRequestedEnvironment("live", (k) => k === "TRADOVATE_ALLOWED_ENVIRONMENTS" ? "demo,live" : undefined);
  ok(d.ok, "must allow");
  if (d.ok) eq(d.environment, "live", "environment");
});
await test("demo accepted by default", () => {
  const d = resolveRequestedEnvironment("demo", () => undefined);
  ok(d.ok, "must allow demo");
  if (d.ok) eq(d.environment, "demo", "environment");
});
await test("a non-environment value is invalid_environment", () => {
  for (const bad of [undefined, null, "", "DEMO", 42, {}, "staging"]) {
    const d = resolveRequestedEnvironment(bad, () => undefined);
    ok(!d.ok, `must reject ${JSON.stringify(bad)}`);
    if (!d.ok) eq(d.code, "invalid_environment", "code");
  }
});

// ============================================================================
console.log("\n[3] Account auto-selection");
const acct = (id: number, active?: boolean) => ({ id, name: `A${id}`, userId: 1, active });

await test("exactly one account is chosen automatically", () => {
  const s = selectAccount([acct(1001, true)], null);
  eq(s.kind, "chosen", "kind");
  if (s.kind === "chosen") eq(s.account.id, 1001, "id");
});
await test("several accounts: first ACTIVE is preselected, choice required", () => {
  const s = selectAccount([acct(1, false), acct(2, true), acct(3, true)], null);
  eq(s.kind, "required", "kind");
  if (s.kind === "required") eq(s.preselectAccountId, 2, "first active");
});
await test("several accounts with no active one -> no_active", () => {
  const s = selectAccount([acct(1, false), acct(2, false)], null);
  eq(s.kind, "no_active", "kind");
});
await test("no accounts -> no_accounts", () => {
  eq(selectAccount([], null).kind, "no_accounts", "kind");
});
await test("explicit id belonging to the login is honoured", () => {
  const s = selectAccount([acct(1, true), acct(2, true)], 2);
  eq(s.kind, "chosen", "kind");
  if (s.kind === "chosen") eq(s.account.id, 2, "id");
});
await test("explicit id NOT belonging to the login -> not_available", () => {
  eq(selectAccount([acct(1, true)], 999).kind, "not_available", "kind");
});
await test("explicit non-numeric id -> invalid_account", () => {
  eq(selectAccount([acct(1, true)], Number("x")).kind, "invalid_account", "kind");
});
await test("single inactive account is still chosen (user asked, none active)", () => {
  // One account is unambiguous; active-ness only matters when choosing among many.
  const s = selectAccount([acct(1, false)], null);
  eq(s.kind, "chosen", "kind");
});

// ============================================================================
console.log("\n[4] Disabled is not \"broken\"");
await test("503 feature_disabled -> not_enabled", () => {
  eq(classifyConnectError({ status: 503, serverCode: "feature_disabled", online: true }), "not_enabled", "disabled");
});
await test("404 (function not deployed) -> service_unavailable", () => {
  eq(classifyConnectError({ status: 404, online: true }), "service_unavailable", "404");
});
await test("500 -> service_unavailable", () => {
  eq(classifyConnectError({ status: 500, online: true }), "service_unavailable", "500");
});
await test("503 without feature_disabled -> service_unavailable", () => {
  eq(classifyConnectError({ status: 503, online: true }), "service_unavailable", "503 plain");
});
await test("timeout (network error, online) -> service_unavailable", () => {
  eq(classifyConnectError({ networkError: true, online: true }), "service_unavailable", "timeout");
});
await test("disabled and unavailable are DIFFERENT codes", () => {
  const disabled = classifyConnectError({ status: 503, serverCode: "feature_disabled", online: true });
  const unavailable = classifyConnectError({ status: 503, online: true });
  ok(disabled !== unavailable, "must differ");
});
await test("accounts_unavailable -> accounts_unavailable", () => {
  eq(classifyConnectError({ status: 502, serverCode: "accounts_unavailable", online: true }), "accounts_unavailable", "accounts");
});
await test("no_accounts -> no_accounts", () => {
  eq(classifyConnectError({ status: 422, serverCode: "no_accounts", online: true }), "no_accounts", "no_accounts");
});
await test("no_active_account -> no_active_account", () => {
  eq(classifyConnectError({ status: 422, serverCode: "no_active_account", online: true }), "no_active_account", "no_active");
});
await test("environment_not_allowed -> environment_not_allowed", () => {
  eq(classifyConnectError({ status: 422, serverCode: "environment_not_allowed", online: true }), "environment_not_allowed", "env");
});

// ============================================================================
console.log("\n[5] Wiring: server enforces the policy, panel offers demo only");
const connect = read("supabase/functions/tradovate-connect/index.ts");
const panel = read("src/components/TradovateConnectPanel.tsx");
await test("connect resolves the environment server-side", () => {
  ok(connect.includes("resolveRequestedEnvironment("), "must call the policy");
});
await test("connect rejects a disallowed environment (422)", () => {
  ok(/envDecision\.ok[\s\S]{0,400}422/.test(connect), "must 422");
});
await test("connect uses the pure account selector", () => {
  ok(connect.includes("selectAccount(accounts, requestedAccountId)"), "selector");
});
await test("connect never asks for a typed account id (no manual input path)", () => {
  // The only accountId source is the server-provided selection.
  ok(!/accountId\s*:\s*Number\(prompt/i.test(connect), "no prompt");
});
await test("panel has NO demo/live selector", () => {
  ok(!/setEnvironment\(/.test(panel), "no setEnvironment");
  ok(!/\["demo",\s*"live"\]/.test(panel), "no env toggle array");
});
await test("panel always sends environment demo", () => {
  ok(/environment:\s*"demo"/.test(panel), "demo literal");
});
await test("panel has no manual account id input", () => {
  ok(!/accountId[^:]*<\s*Input/.test(panel), "no account id Input");
});
await test("panel preselects and confirms an account", () => {
  ok(panel.includes("preselectAccountId"), "preselect");
  ok(panel.includes("connectTradovate.confirmAccount"), "confirm");
});

// ============================================================================
console.log("\n[6] i18n: the disabled and unavailable messages exist in all locales");
const i18n = read("src/i18n.ts");
const LOCALES = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"];
for (const loc of LOCALES) {
  const start = i18n.indexOf(`const ${loc}Translation = `);
  const block = i18n.slice(start, start + 9000);
  await test(`${loc}: has not_enabled + service_unavailable + account codes`, () => {
    for (const k of [
      "not_enabledTitle",
      "not_enabled:",
      "service_unavailableTitle",
      "service_unavailable:",
      "accounts_unavailableTitle",
      "no_accountsTitle",
      "no_active_accountTitle",
      "environment_not_allowedTitle",
      "demoOnlyNotice",
      "confirmAccount",
      "accountActive",
      "accountInactive",
    ]) {
      ok(new RegExp(`\\b${k.replace(":", "")}:`).test(block), `missing ${k} in ${loc}`);
    }
  });
}

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
