// ============================================================================
// activation-submit-tests — the account-activation submit path.
//
// Run: deno run -A supabase/functions/_test/activation-submit-tests.ts
//
// Exercises the pure validation + config + rate-limit logic and asserts the
// security wiring in the activation-submit / activation-config Edge Functions:
// the user comes from the JWT, the firm comes from server config, no broker
// password/CID/secret field exists anywhere, the receipt goes to a PRIVATE
// bucket, and nothing calls Tradovate.
// ============================================================================

import {
  configuredFirmIds,
  isConfiguredFirm,
  parsePriceCents,
  resolveActivationConfig,
  sanitizeAffiliateUrl,
} from "../_shared/activation/config.ts";
import {
  ACTIVATION_FIELD_LIMITS,
  buildReceiptPath,
  extensionOf,
  isValidEmail,
  RECEIPT_MAX_BYTES,
  validateActivationPayload,
  validateReceiptFile,
} from "../_shared/activation/limits.ts";
import { createRateLimiter } from "../_shared/activation/rateLimit.ts";
import { isOpenStatus } from "../_shared/activation/status.ts";

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
console.log("\n[1] Firm configuration: only firms with a valid affiliate URL appear");
check("no url -> no firm", resolveActivationConfig({}).firms.length === 0);
check(
  "empty url -> no firm",
  resolveActivationConfig({ AFFILIATE_TRADEIFY_URL: "   " }).firms.length === 0,
);
check(
  "non-http url -> no firm",
  resolveActivationConfig({ AFFILIATE_TRADEIFY_URL: "javascript:alert(1)" }).firms.length === 0,
);
check(
  "garbage url -> no firm",
  resolveActivationConfig({ AFFILIATE_TRADEIFY_URL: "not a url" }).firms.length === 0,
);
const both = resolveActivationConfig({
  AFFILIATE_TRADEIFY_URL: "https://tradeify.example/ref",
  AFFILIATE_LUCID_URL: "https://lucid.example/ref",
});
check("two valid urls -> two firms", both.firms.length === 2);
check("firm ids are stable", configuredFirmIds(both).join(",") === "tradeify,lucid");
check("isConfiguredFirm true for tradeify", isConfiguredFirm(both, "tradeify"));
check("isConfiguredFirm false for an unknown firm", isConfiguredFirm(both, "ftmo") === false);
check("isConfiguredFirm false for a non-string", isConfiguredFirm(both, 42) === false);
check("http (not https) is accepted by the sanitizer", sanitizeAffiliateUrl("http://x.example/a") === "http://x.example/a");

// ---------------------------------------------------------------------------
console.log("\n[2] ACTIVATION_FLOW_ENABLED default ON, only exact \"false\" disables");
check("unset -> enabled", resolveActivationConfig({}).enabled === true);
check("empty -> enabled", resolveActivationConfig({ ACTIVATION_FLOW_ENABLED: "" }).enabled === true);
check("\"true\" -> enabled", resolveActivationConfig({ ACTIVATION_FLOW_ENABLED: "true" }).enabled === true);
check("\"FALSE\" -> enabled (case-sensitive)", resolveActivationConfig({ ACTIVATION_FLOW_ENABLED: "FALSE" }).enabled === true);
check("\"false\" -> disabled", resolveActivationConfig({ ACTIVATION_FLOW_ENABLED: "false" }).enabled === false);

// ---------------------------------------------------------------------------
console.log("\n[3] Signals plan price parsing");
check("unset -> 0", parsePriceCents(undefined) === 0);
check("non-numeric -> 0", parsePriceCents("abc") === 0);
check("zero -> 0", parsePriceCents("0") === 0);
check("negative -> 0", parsePriceCents("-100") === 0);
check("valid -> number", parsePriceCents("9900") === 9900);
check("currency defaults to USD", resolveActivationConfig({}).plan.currency === "USD");
check(
  "currency is upper-cased",
  resolveActivationConfig({ SIGNALS_PLAN_CURRENCY: "eur" }).plan.currency === "EUR",
);

// ---------------------------------------------------------------------------
console.log("\n[4] Payload validation (server-side, firm from config)");
const firmAllowed = (id: unknown) => id === "tradeify";
const good = {
  firmId: "tradeify",
  planName: "50K Evaluation",
  accountLogin: "ABC-12345",
  purchaseEmail: "buyer@example.com",
  note: "  hello  ",
  confirmedOwnership: "true",
  confirmedResponsibility: "true",
  confirmedFirmRules: "true",
  confirmedRisk: "true",
};
const okRes = validateActivationPayload(good, firmAllowed);
check("valid payload accepted", okRes.ok === true);
check("note is trimmed", okRes.value?.note === "hello");
check(
  "firm not configured is rejected",
  validateActivationPayload({ ...good, firmId: "ftmo" }, firmAllowed).error === "firm_not_configured",
);
check(
  "missing plan is rejected",
  validateActivationPayload({ ...good, planName: "  " }, firmAllowed).error === "missing_plan_name",
);
check(
  "missing account login is rejected",
  validateActivationPayload({ ...good, accountLogin: "" }, firmAllowed).error === "missing_account_login",
);
check(
  "invalid purchase email is rejected",
  validateActivationPayload({ ...good, purchaseEmail: "nope" }, firmAllowed).error === "invalid_purchase_email",
);
check(
  "missing confirmation is rejected",
  validateActivationPayload({ ...good, confirmedRisk: "false" }, firmAllowed).error === "confirmations_required",
);
check(
  "boolean true confirmation is accepted",
  validateActivationPayload({ ...good, confirmedRisk: true }, firmAllowed).ok === true,
);
check(
  "plan name is capped",
  (validateActivationPayload(
    { ...good, planName: "x".repeat(500) },
    firmAllowed,
  ).value?.planName.length ?? 0) === ACTIVATION_FIELD_LIMITS.planName,
);

// ---------------------------------------------------------------------------
console.log("\n[5] Email validation");
check("valid email", isValidEmail("a@b.co"));
check("no-at rejected", isValidEmail("ab.co") === false);
check("no-domain rejected", isValidEmail("a@b") === false);
check("non-string rejected", isValidEmail(123) === false);

// ---------------------------------------------------------------------------
console.log("\n[6] Receipt upload validation (type + size)");
check("missing file rejected", validateReceiptFile(null).error === "missing_file");
check(
  "empty file rejected",
  validateReceiptFile({ name: "a.png", type: "image/png", size: 0 }).error === "empty_file",
);
check(
  "oversize rejected",
  validateReceiptFile({ name: "a.pdf", type: "application/pdf", size: RECEIPT_MAX_BYTES + 1 }).error === "too_large",
);
check(
  "wrong mime rejected",
  validateReceiptFile({ name: "a.exe", type: "application/x-msdownload", size: 100 }).error === "bad_type",
);
check(
  "wrong extension rejected",
  validateReceiptFile({ name: "a.svg", type: "image/svg+xml", size: 100 }).error === "bad_type",
);
check(
  "svg by extension rejected when mime absent",
  validateReceiptFile({ name: "a.svg", type: null, size: 100 }).error === "bad_extension",
);
check(
  "valid png accepted",
  validateReceiptFile({ name: "receipt.PNG", type: "image/png", size: 100 }).ok === true,
);
check(
  "valid pdf accepted",
  validateReceiptFile({ name: "receipt.pdf", type: "application/pdf", size: 100 }).ok === true,
);
check(
  "absent mime falls back to a valid extension",
  validateReceiptFile({ name: "receipt.jpg", type: null, size: 100 }).ok === true,
);

// ---------------------------------------------------------------------------
console.log("\n[7] Receipt object path is non-guessable and user-scoped");
const path = buildReceiptPath("user-1", "my screenshot.png", "11111111-2222-3333-4444-555555555555");
check("first segment is the user id (storage RLS key)", path.split("/")[0] === "user-1");
check("filename is the supplied uuid, not the original name", path.includes("11111111-2222-3333-4444-555555555555"));
check("original name is not leaked into the path", !path.includes("my screenshot"));
check("extension is preserved", path.endsWith(".png"));
check("unknown extension falls back to .bin", buildReceiptPath("u", "x.txt", "id").endsWith(".bin"));
check("extensionOf is lower-cased", extensionOf("A.PDF") === ".pdf");

// ---------------------------------------------------------------------------
console.log("\n[8] Per-instance rate limiter");
let clock = 0;
const rl = createRateLimiter({ windowMs: 1000, max: 3, now: () => clock });
check("1st hit under limit", rl.hit("u") === false);
check("2nd hit under limit", rl.hit("u") === false);
check("3rd hit under limit", rl.hit("u") === false);
check("4th hit over limit", rl.hit("u") === true);
clock = 1001;
check("window slides", rl.hit("u") === false);
check("independent keys", rl.hit("other") === false);

// ---------------------------------------------------------------------------
console.log("\n[9] Wiring: activation-submit");
const submit = read("supabase/functions/activation-submit/index.ts");
check("derives the user from the JWT (requireUser)", submit.includes("requireUser(req)"));
check("never reads a body user_id", !/body\.(user_?id)|form\.get\(\s*["']user_?id["']/.test(submit));
check("rejects an unconfigured firm (isConfiguredFirm)", submit.includes("isConfiguredFirm("));
check("validates the receipt server-side", submit.includes("validateReceiptFile("));
check("uploads to the PRIVATE bucket", submit.includes('"activation-receipts"'));
check("stores only the object path, never a public URL", !submit.includes("getPublicUrl"));
check("no broker password/cid/secret field is read", !/password|cid|secret/i.test(submit.replace(/\/\/[^\n]*/g, "")));
check("honours the runtime kill switch (503)", /!config\.enabled[\s\S]{0,120}503/.test(submit));
check("rate-limits per ip and per user", submit.includes("`ip:${ip}`") && submit.includes("`user:${ctx.user.id}`"));
check("refuses a duplicate while a decision is pending", submit.includes("isOpenStatus(") && submit.includes("already_pending"));
check("notifies the owner through the shared module", submit.includes("notifyOwnerInBackground("));
check(
  "makes no Tradovate API call (only the shared JWT helper is reused)",
  !/restService|authService|tradovateapi|tradovate-connect|tradovate-data/.test(submit),
);

console.log("\n[10] Wiring: activation-config is public and leak-free");
const configFn = read("supabase/functions/activation-config/index.ts");
check("GET only", configFn.includes('req.method !== "GET"'));
check("uses the server-side config resolver", configFn.includes("activationConfigFromEnv()"));
check("returns firms + plan only", configFn.includes("firms:") && configFn.includes("plan:"));
check("no secret is read", !/SERVICE_ROLE|RESEND|TRADOVATE_APP_SECRET|ENCRYPTION_KEY/.test(configFn));

// ---------------------------------------------------------------------------
console.log("\n[11] Wiring: ACTIVATION_FLOW_ENABLED is a registered switch");
const features = read("supabase/functions/_shared/features.ts");
check("features.ts declares the flag", features.includes("ACTIVATION_FLOW_ENABLED"));
check("features.ts exposes the reader", features.includes("isActivationFlowEnabled"));
check("open-status helper is shared with the state machine", isOpenStatus("pending") && isOpenStatus("in_review") && !isOpenStatus("approved"));

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
