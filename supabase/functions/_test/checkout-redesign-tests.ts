// ============================================================================
// checkout-redesign-tests — the single-page checkout and payment-method
// orchestration.
//
// Run: deno run -A supabase/functions/_test/checkout-redesign-tests.ts
//
// Covers: profile prefill, missing/edited fields, cross-user isolation,
// address validation, canonical Stripe plan, browser amount/currency
// rejection, success-page and webhook-recovery rules, crypto asset/network
// gating, Wise pending/fake-success rules, duplicate/expired states, the 11
// locales and the responsive/accessibility contract.
// ============================================================================

import {
  composeFullName,
  configuredCryptoNetworks,
  defaultMethod,
  prefillCheckoutCustomer,
  resolveMethodAvailability,
  splitFullName,
  paymentStatusNotice,
  checkoutErrorKey,
  validateCheckoutCustomer,
} from "../_shared/checkout/logic.ts";
import { checkoutConfigFromEnv, type EnvReader } from "../_shared/checkout/config.ts";
import { validateCheckoutInput, PaymentError } from "../_shared/option_a/payments.ts";
import { canTransition, getPlan, PLANS, CRYPTO_NETWORKS } from "../_shared/option_a/plans.ts";
import { validateCheckoutSession } from "../_shared/stripe/sessionValidation.ts";
import { sanitizeBilling } from "../_shared/profile/billing.ts";

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
  full_name: "Maria Silva",
  first_name: "Maria",
  last_name: "Silva",
  phone_country_code: "+55",
  phone: "(11) 91234-5678",
  country: "BR",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  city: "São Paulo",
  state: "SP",
  postal_code: "01310-100",
};

// ---------------------------------------------------------------------------
section("[1] Authenticated profile prefill");
const prefilled = prefillCheckoutCustomer({
  profile: fullProfile,
  application: { email: "maria@example.com" },
  authEmail: "auth@example.com",
  authFullName: "Auth Name",
});
check("first name from profile", prefilled.firstName === "Maria");
check("last name from profile", prefilled.lastName === "Silva");
check("application email preferred over auth email", prefilled.email === "maria@example.com");
check("phone dial code prefilled", prefilled.phoneCountryCode === "+55");
check("address prefilled", prefilled.street === "Avenida Paulista" && prefilled.number === "1000");
check("city/state/postal prefilled", prefilled.city === "São Paulo" && prefilled.state === "SP" && prefilled.postalCode === "01310-100");

const split = splitFullName("Ana Beatriz de Souza");
check("splitFullName keeps first token as first name", split.firstName === "Ana");
check("splitFullName keeps the rest as last name", split.lastName === "Beatriz de Souza");
check("composeFullName round-trips", composeFullName(split.firstName, split.lastName) === "Ana Beatriz de Souza");

const fallbackPrefill = prefillCheckoutCustomer({
  profile: null,
  application: {
    full_name: "John Doe",
    email: "john@example.com",
    country: "US",
    residential_address_line1: "1 Main St",
    city: "Austin",
    region: "TX",
    postal_code: "73301",
  },
  authEmail: "auth@example.com",
});
check("application full_name split when profile is empty", fallbackPrefill.firstName === "John" && fallbackPrefill.lastName === "Doe");
check("application email used", fallbackPrefill.email === "john@example.com");
check("application address used", fallbackPrefill.street === "1 Main St" && fallbackPrefill.city === "Austin");

// ---------------------------------------------------------------------------
section("[2] Missing profile fields");
const emptyPrefill = prefillCheckoutCustomer({ profile: null, authEmail: "new@example.com" });
const emptyValidation = validateCheckoutCustomer(emptyPrefill);
check("empty prefill is invalid", !emptyValidation.ok);
for (const field of [
  "firstName", "lastName", "phoneCountryCode", "phone", "country",
  "street", "number", "city", "state", "postalCode",
] as const) {
  check(`missing ${field} is reported`, Boolean(emptyValidation.errors[field]));
}
check("valid auth email is accepted", !emptyValidation.errors.email);

// ---------------------------------------------------------------------------
section("[3] Edited profile fields");
const edited = { ...prefilled, street: "Rua Nova", city: "Rio de Janeiro", postalCode: "20000-000" };
const editedValidation = validateCheckoutCustomer(edited);
check("edited fields validate", editedValidation.ok, JSON.stringify(editedValidation.errors));
check("edited street is kept", editedValidation.value.street === "Rua Nova");
check("edited city is kept", editedValidation.value.city === "Rio de Janeiro");

const billing = sanitizeBilling({
  firstName: "Maria",
  lastName: "Silva",
  fullName: "Ignored",
  email: "maria@example.com",
  street: "Rua Nova",
  number: "10",
  city: "Rio de Janeiro",
  state: "RJ",
  postalCode: "20000-000",
  country: "br",
});
check("billing name uses first + last", billing.name === "Maria Silva");
check("billing address joins street and number", billing.line1 === "Rua Nova, 10");
check("billing uppercases country", billing.country === "BR");
check("billing never accepts card data", !/card|ccv|cvv/i.test(JSON.stringify(billing)));

// ---------------------------------------------------------------------------
section("[4] Cross-user data isolation");
const checkoutSrc = read("src/pages/Checkout.tsx");
check("application lookup is owner-scoped", checkoutSrc.includes('.eq("user_id", authUser.id)'));
check(
  "checkout never sends a body user_id",
  !/user_id\s*:/.test(checkoutSrc.replace(/user_id\??:\s*string;?/g, "")),
);
const stripeSrc = read("supabase/functions/stripe-checkout/index.ts");
check("stripe-checkout scopes the application by JWT user", stripeSrc.includes('.eq("user_id", user.id)'));
const configSrc = read("supabase/functions/checkout-config/index.ts");
check("checkout-config derives identity from the JWT", configSrc.includes("requireUser(req)"));
check("checkout-config returns no wallet/bank address", !/deposit_address|bank_details/.test(configSrc));
const rls = read("supabase/migrations/20261012000000_secure_profile_and_services_rls.sql");
check("profiles RLS keys on auth.uid()", rls.includes("id = auth.uid()"));

// ---------------------------------------------------------------------------
section("[5] Invalid address");
check("unknown country rejected", validateCheckoutCustomer({ ...edited, country: "ZZ" }).errors.country === "invalid_country");
check("bad postal code rejected", validateCheckoutCustomer({ ...edited, postalCode: "!" }).errors.postalCode === "invalid_postal_code");
check("empty city rejected", validateCheckoutCustomer({ ...edited, city: "" }).errors.city === "required");
check("bad email rejected", validateCheckoutCustomer({ ...edited, email: "nope" }).errors.email === "invalid_email");
check("optional address line 2 can be empty", validateCheckoutCustomer({ ...edited, complement: "" }).ok);

// ---------------------------------------------------------------------------
section("[6] Valid Stripe plan");
check("four canonical plans exist", Object.keys(PLANS).length === 4);
check("starter price is canonical", getPlan("starter").priceCents === 200_00);
check("professional price is canonical", getPlan("professional").priceCents === 350_00);
check("business price is canonical", getPlan("business").priceCents === 600_00);
check("enterprise price is canonical", getPlan("enterprise").priceCents === 820_00);
check("stripe-checkout re-derives the plan server-side", /getPlan\(planKey\)/.test(stripeSrc));
check("stripe-checkout uses the canonical amount", stripeSrc.includes("amount_cents: canonicalPlan.priceCents"));
check("stripe-checkout stays a subscription", stripeSrc.includes('sessionData.append("mode", "subscription")'));
check("stripe-checkout keeps USD price ids", stripeSrc.includes("STRIPE_PRICE_STARTER_USD"));

// ---------------------------------------------------------------------------
section("[7] Arbitrary browser amount is rejected");
const priced = validateCheckoutInput({
  planId: "starter",
  clientAmountCents: 1,
  clientCurrency: "USD",
  idempotencyKey: "amount-test-key",
});
check("browser amount is ignored", priced.amountCents === 200_00);
check("server currency is USD", priced.currency === "USD");

// ---------------------------------------------------------------------------
section("[8] Arbitrary browser currency is rejected");
let currencyError = "";
try {
  validateCheckoutInput({
    planId: "starter",
    clientCurrency: "EUR",
    idempotencyKey: "currency-test-key",
  });
} catch (err) {
  currencyError = err instanceof PaymentError ? err.code : String(err);
}
check("non-USD currency rejected", currencyError === "invalid_currency");
check("client sends USD explicitly", /currency:\s*"USD"/.test(checkoutSrc));

// ---------------------------------------------------------------------------
section("[9] Stripe success page without a verified webhook");
const successSrc = read("src/pages/CheckoutSuccess.tsx");
check("success page requires server status confirmed", successSrc.includes('serverStatus?.status === "confirmed"'));
check("success page never confirms from session_id", !/sessionId[\s\S]{0,80}confirmed/.test(successSrc));
check("success page calls stripe-reconcile", successSrc.includes('functionsUrl("stripe-reconcile")'));
check("success page shows a verifying state", successSrc.includes("checkoutSuccess.verifying"));

// ---------------------------------------------------------------------------
section("[10] Delayed webhook recovery");
const paidSession = {
  id: "cs_test_1",
  mode: "subscription",
  currency: "usd",
  amount_total: 200_00,
  payment_status: "paid",
  subscription: "sub_1",
  metadata: { pending_payment_id: "pay_1" },
};
const pendingRow = {
  id: "pay_1",
  user_id: "u1",
  plan_id: "starter",
  amount_cents: 200_00,
  currency: "USD",
  metadata: {},
  status_enum: "pending",
};
check(
  "a paid subscription session validates",
  validateCheckoutSession({ session: paidSession, pendingPayment: pendingRow }).ok,
);
check(
  "an unpaid session never confirms",
  !validateCheckoutSession({
    session: { ...paidSession, payment_status: "unpaid" },
    pendingPayment: pendingRow,
  }).ok,
);
check(
  "a mismatched amount never confirms",
  !validateCheckoutSession({
    session: { ...paidSession, amount_total: 1 },
    pendingPayment: pendingRow,
  }).ok,
);
check(
  "reconcile applies the same validation",
  read("supabase/functions/stripe-reconcile/index.ts").includes("validateCheckoutSession"),
);

// ---------------------------------------------------------------------------
section("[11] Crypto unsupported asset");
let networkError = "";
try {
  validateCheckoutInput({
    planId: "starter",
    clientCurrency: "USD",
    network: "DOGE",
    idempotencyKey: "network-test-key",
  });
} catch (err) {
  networkError = err instanceof PaymentError ? err.code : String(err);
}
check("unknown crypto network rejected", networkError === "invalid_network");
const emptyEnv: EnvReader = () => null;
const noCryptoConfig = checkoutConfigFromEnv(emptyEnv, false);
check("no configured network means crypto unavailable", noCryptoConfig.methods.crypto.available === false);
check("crypto reason is crypto_not_configured", noCryptoConfig.methods.crypto.reason === "crypto_not_configured");
check("every network is unconfigured", noCryptoConfig.methods.crypto.networks.every((n) => !n.configured));
check("configuredCryptoNetworks is empty", configuredCryptoNetworks(noCryptoConfig).length === 0);

const oneNetworkEnv: EnvReader = (name) => (name === "CRYPTO_DESTINATION_TRC20" ? "TXyz" : null);
const oneNetworkConfig = checkoutConfigFromEnv(oneNetworkEnv, false);
check("one configured network makes crypto available", oneNetworkConfig.methods.crypto.available === true);
check(
  "only the configured network is offered",
  configuredCryptoNetworks(oneNetworkConfig).map((n) => n.id).join(",") === "TRC20",
);
check("every canonical network is reported", oneNetworkConfig.methods.crypto.networks.length === CRYPTO_NETWORKS.length);

const testConfig = checkoutConfigFromEnv(emptyEnv, true);
check("test mode offers every network", configuredCryptoNetworks(testConfig).length === CRYPTO_NETWORKS.length);

// ---------------------------------------------------------------------------
section("[12] Crypto wrong-network warning");
const cryptoPanel = read("src/components/checkout/CryptoPaymentPanel.tsx");
check("panel renders the wrong-network warning", cryptoPanel.includes("checkoutPage.crypto.wrongNetworkWarning"));
check("panel only offers server networks", cryptoPanel.includes("networks.map"));
check("panel never fabricates an address", !/0x[0-9a-fA-F]{10,}/.test(cryptoPanel));
check("panel has no QR generator", !/qrcode|qr-code|QRCode/i.test(cryptoPanel));

// ---------------------------------------------------------------------------
section("[13] Wise pending payment");
const wiseSrc = read("supabase/functions/wise-checkout/index.ts");
check("wise moves to pending_manual", wiseSrc.includes('newStatus: "pending_manual"'));
check("pending -> pending_manual is legal", canTransition("pending", "pending_manual"));
check("pending_manual can only confirm via operator path", canTransition("pending_manual", "confirmed"));
check("wise-checkout never confirms", !/newStatus:\s*"confirmed"/.test(wiseSrc));

// ---------------------------------------------------------------------------
section("[14] Wise fake-success attempt");
const bankPanel = read("src/components/checkout/BankTransferPanel.tsx");
check("bank panel has no paid/confirm action", !/confirmPayment|markPaid|wise-confirm|I have paid/i.test(bankPanel));
check("bank panel states instructions are not payment", bankPanel.includes("checkoutPage.bank.notPaidNotice"));
check("no endpoint accepts a client confirmation flag", !/wise-confirm/.test(read("src/pages/Checkout.tsx")));
check("wise amount comes from the canonical plan", wiseSrc.includes("validated.amountCents"));

// ---------------------------------------------------------------------------
section("[15] Duplicate checkout");
check("stripe-checkout handles the unique violation", stripeSrc.includes('pendingError?.code === "23505"'));
check("stripe-checkout returns duplicate_checkout", stripeSrc.includes('error: "duplicate_checkout"'));
check("duplicate maps to a localized message", checkoutErrorKey("duplicate_checkout") === "checkoutPage.errors.duplicateCheckout");

// ---------------------------------------------------------------------------
section("[16] Expired checkout");
check("canceled maps to expired", paymentStatusNotice("canceled")?.key === "checkoutPage.notices.expired");
check("incomplete_expired maps to expired", paymentStatusNotice("incomplete_expired")?.key === "checkoutPage.notices.expired");
check("confirmed maps to confirmed", paymentStatusNotice("confirmed")?.key === "checkoutPage.notices.confirmed");
check("pending_manual maps to manual review", paymentStatusNotice("pending_manual")?.key === "checkoutPage.notices.manualReview");
check("card pending maps to webhook delayed", paymentStatusNotice("pending", "card")?.key === "checkoutPage.notices.webhookDelayed");
check("unknown status has no notice", paymentStatusNotice("something_else") === null);

// ---------------------------------------------------------------------------
section("[17] All 11 locales carry checkoutPage");
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
const enKeys = Object.keys(localeMaps.en).filter((k) => k.startsWith("checkoutPage.")).sort();
check("English has the checkoutPage namespace", enKeys.length > 0);
for (const locale of LOCALES) {
  const keys = Object.keys(localeMaps[locale]).filter((k) => k.startsWith("checkoutPage.")).sort();
  check(`${locale} has the same checkoutPage keys`, JSON.stringify(keys) === JSON.stringify(enKeys));
  check(
    `${locale} has no empty checkoutPage value`,
    keys.every((k) => (localeMaps[locale][k] ?? "").trim().length > 0),
  );
}
for (const key of [
  "checkoutPage.crypto.wrongNetworkWarning",
  "checkoutPage.bank.notPaidNotice",
  "checkoutPage.notices.expired",
  "checkoutPage.errors.duplicateCheckout",
  "checkoutPage.errors.invalidEmail",
]) {
  check(`all locales define ${key}`, LOCALES.every((l) => Boolean(localeMaps[l][key])));
}

// ---------------------------------------------------------------------------
section("[18] Responsive + accessible rendering contract");
const pageSrc = checkoutSrc;
check("single column on mobile", pageSrc.includes("grid-cols-1"));
check("two columns on desktop", pageSrc.includes("lg:grid-cols-12"));
check("summary is sticky only on large screens", read("src/components/checkout/PlanSummaryCard.tsx").includes("lg:sticky"));
check("mobile/desktop column spans", pageSrc.includes("lg:col-span-5") && pageSrc.includes("lg:col-span-7"));
check("focus-visible states exist", pageSrc.includes("focus-visible:ring-2"));
const formSrc = read("src/components/checkout/CheckoutCustomerForm.tsx");
check("form exposes aria-invalid", formSrc.includes("aria-invalid"));
check("form exposes aria-describedby", formSrc.includes("aria-describedby"));
check("form marks required fields", formSrc.includes('aria-required="true"'));
check("error text is not color-only", formSrc.includes("<AlertCircle"));
check("method selector exposes pressed state", read("src/components/checkout/PaymentMethodSelector.tsx").includes("aria-pressed"));
check("notices use alert/status roles", read("src/components/checkout/CheckoutNotice.tsx").includes('role={tone === "error" ? "alert" : "status"}'));
check("buttons expose busy state", read("src/components/checkout/CardPaymentPanel.tsx").includes("aria-busy"));

// ---------------------------------------------------------------------------
section("[19] Server-side checkout config");
const noStripeConfig = checkoutConfigFromEnv(emptyEnv, false);
check("card unavailable without Stripe secrets", noStripeConfig.methods.card.available === false);
check("card reason is card_not_configured", noStripeConfig.methods.card.reason === "card_not_configured");
check("bank unavailable without Wise secrets", noStripeConfig.methods.bank.available === false);
check("currency is USD", noStripeConfig.currency === "USD");
check("currencies are USD-only", noStripeConfig.currencies.join(",") === "USD");
check("defaultMethod falls back to card", defaultMethod(null) === "card");
check("defaultMethod returns null when nothing is available", defaultMethod(noCryptoConfig) === null);
check("resolveMethodAvailability is null-safe", resolveMethodAvailability(null, "bank").available === true);
const allEnv: EnvReader = () => "configured";
const fullConfig = checkoutConfigFromEnv(allEnv, false);
check("all methods available when configured", fullConfig.methods.card.available && fullConfig.methods.bank.available);
check("checkout-config is JWT-protected", read("supabase/config.toml").includes("[functions.checkout-config]") && read("supabase/config.toml").includes("verify_jwt = true"));
check("checkout-config is rate limited", configSrc.includes("createRateLimiter("));
check("test mode banner is reused", checkoutSrc.includes("checkout.testModeBanner"));

// ---------------------------------------------------------------------------
if (failed > 0) {
  console.error(`\ncheckout redesign tests FAILED (${failed} failure(s), ${passed} passed)`);
  Deno.exit(1);
}
console.log(`\ncheckout redesign tests passed (${passed} checks)`);
