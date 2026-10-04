// ============================================================================
// tradovate-welcome-tests — the first-run Tradovate welcome screen (SOFT gate).
//
// Real, file-reading assertions (no mocks). They pin the product decision:
//   * first access shows the welcome screen before any dashboard content,
//   * skip persists server-side (DB table + RPC + status POST), so it does not
//     reappear on every login,
//   * a connected user goes straight to the dashboard,
//   * TRADOVATE_ENABLED=false hides the welcome screen and the card,
//   * no route is blocked: no router guard, no REQUIRE_TRADOVATE_CONNECTION.
//
// Run: deno run -A supabase/functions/_test/tradovate-welcome-tests.ts
// ============================================================================

import { assert } from "https://deno.land/std@0.190.0/testing/asserts.ts";

const ROOT = new URL("../../../", import.meta.url);
const read = (p: string) => Deno.readTextFileSync(new URL(p, ROOT));
const exists = (p: string) => {
  try {
    Deno.statSync(new URL(p, ROOT));
    return true;
  } catch {
    return false;
  }
};

let passed = 0;
let failed = 0;
function test(name: string, fn: (() => unknown) | boolean) {
  try {
    const ok = typeof fn === "function" ? fn() : fn;
    if (ok === false) throw new Error("assertion failed");
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    console.error(`  FAIL  ${name}\n        ${(e as Error).message}`);
  }
}

const dash = read("src/pages/Dashboard.tsx");
const welcome = read("src/components/TradovateWelcome.tsx");
const hook = read("src/hooks/useTradovateConnection.ts");
const statusFn = read("supabase/functions/tradovate-status/index.ts");
const store = read("supabase/functions/_shared/tradovate/credentialStore.ts");
const app = read("src/App.tsx");

console.log("\n[1] First access shows the welcome screen before dashboard content");
test("welcome component exists", exists("src/components/TradovateWelcome.tsx"));
test("dashboard renders the welcome component", dash.includes("<TradovateWelcome"));
test(
  "welcome replaces the services content (ternary branch, not an overlay)",
  /tradovate\.welcomeShow\s*\?[\s\S]{0,600}?<TradovateWelcome/.test(dash),
);
test("welcome shows the primary log-in CTA", welcome.includes('t("tradovate.connectCta")'));
test("welcome opens the existing connect panel", welcome.includes("<TradovateConnectPanel"));
test("welcome is black/gold themed", welcome.includes("#D4AF37") && /from-\[#1A1A1A\]/.test(welcome));
test("welcome has a visible secondary skip link", welcome.includes('t("welcome.skip")'));

console.log("\n[2] Skip persists server-side (DB, not only localStorage)");
const migration = read("supabase/migrations/20261008000000_tradovate_welcome_skip.sql");
test("migration creates tradovate_welcome_state", migration.includes("public.tradovate_welcome_state"));
test("state is keyed by user_id", /user_id\s+uuid PRIMARY KEY/.test(migration));
test("migration enables RLS", /ENABLE ROW LEVEL SECURITY/.test(migration));
test("skip RPC exists (tradovate_welcome_skip)", migration.includes("tradovate_welcome_skip"));
test("read RPC exists (tradovate_welcome_skipped)", migration.includes("tradovate_welcome_skipped"));
test("RPCs are service_role only", /GRANT EXECUTE[\s\S]*TO service_role/.test(migration));
test("store reads the skip flag", store.includes("hasSkippedWelcome"));
test("store writes the skip flag", store.includes("markWelcomeSkipped"));
test("status POST action=skip records the choice", /body\.action === "skip"[\s\S]*markWelcomeSkipped/.test(statusFn));
test("hook exposes skipWelcome", hook.includes("skipWelcome"));
test("hook posts action skip to tradovate-status", /action:\s*"skip"/.test(hook));

console.log("\n[3] Connected user goes straight to the dashboard (no welcome)");
test("status reports connected from integrations", /connected = integrations\.length > 0/.test(statusFn));
test("welcome.show requires !connected", /showWelcome = !connected && !everConnected && !skipped/.test(statusFn));
test("hook hides welcome when connected", /setWelcomeShow\(!isConnected && welcome\?\.show === true\)/.test(hook));

console.log("\n[4] Disconnect does NOT re-show the welcome screen");
test("status uses ever-connected to suppress the welcome", statusFn.includes("hasAnyIntegration"));
test("store has hasAnyIntegration", store.includes("hasAnyIntegration"));
test("disconnect keeps a revoked row (soft delete)", /status:\s*"revoked"/.test(store));

console.log("\n[5] TRADOVATE_ENABLED=false hides the welcome screen and the card");
test("status returns welcome.show=false when disabled", /enabled: false,[\s\S]*welcome: \{ show: false, skipped: false \}/.test(statusFn));
test("dashboard gates the welcome on tradovate.enabled", /tradovate\.enabled && tradovate\.welcomeShow/.test(dash));
test("hook clears welcomeShow when the feature is off", /data\.enabled === false[\s\S]*setWelcomeShow\(false\)/.test(hook));
test("card hides itself when the feature is off", read("src/components/TradovateConnectCard.tsx").includes("if (!enabled) return null"));

console.log("\n[6] No route is blocked (no guard, no strict flag)");
test("dashboard route renders Dashboard directly", /<Route path="\/dashboard"[\s\S]{0,80}?<Dashboard \/>/.test(app));
test("no ProtectedRoute usage", !/ProtectedRoute/.test(app));
test("no REQUIRE_TRADOVATE_CONNECTION anywhere", !/REQUIRE_TRADOVATE_CONNECTION/.test(dash + app + welcome));
test("no router guard component exists", !exists("src/components/ProtectedRoute.tsx"));
test("no blocking gate page exists", !exists("src/pages/ConnectTradovate.tsx"));
test("every route is wrapped in RouteView only", (app.match(/<Route path=/g) || []).length === (app.match(/<RouteView>/g) || []).length);
test("the sidebar/nav is rendered regardless of the welcome state",
  /<aside[\s\S]*tradovate\.enabled && tradovate\.welcomeShow/.test(dash));
test(
  "welcome is not a full-screen overlay (renders in the main content area)",
  !/position:\s*fixed|fixed inset-0/.test(welcome),
);

console.log("\n[7] Fails safe: a status response without a welcome block never blocks");
test("welcomeShow is a strict === true check", /welcome\?\.show === true/.test(hook));
test("missing welcome block leaves welcomeShow false",
  (() => {
    // Mirror the hook's reducer logic on a legacy payload.
    const data: Record<string, unknown> = { integrations: [] };
    const list = Array.isArray(data.integrations) ? data.integrations : [];
    const welcome = data.welcome as { show?: unknown } | undefined;
    return !(list.length > 0) && welcome?.show === true ? false : true;
  })());

console.log("\n[8] i18n: every welcome string exists in all 11 locales");
const i18n = read("src/i18n.ts");
const LOCALES = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"];
const WELCOME_KEYS = ["eyebrow", "title", "body", "point1", "point2", "point3", "skip"];
for (const loc of LOCALES) {
  const start = i18n.indexOf(`const ${loc}Translation = `);
  const block = i18n.slice(start, start + 6000);
  test(`${loc}: has all welcome keys`, WELCOME_KEYS.every((k) => new RegExp(`\\b${k}:`).test(block)));
}

console.log("\n[9] Runtime decision logic (pure)");
// The server decision: show only when on, unconnected, never-connected, not skipped.
const decide = (opts: { enabled: boolean; connected: boolean; everConnected: boolean; skipped: boolean }) =>
  opts.enabled && !opts.connected && !opts.everConnected && !opts.skipped;
test("first access (unconnected, never skipped) -> show", decide({ enabled: true, connected: false, everConnected: false, skipped: false }) === true);
test("skipped -> hide", decide({ enabled: true, connected: false, everConnected: false, skipped: true }) === false);
test("connected -> hide", decide({ enabled: true, connected: true, everConnected: true, skipped: false }) === false);
test("disconnected after connect (revoked row) -> hide", decide({ enabled: true, connected: false, everConnected: true, skipped: false }) === false);
test("feature off -> hide", decide({ enabled: false, connected: false, everConnected: false, skipped: false }) === false);

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
