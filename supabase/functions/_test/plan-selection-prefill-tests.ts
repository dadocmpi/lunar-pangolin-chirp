// ============================================================================
// plan-selection-prefill-tests — the authenticated plan → /checkout flow.
//
// Run: deno run -A supabase/functions/_test/plan-selection-prefill-tests.ts
//
// Covers: the four plan selections, profile prefill for every plan, missing
// fields, editing a prefilled field, the unauthenticated login round-trip,
// create-or-reuse application, stable payment idempotency, the single-page
// card/crypto/bank checkout, and all 11 locales.
// ============================================================================

import {
  CHECKOUT_PLAN_KEYS,
  prefillCheckoutCustomer,
  isReusableApplicationStatus,
  resolveCheckoutPlanKey,
  toBillingPayload,
  validateCheckoutCustomer,
} from "../_shared/checkout/logic.ts";
import { PLANS } from "../_shared/plans.ts";
import { sanitizeBilling } from "../_shared/profile/billing.ts";
import { PLAN_PRICING } from "../../../src/lib/plans.ts";

const ROOT = new URL("../../../", import.meta.url);
const read = (p: string) => Deno.readTextFileSync(new URL(p, ROOT));

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}
function section(name: string) {
  console.log(`\n${name}`);
}

const fullProfile = {
  first_name: "Maria",
  last_name: "Silva",
  full_name: "Maria Silva",
  phone_country_code: "+55",
  phone: "11912345678",
  country: "BR",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  city: "São Paulo",
  state: "SP",
  postal_code: "01310-100",
};

// ---------------------------------------------------------------------------
section("[1] Selecting Starter / Professional / Business / Enterprise");
for (const key of CHECKOUT_PLAN_KEYS) {
  check(`state preserves ${key}`, resolveCheckoutPlanKey({ statePlan: { id: key } }) === key);
  check(`query preserves ${key}`, resolveCheckoutPlanKey({ queryPlan: key }) === key);
  check(`${key} is canonical on the server`, PLANS[key].id === key);
  check(
    `${key} client price mirrors the server`,
    PLAN_PRICING[key].monthlyUsd * 100 === PLANS[key].priceCents,
  );
}
check(
  "router state wins over the query",
  resolveCheckoutPlanKey({ statePlan: { id: "business" }, queryPlan: "starter" }) === "business",
);
check(
  "plan_key-shaped state is accepted",
  resolveCheckoutPlanKey({ statePlan: { plan_key: "enterprise" } }) === "enterprise",
);
check("unknown plan resolves to null", resolveCheckoutPlanKey({ queryPlan: "free" }) === null);
check("missing plan resolves to null", resolveCheckoutPlanKey({}) === null);
check(
  "an arbitrary object cannot smuggle a price",
  resolveCheckoutPlanKey({ statePlan: { id: "starter", price: 1 } }) === "starter",
);

// ---------------------------------------------------------------------------
section("[2] Profile prefill for every plan");
for (const key of CHECKOUT_PLAN_KEYS) {
  const fields = prefillCheckoutCustomer({
    profile: fullProfile,
    authEmail: "maria@example.com",
  });
  const validation = validateCheckoutCustomer(fields);
  check(`${key}: first name`, fields.firstName === "Maria");
  check(`${key}: last name`, fields.lastName === "Silva");
  check(`${key}: full name`, validation.fullName === "Maria Silva");
  check(`${key}: email`, fields.email === "maria@example.com");
  check(`${key}: dial code`, fields.phoneCountryCode === "+55");
  check(`${key}: phone`, fields.phone === "11912345678");
  check(`${key}: country`, fields.country === "BR");
  check(`${key}: address line 1`, fields.street === "Avenida Paulista");
  check(`${key}: address number`, fields.number === "1000");
  check(`${key}: address line 2`, fields.complement === "Apto 42");
  check(`${key}: city`, fields.city === "São Paulo");
  check(`${key}: state/region`, fields.state === "SP");
  check(`${key}: postal code`, fields.postalCode === "01310-100");
  check(`${key}: prefilled form is valid`, validation.ok);
}

// ---------------------------------------------------------------------------
section("[3] Missing profile fields");
const partial = prefillCheckoutCustomer({
  profile: { first_name: "Maria", country: "BR" },
  authEmail: "maria@example.com",
});
const partialValidation = validateCheckoutCustomer(partial);
check("last name is required", partialValidation.errors.lastName === "required");
check("phone is required", Boolean(partialValidation.errors.phone));
check("address is required", Boolean(partialValidation.errors.street));
check("city is required", partialValidation.errors.city === "required");
check("postal code is required", Boolean(partialValidation.errors.postalCode));
check("email is still prefilled", partial.email === "maria@example.com");
check("partial profile is invalid", !partialValidation.ok);

// ---------------------------------------------------------------------------
section("[4] Editing a prefilled field");
const prefilled = prefillCheckoutCustomer({
  profile: fullProfile,
  authEmail: "maria@example.com",
});
const edited = {
  ...prefilled,
  street: "Rua Nova",
  number: "10",
  city: "Rio de Janeiro",
  state: "RJ",
  postalCode: "20000-000",
  country: "br",
};
const editedValidation = validateCheckoutCustomer(edited);
check("edited form validates", editedValidation.ok);
const billing = toBillingPayload(editedValidation.value, editedValidation.fullName);
check("edited street reaches billing", billing.street === "Rua Nova");
check("edited city reaches billing", billing.city === "Rio de Janeiro");
check("country is uppercased for billing", billing.country === "BR");
const sanitized = sanitizeBilling(billing);
check("server line1 joins street and number", sanitized.line1 === "Rua Nova, 10");
check("server state", sanitized.state === "RJ");
check("server postal code", sanitized.postalCode === "20000-000");

// ---------------------------------------------------------------------------
section("[5] Unauthenticated redirect and return-to-plan");
const checkout = read("src/pages/Checkout.tsx");
check("checkout sends an unauthenticated visitor to /login", checkout.includes('navigate("/login"'));
check(
  "checkout returns the exact plan to login",
  checkout.includes("/checkout?plan=${resolvedPlanKey}"),
);
check("checkout replaces the history entry", checkout.includes("replace: true"));
const login = read("src/pages/Login.tsx");
check("login reads state.from", login.includes("location.state?.from"));
check(
  "login returns to the from path with the plan",
  login.includes("navigate(dest.path, { state: dest.state })"),
);
const pricing = read("src/pages/Pricing.tsx");
check(
  "pricing navigates to /checkout with the plan query",
  pricing.includes("/checkout?plan=${plan.id}"),
);
const legacy = read("src/pages/RegisterApplication.tsx");
check(
  "legacy /register-application redirects to /checkout",
  legacy.includes("<Navigate") && legacy.includes("/checkout?plan=${planKey}"),
);

// ---------------------------------------------------------------------------
section("[6] No duplicate application");
const ensure = read("supabase/functions/application-ensure/index.ts");
check("ensure derives identity from the JWT", ensure.includes("auth.getUser("));
check("ensure scopes every write by user_id", ensure.includes('.eq("user_id", user.id)'));
check(
  "ensure looks up an existing application for the plan",
  ensure.includes('.eq("plan_key", plan.id)'),
);
check("ensure reuses before it inserts", ensure.indexOf("if (reusable)") < ensure.indexOf(".insert("));
check("ensure re-derives the plan server-side", ensure.includes("getPlan(body.planKey)"));
check("ensure requires terms", ensure.includes("terms_required"));
check("ensure requires privacy", ensure.includes("privacy_required"));
check("ensure never accepts a price", !/priceCents|amount_cents|monthlyUsd/.test(ensure));
check("ensure never accepts a currency", !/currency\s*:/.test(ensure));
check("ensure is rate limited", ensure.includes("createRateLimiter("));
check("ensure is JWT-protected", read("supabase/config.toml").includes("[functions.application-ensure]"));
check(
  "checkout caches the ensured application id",
  checkout.includes("ensuredApplicationRef.current = applicationId"),
);
check(
  "checkout calls ensure from the payment path",
  /const applicationId = await ensureApplication\(billing\)/.test(checkout),
);
const loadEffect = checkout.slice(
  checkout.indexOf("useEffect(() => {"),
  checkout.indexOf("// Provider availability"),
);
check("page load never creates an application", !loadEffect.includes('functionsUrl("application-ensure")'));
check(
  "each method keeps one stable idempotency key",
  checkout.includes("if (!keysRef.current[which]) keysRef.current[which] = newIdempotencyKey()"),
);
check("a pending application is reused", isReusableApplicationStatus("pending"));
check("a failed application is reused", isReusableApplicationStatus("failed"));
check("a legacy null status is reused", isReusableApplicationStatus(null));
check("a confirmed application is not reused", !isReusableApplicationStatus("confirmed"));
check("a refunded application is not reused", !isReusableApplicationStatus("refunded"));
check("a disputed application is not reused", !isReusableApplicationStatus("disputed"));
check("a past_due application is not reused", !isReusableApplicationStatus("past_due"));
check(
  "checkout sends the ensured id to every method",
  (checkout.match(/applicationId: prepared\.applicationId/g) ?? []).length === 3,
);
check(
  "checkout sends the server-validated plan key",
  (checkout.match(/planId: prepared\.planKey/g) ?? []).length === 3,
);
check("checkout never sends an amount", !/amountCents\s*:/.test(checkout));
check("checkout sends currency USD", /currency:\s*"USD"/.test(checkout));

// ---------------------------------------------------------------------------
section("[7] Single-page checkout preserved");
check(
  "card, crypto and bank remain",
  ["card", "crypto", "bank"].every((m) => checkout.includes(`"${m}"`)),
);
for (const fn of ["stripe-checkout", "crypto-checkout", "wise-checkout"]) {
  check(`page calls ${fn}`, checkout.includes(`"${fn}"`));
}
check("two-column desktop layout", checkout.includes("lg:grid-cols-12"));
check("consent is required before payment", checkout.includes('t("application.errors.terms_required")'));

// ---------------------------------------------------------------------------
section("[8] All 11 locales");
const LOCALES = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"];
const i18nSource = read("src/i18n.ts");
function extractLocale(code: string): Record<string, unknown> {
  const start = i18nSource.indexOf(`const ${code}Translation = `);
  const braceStart = i18nSource.indexOf("{", start);
  let depth = 0;
  let end = -1;
  let inString = false;
  let quote = "";
  let escaped = false;
  for (let i = braceStart; i < i18nSource.length; i++) {
    const ch = i18nSource[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = true;
      quote = ch;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const literal = i18nSource.slice(braceStart, end + 1);
  return Function(`"use strict"; return (${literal});`)();
}
function flatten(obj: Record<string, unknown>, prefix = "", out: Record<string, string> = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v as Record<string, unknown>, key, out);
    else if (typeof v === "string") out[key] = v;
  }
  return out;
}
const localeMaps = Object.fromEntries(LOCALES.map((l) => [l, flatten(extractLocale(l))]));
const REQUIRED_KEYS = [
  "checkoutPage.consentTitle",
  "plans.starter",
  "plans.professional",
  "plans.business",
  "plans.enterprise",
  "application.terms_accepted",
  "application.privacy_accepted",
  "application.viewTerms",
  "application.viewPrivacy",
  "application.errors.terms_required",
  "application.errors.privacy_required",
];
for (const locale of LOCALES) {
  check(`${locale} has all plan/consent keys`,
    REQUIRED_KEYS.every((key) => (localeMaps[locale][key] ?? "").trim().length > 0),
    REQUIRED_KEYS.filter((key) => !(localeMaps[locale][key] ?? "").trim()).join(", "));
}

// ---------------------------------------------------------------------------
if (failed > 0) {
  console.error(`\nplan selection/prefill tests FAILED (${failed} failure(s), ${passed} passed)`);
  Deno.exit(1);
}
console.log(`\nplan selection/prefill tests passed (${passed} checks)`);
