// ============================================================================
// traderspost-onboarding-tests — the TradersPost execution-tool onboarding,
// the pilot capacity / waitlist, and the customer's strategy confirmation.
//
// Run: deno run -A supabase/functions/_test/traderspost-onboarding-tests.ts
//
// Exercises the pure config/capacity logic and asserts the security wiring in
// activation-strategy-confirm / activation-submit / activation-config:
//   * the share URL is configuration, never hard-coded;
//   * capacity is a positive limit that turns on the waitlist, 0 = unlimited;
//   * the user always comes from the JWT, never from the body;
//   * no broker credential is ever read or stored;
//   * nothing calls Tradovate.
// ============================================================================

import {
  isAtCapacity,
  parseMaxActive,
  resolveActivationConfig,
} from "../_shared/activation/config.ts";

const ROOT = new URL("../../../", import.meta.url);
const read = (p: string) => Deno.readTextFileSync(new URL(p, ROOT));

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean) {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}`);
  }
}

// ---------------------------------------------------------------------------
console.log("\n[1] TradersPost share URL is configuration, validated like an affiliate link");
check("unset -> null", resolveActivationConfig({}).tradersPostShareUrl === null);
check("blank -> null", resolveActivationConfig({ TRADERSPOST_STRATEGY_SHARE_URL: "  " }).tradersPostShareUrl === null);
check(
  "non-http -> null",
  resolveActivationConfig({ TRADERSPOST_STRATEGY_SHARE_URL: "javascript:alert(1)" }).tradersPostShareUrl === null,
);
check(
  "https is kept",
  resolveActivationConfig({ TRADERSPOST_STRATEGY_SHARE_URL: "https://traderspost.io/strategy/abc" })
    .tradersPostShareUrl === "https://traderspost.io/strategy/abc",
);

// ---------------------------------------------------------------------------
console.log("\n[2] ACTIVATION_MAX_ACTIVE parsing and capacity rule");
check("unset -> 0 (unlimited)", parseMaxActive(undefined) === 0);
check("blank -> 0", parseMaxActive("") === 0);
check("negative -> 0", parseMaxActive("-5") === 0);
check("zero -> 0", parseMaxActive("0") === 0);
check("garbage -> 0", parseMaxActive("abc") === 0);
check("positive kept", parseMaxActive("25") === 25);

check("0 capacity is never full", isAtCapacity(0, 999) === false);
check("below limit is not full", isAtCapacity(10, 9) === false);
check("at limit is full", isAtCapacity(10, 10) === true);
check("over limit is full", isAtCapacity(10, 11) === true);
check("NaN capacity is never full", isAtCapacity(Number.NaN, 5) === false);

// ---------------------------------------------------------------------------
console.log("\n[3] Wiring: activation-strategy-confirm");
const confirm = read("supabase/functions/activation-strategy-confirm/index.ts");
check("derives the user from the JWT (requireUser)", confirm.includes("requireUser(req)"));
check("never reads a body user_id", !/body\.(user_?id)|form\.get\(\s*["']user_?id["']/.test(confirm));
check("scopes the lookup to the JWT user", confirm.includes('.eq("user_id", ctx.user.id)'));
check("requires an APPROVED activation", /status !== "approved"[\s\S]{0,80}403/.test(confirm));
check("is idempotent (keeps the first confirmation)", confirm.includes("alreadyConfirmed") && confirm.includes("strategy_confirmed_at"));
check("writes the confirmation via the service role", confirm.includes("strategy_confirmed_at: now"));
check("appends to the append-only audit log", confirm.includes('from("payment_audit_log")'));
check("uses the activation audit source", confirm.includes('source: "activation"'));
check("honours the runtime kill switch (503)", /!config\.enabled[\s\S]{0,120}503/.test(confirm));
check("rate-limits per ip and per user", confirm.includes("`ip:${ip}`") && confirm.includes("`user:${ctx.user.id}`"));
check(
  "no broker credential field is read",
  !/password|cid|secret|account_password/i.test(confirm.replace(/\/\/[^\n]*/g, "")),
);
check(
  "makes no Tradovate API call",
  !/restService|authService|tradovateapi|tradovate-connect|tradovate-data/.test(confirm),
);

// ---------------------------------------------------------------------------
console.log("\n[4] Wiring: activation-submit enforces the pilot capacity");
const submit = read("supabase/functions/activation-submit/index.ts");
check("checks capacity only when a limit is set", submit.includes("config.maxActive > 0"));
check("counts APPROVED activations", /\.eq\("status", "approved"\)/.test(submit));
check("returns the waitlist signal (409)", /isAtCapacity\([\s\S]{0,120}waitlist[\s\S]{0,60}409/.test(submit));
check("fails soft on a count error (count ?? 0)", submit.includes("count ?? 0"));
check("still imports the shared capacity helper", submit.includes("isAtCapacity("));

// ---------------------------------------------------------------------------
console.log("\n[5] Wiring: activation-config exposes the public onboarding data");
const configFn = read("supabase/functions/activation-config/index.ts");
check("uses the server-side config resolver", configFn.includes("activationConfigFromEnv()"));
check("returns the TradersPost share URL", configFn.includes("tradersPost:") && configFn.includes("shareUrl:"));
check("returns the waitlist state", configFn.includes("waitlist:") && configFn.includes("enabled: atCapacity"));
check("counts approved activations for the waitlist", /\.eq\("status", "approved"\)/.test(configFn));
check("skips the DB read when unlimited", configFn.includes("config.maxActive > 0 ? await countActive()"));
check("no secret is read", !/RESEND|TRADOVATE_APP_SECRET|ENCRYPTION_KEY/.test(configFn));

// ---------------------------------------------------------------------------
console.log("\n[6] Wiring: the client mirrors the server rules");
const clientConfig = read("src/lib/activationConfig.ts");
check("client resolves the share URL safely", clientConfig.includes("tradersPostShareUrl: safeUrl("));
check("client fails open on a malformed waitlist payload", clientConfig.includes("waitlistEnabled: waitlist.enabled === true"));
check("empty default has no share URL", clientConfig.includes("tradersPostShareUrl: null"));
const strategyConfirm = read("src/lib/strategyConfirm.ts");
check("confirm helper calls activation-strategy-confirm", strategyConfirm.includes('functionsUrl("activation-strategy-confirm")'));
check("confirm helper sends no user id", !/user_?id/i.test(strategyConfirm));
const checklist = read("src/components/PlanActiveChecklist.tsx");
check("checklist renders the share link from config", checklist.includes("config.tradersPostShareUrl"));
check("checklist opens the link in a new tab safely", checklist.includes('target="_blank"') && checklist.includes("noopener noreferrer"));
check("checklist records the confirmation", checklist.includes("confirmStrategySubscription("));
const view = read("src/components/ActivateAccountView.tsx");
check("activation view shows the waitlist when full", view.includes("config.waitlistEnabled") && view.includes("waitlistTitle"));
check("activation view maps the waitlist 409", view.includes('json?.error === "waitlist"'));

// ---------------------------------------------------------------------------
console.log("\n[7] The migration is additive and credential-free");
const migration = read("supabase/migrations/20261012000000_traderspost_onboarding.sql");
check("adds strategy_confirmed_at", migration.includes("strategy_confirmed_at"));
check("adds strategy_confirmed_by", migration.includes("strategy_confirmed_by"));
check("uses IF NOT EXISTS (idempotent)", migration.includes("ADD COLUMN IF NOT EXISTS"));
check("does not drop or rewrite a column", !/DROP COLUMN/i.test(migration));
check("widens the audit source constraint", migration.includes("payment_audit_log_source_repair_check") && migration.includes("'activation'"));
check("has no credential column", !/password|cid|secret/i.test(migration.replace(/--[^\n]*/g, "")));

// ---------------------------------------------------------------------------
console.log("\n[8] The i18n keys exist in every locale");
const i18n = read("src/i18n.ts");
const localeCount = (i18n.match(/const \w+Translation = \{/g) ?? []).length;
check("11 locale objects are present", localeCount === 11);
for (const key of [
  '"waitlistTitle":',
  '"waitlistBody":',
  '"waitlistNotice":',
  '"traderspostTitle":',
  '"traderspostBody":',
  '"traderspostSubscribe":',
  '"traderspostConfirm":',
  '"traderspostConfirmed":',
  '"traderspostConfirmError":',
  '"waitlist":',
]) {
  const count = (i18n.match(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
  check(`${key} in all 11 locales`, count === 11);
}

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
