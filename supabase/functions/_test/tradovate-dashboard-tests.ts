// ============================================================================
// tradovate-dashboard-tests — the in-dashboard connect flow (no gate).
//
// These are real, file-reading assertions (not mocks): they pin the behaviour
// the product decision depends on, so a future change cannot silently
// reintroduce a blocking redirect or drop the empty state.
//
// Run: deno run -A supabase/functions/_test/tradovate-dashboard-tests.ts
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

console.log("\n[1] Login goes straight to the dashboard — no guard, no redirect");
const app = read("src/App.tsx");
test("dashboard route renders Dashboard directly", /<Route path="\/dashboard"[\s\S]{0,80}?<Dashboard \/>/.test(app));
test("no ProtectedRoute import or usage", !/ProtectedRoute/.test(app));
test("no /connect-tradovate redirect route", !/connect-tradovate/.test(app));
test("router guard module removed", !exists("src/components/ProtectedRoute.tsx"));
test("client gate flag removed", !exists("src/lib/tradovateFlag.ts"));
test("server gate flag removed", !exists("supabase/functions/_shared/tradovate/flag.ts"));
test("blocking gate page removed", !exists("src/pages/ConnectTradovate.tsx"));
test(
  "no REQUIRE_TRADOVATE_CONNECTION flag",
  !/REQUIRE_TRADOVATE_CONNECTION/.test(app) &&
    !exists("src/lib/tradovateFlag.ts") &&
    !exists("supabase/functions/_shared/tradovate/flag.ts"),
);

console.log("\n[2] Empty state + connect CTA live in the dashboard view");
const trades = read("src/components/TradovateTrades.tsx");
test("empty state is gated on !connection.connected", /!connection\.connected/.test(trades));
test("empty state shows the connect CTA", trades.includes("tradovate.connectCta"));
test("connect button opens the panel", /setPanelOpen\(true\)/.test(trades));
test("view renders the connect panel", trades.includes("<TradovateConnectPanel"));

console.log("\n[3] Panel is username/password, DEMO ONLY, no OAuth");
const panel = read("src/components/TradovateConnectPanel.tsx");
test("panel posts to tradovate-connect", panel.includes('functionsUrl("tradovate-connect")'));
test("panel has NO demo/live selector",
  !/setEnvironment\(/.test(panel) && !/\["demo",\s*"live"\]/.test(panel));
test("panel always sends environment demo", /environment:\s*"demo"/.test(panel));
test("panel has no manual account id input", !/accountId[^:]*<\s*Input/.test(panel));
test("panel preselects and confirms an account",
  panel.includes("preselectAccountId") && panel.includes("connectTradovate.confirmAccount"));
test("panel has a password field", /type=\{showPassword \? "text" : "password"\}/.test(panel));
test("no OAuth / redirect sign-in flow", !/oauth|signInWithOAuth/i.test(panel));
test("password is cleared after success", /setPassword\(""\)/.test(panel));
test("password is cleared when the panel closes", /if \(!open\) \{[\s\S]*setPassword\(""\)/.test(panel));
test("password never touches web storage", !/localStorage[\s\S]{0,80}password/i.test(panel));
test("password never console-logged", !/console\.[a-z]+\([^)]*password/i.test(panel));

console.log("\n[4] Disconnect deletes credentials and is reachable from the panel");
const store = read("supabase/functions/_shared/tradovate/credentialStore.ts");
test("panel calls tradovate-disconnect", panel.includes('functionsUrl("tradovate-disconnect")'));
test(
  "disconnect deletes the credential row",
  /from\(["']integration_credentials["']\)[\s\S]{0,120}\.delete\(\)/.test(store),
);
test("disconnect revokes the integration", /status:\s*["']revoked["']/.test(store));

console.log("\n[5] i18n: every new string exists in all 11 locales");
const i18n = read("src/i18n.ts");
const LOCALES = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"];
const NEW_KEYS = [
  "manageConnection",
  "emptyTitle",
  "emptyBody",
  "connectCta",
  "emptyHint",
  "advancedToggle",
  "advancedHint",
];
for (const loc of LOCALES) {
  const start = i18n.indexOf(`const ${loc}Translation = `);
  const end = loc === "he" ? i18n.length : i18n.indexOf("const ", start + 10) === -1 ? i18n.length : i18n.indexOf("const ", start + 10);
  const block = i18n.slice(start, end);
  test(`${loc}: has all new tradovate keys`, NEW_KEYS.every((k) => new RegExp(`\\b${k}:`).test(block)));
  // The skip link now lives in the `welcome` namespace (first-run soft gate).
  // The tradovate namespace must still have no skip key.
  const tradSeg = block.slice(block.indexOf("tradovate: {"), block.indexOf("welcome: {"));
  test(`${loc}: welcome has a skip key`, /\bskip:/.test(block.slice(block.indexOf("welcome: {"))));
  test(`${loc}: no skip key in the tradovate namespace`, !/\bskip:/.test(tradSeg));
}

console.log("\n[6] App cid/sec resolution: client override, else server secret");
const { resolveAppCredentials } = await import(
  "../_shared/tradovate/appCredentials.ts"
);
test("client-supplied cid/sec wins (advanced override)", () => {
  const r = resolveAppCredentials("u-cid", "u-sec", (k) =>
    k === "TRADOVATE_APP_CID" ? "srv-cid" : k === "TRADOVATE_APP_SECRET" ? "srv-sec" : undefined
  );
  return r.cid === "u-cid" && r.sec === "u-sec" && r.source === "client";
});
test("falls back to server secrets when client omits them", () => {
  const r = resolveAppCredentials(undefined, undefined, (k) =>
    k === "TRADOVATE_APP_CID" ? "srv-cid" : k === "TRADOVATE_APP_SECRET" ? "srv-sec" : undefined
  );
  return r.cid === "srv-cid" && r.sec === "srv-sec" && r.source === "server";
});
test("no cid/sec anywhere resolves to none (API decides)", () => {
  const r = resolveAppCredentials(undefined, undefined, () => undefined);
  return r.cid === undefined && r.sec === undefined && r.source === "none";
});
test("appId/appVersion default to Braxel when unset", () => {
  const r = resolveAppCredentials("c", "s", () => undefined);
  return r.appId === "Braxel" && !!r.appVersion;
});

console.log("\n[7] Dashboard renders the Tradovate card first; KYC never blocks");
const dash = read("src/pages/Dashboard.tsx");
const banner = read("src/components/KycReminderBanner.tsx");
const card = read("src/components/TradovateConnectCard.tsx");
test("Tradovate card is the first element in the services view",
  dash.indexOf("<TradovateConnectCard />") < dash.indexOf("<KycReminderBanner"));
test("card renders exactly once", (dash.match(/<TradovateConnectCard \/>/g) || []).length === 1);
test("dashboard never gates on kycStatus === 'approved' for entry",
  !/kycStatus\s*!==\s*'approved'\s*\?\s*\(/.test(dash) || dash.includes("WithdrawalKycGate"));
test("card uses the localized log-in CTA", card.includes("tradovate.connectCta"));
test("banner shows the optional (withdrawal-only) title, never 'required'",
  banner.includes("dashboard.kyc.optionalTitle") && !banner.includes("dashboard.kyc.required"));
test("banner headline is not the gating phrase", !/VERIFICATION REQUIRED/i.test(banner));

console.log("\n[8] The CTA reads 'Log in on Tradovate' in every locale");
for (const loc of LOCALES) {
  const start = i18n.indexOf(`const ${loc}Translation = `);
  const block = i18n.slice(start, start + 4000);
  const m = block.match(/connectCta: "([^"]*)"/);
  test(`${loc}: connectCta is a log-in label`, !!m && /log ?in|entrar|accedi|iniciar sesión|connecter|anmelden|войти|登录|ログイン|دخول|התחבר/i.test(m[1]));
}

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
