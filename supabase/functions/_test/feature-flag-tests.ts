// ============================================================================
// feature-flag-tests — the runtime kill switches.
//
// Run: deno run -A supabase/functions/_test/feature-flag-tests.ts
//
// These exercise the pure switch logic and assert the wiring in each Edge
// Function, so a future refactor cannot drop a kill switch silently.
// ============================================================================

import {
  featureDisabledBody,
  flagEnabled,
  isAiKycEnabled,
  isTradovateEnabled,
  isWithdrawalKycGateEnabled,
} from "../_shared/features.ts";

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

console.log("\n[1] flagEnabled: default ON, only exact \"false\" turns it off");
check("undefined -> true", flagEnabled(undefined));
check("empty string -> true", flagEnabled(""));
check("\"true\" -> true", flagEnabled("true"));
check("\"1\" -> true (only exact false disables)", flagEnabled("1"));
check("\"FALSE\" -> true (case-sensitive)", flagEnabled("FALSE"));
check("\"false\" -> false", flagEnabled("false") === false);

console.log("\n[2] Each feature reads its own switch, independently");
check("tradovate default on", isTradovateEnabled({}));
check("tradovate off", isTradovateEnabled({ TRADOVATE_ENABLED: "false" }) === false);
check("ai default on", isAiKycEnabled({}));
check("ai off", isAiKycEnabled({ AI_KYC_ENABLED: "false" }) === false);
check("withdrawal gate default on", isWithdrawalKycGateEnabled({}));
check(
  "withdrawal gate off",
  isWithdrawalKycGateEnabled({ WITHDRAWAL_KYC_GATE_ENABLED: "false" }) === false,
);
check(
  "switches are independent (tradovate off, ai on)",
  isTradovateEnabled({ TRADOVATE_ENABLED: "false" }) === false &&
    isAiKycEnabled({ TRADOVATE_ENABLED: "false" }) === true,
);

console.log("\n[3] Disabled body is canonical and leak-free");
const body = featureDisabledBody("tradovate");
check("has error=feature_disabled", body.error === "feature_disabled");
check("names the feature", body.feature === "tradovate");
check("no secret-ish keys", !/key|token|password|secret/i.test(JSON.stringify(body)));

console.log("\n[4] Wiring: every Tradovate endpoint honours TRADOVATE_ENABLED");
const connect = read("supabase/functions/tradovate-connect/index.ts");
const data = read("supabase/functions/tradovate-data/index.ts");
const status = read("supabase/functions/tradovate-status/index.ts");
const sync = read("supabase/functions/tradovate-sync/index.ts");
check("connect guards", connect.includes("isTradovateEnabled()"));
check("data guards", data.includes("isTradovateEnabled()"));
check("status reports enabled:false", status.includes("isTradovateEnabled()") && status.includes("enabled: false"));
check("sync guards", sync.includes("isTradovateEnabled()"));
check(
  "connect fails closed with 503",
  /isTradovateEnabled\(\)\) \{[\s\S]{0,120}503/.test(connect),
);

console.log("\n[5] Wiring: AI KYC + withdrawal gate switches");
const submit = read("supabase/functions/kyc-submit/index.ts");
const withdraw = read("supabase/functions/withdrawal-request/index.ts");
check("kyc-submit gates the provider on isAiKycEnabled()", submit.includes("isAiKycEnabled()"));
check(
  "ai off => provider null (fails to manual review)",
  /isAiKycEnabled\(\)\s*\?[\s\S]*?\)\s*:\s*null;/.test(submit),
);
check(
  "withdrawal gate guards and fails closed",
  withdraw.includes("isWithdrawalKycGateEnabled()") &&
    /isWithdrawalKycGateEnabled\(\)\) \{[\s\S]{0,120}503/.test(withdraw),
);

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
