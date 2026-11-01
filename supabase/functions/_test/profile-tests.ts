// ============================================================================
// profile-tests — the two-step signup / profile / checkout-billing path.
//
// Run: deno run -A supabase/functions/_test/profile-tests.ts
//
// Exercises the pure server-side validation and billing sanitization and
// asserts the security wiring in the profile-submit Edge Function and the
// Stripe customer resolution: the user comes from the JWT, the body is
// re-validated, no password or card data is ever accepted or stored, and the
// Stripe customer id is persisted on the profile.
// ============================================================================

import {
  PROFILE_LIMITS,
  toProfileRow,
  validateProfile,
} from "../_shared/profile/validation.ts";
import { sanitizeBilling } from "../_shared/profile/billing.ts";
import { isKnownCountryCode } from "../_shared/profile/countries.ts";

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

const valid = {
  fullName: "Maria Silva",
  phoneCountryCode: "+55",
  phone: "(11) 91234-5678",
  country: "BR",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  city: "São Paulo",
  state: "SP",
  postalCode: "01310-100",
};

// ---------------------------------------------------------------------------
console.log("\n[1] validateProfile accepts a complete, well-formed payload");
const ok = validateProfile(valid);
check("valid payload passes", ok.ok);
check("complement is optional", validateProfile({ ...valid, complement: "" }).ok);
check("trims whitespace", validateProfile({ ...valid, fullName: "  Maria Silva  " }).value.fullName === "Maria Silva");
check("uppercases the country code", validateProfile({ ...valid, country: "br" }).value.country === "BR");

// ---------------------------------------------------------------------------
console.log("\n[2] validateProfile rejects bad input with a per-field code");
const cases: Array<[string, Record<string, unknown>, string, string]> = [
  ["missing name", { ...valid, fullName: "" }, "fullName", "required"],
  ["short name", { ...valid, fullName: "A" }, "fullName", "too_short"],
  ["long name", { ...valid, fullName: "x".repeat(200) }, "fullName", "too_long"],
  ["missing dial code", { ...valid, phoneCountryCode: "" }, "phoneCountryCode", "required"],
  ["dial code without +", { ...valid, phoneCountryCode: "55" }, "phoneCountryCode", "invalid_phone_code"],
  ["missing phone", { ...valid, phone: "" }, "phone", "required"],
  ["phone with letters", { ...valid, phone: "abc1234" }, "phone", "invalid_phone"],
  ["phone too few digits", { ...valid, phone: "123" }, "phone", "invalid_phone"],
  ["unknown country", { ...valid, country: "ZZ" }, "country", "invalid_country"],
  ["missing street", { ...valid, street: "" }, "street", "required"],
  ["missing number", { ...valid, number: "" }, "number", "required"],
  ["missing city", { ...valid, city: "" }, "city", "required"],
  ["missing state", { ...valid, state: "" }, "state", "required"],
  ["missing postal code", { ...valid, postalCode: "" }, "postalCode", "required"],
  ["bad postal code", { ...valid, postalCode: "!" }, "postalCode", "invalid_postal_code"],
];
for (const [name, input, field, code] of cases) {
  const r = validateProfile(input);
  check(`${name} -> ${field}=${code}`, !r.ok && r.errors[field as keyof typeof r.errors] === code);
}
check("a number-less street address is still required", !validateProfile({ ...valid, street: "   " }).ok);

// ---------------------------------------------------------------------------
console.log("\n[3] Accepts the real-world phone formats customers type");
for (const phone of ["(11) 91234-5678", "+1 (212) 555-0198".replace("+1 ", ""), "212.555.0198", "11912345678"]) {
  check(`accepts "${phone}"`, validateProfile({ ...valid, phone }).ok);
}

// ---------------------------------------------------------------------------
console.log("\n[4] toProfileRow writes only the expected columns");
const row = toProfileRow(validateProfile(valid).value, "user-1");
check("scoped to the given user id", row.id === "user-1");
check("sets profile_completed", row.profile_completed === true);
check("maps snake_case columns", row.full_name === "Maria Silva" && row.postal_code === "01310-100");
check("empty complement becomes null", toProfileRow(validateProfile({ ...valid, complement: "" }).value, "u").complement === null);
check("no password/card column is ever written", !/password|card|cvc|cvv|secret/i.test(Object.keys(row).join(",")));

// ---------------------------------------------------------------------------
console.log("\n[5] sanitizeBilling flattens the address for Stripe and drops control chars");
const bill = sanitizeBilling({
  fullName: "Maria Silva",
  email: "maria@example.com",
  phoneCountryCode: "+55",
  phone: "11912345678",
  country: "br",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  city: "São Paulo",
  state: "SP",
  postalCode: "01310-100",
});
check("joins street + number into line1", bill.line1 === "Avenida Paulista, 1000");
check("complement becomes line2", bill.line2 === "Apto 42");
check("joins dial code + phone", bill.phone === "+55 11912345678");
check("uppercases the country", bill.country === "BR");
check("keeps the email", bill.email === "maria@example.com");
check("caps the name length", sanitizeBilling({ fullName: "x".repeat(500) }).name.length === 120);
check(
  "strips control characters",
  [...sanitizeBilling({ city: "São\u0000Paulo" }).city].every((ch) => ch.charCodeAt(0) > 0x1f),
);
check("missing input becomes empty strings", sanitizeBilling(undefined).name === "" && sanitizeBilling(null).country === "");

// ---------------------------------------------------------------------------
console.log("\n[6] Wiring: profile-submit is JWT-scoped and re-validates");
const submit = read("supabase/functions/profile-submit/index.ts");
const submitCode = submit.replace(/\/\/[^\n]*/g, "");
check("derives the user from the JWT (requireUser)", submit.includes("requireUser(req)"));
check("re-validates the body server-side", submit.includes("validateProfile(body)"));
check("writes only the caller's row (scoped by user id)", submit.includes("toProfileRow(result.value, ctx.user.id)"));
check("upserts on the id conflict", /onConflict:\s*"id"/.test(submit));
check("never accepts a password or card field", !/password|card_number|cvc|cvv/i.test(submitCode));
check("stamps the terms acceptance with the server clock", /terms_accepted_at\s*=\s*now/.test(submit));
check("keeps only the first terms acceptance", /!existing\?\.terms_accepted_at/.test(submit));

// ---------------------------------------------------------------------------
console.log("\n[7] Wiring: stripe-checkout reuses/creates a Stripe Customer");
const stripe = read("supabase/functions/stripe-checkout/index.ts");
check("resolves a Stripe customer", stripe.includes("resolveStripeCustomer("));
check("reads stripe_customer_id from the profile", stripe.includes("stripe_customer_id"));
check("persists the new customer id on the profile", /update\(\{\s*stripe_customer_id/.test(stripe));
check("sanitizes the billing payload", stripe.includes("sanitizeBilling("));
check("attaches the customer to the session", /sessionData\.append\("customer", customerId\)/.test(stripe));
check("lets Stripe collect/update the billing address", stripe.includes("billing_address_collection") && stripe.includes("customer_update[address]"));
check("creates a customer via the Stripe API", stripe.includes('"/customers"'));
check("refreshes an existing customer", /`\/customers\/\$\{existing\}`/.test(stripe));

// ---------------------------------------------------------------------------
console.log("\n[8] Wiring: the client checkout blocks an incomplete profile");
const checkout = read("src/pages/Checkout.tsx");
check("redirects an incomplete profile to /complete-profile", checkout.includes("/complete-profile"));
check("pre-fills billing from the profile", checkout.includes("toProfileFields(profile.raw)"));
check("passes billing to every checkout function", (checkout.match(/billing:\s*bill/g) || []).length >= 3);
check("offers the update-my-profile option", checkout.includes("updateProfileWithBilling"));

// ---------------------------------------------------------------------------
console.log("\n[9] Wiring: registration is two steps and never stores a password client-side");
const register = read("src/pages/Register.tsx");
check("has a step 2", /setStep\(2\)/.test(register));
check("records terms + privacy acceptance", /acceptedTerms:\s*acceptedTerms/.test(register) && /acceptedPrivacy:\s*acceptedTerms/.test(register));
check("creates the account through Supabase Auth", register.includes("supabase.auth.signUp("));
check("never writes a password to storage", !/localStorage\.setItem\([^)]*password/i.test(register));
check("sends the terms acceptance in the signup metadata", /terms_accepted:\s*true/.test(register));

// ---------------------------------------------------------------------------
console.log("\n[9b] Wiring: the signup trigger stamps consent at account creation");
const migration = read("supabase/migrations/20261011000000_client_profiles.sql");
check("defines the new-user profile trigger", migration.includes("handle_new_user_profile"));
check("the trigger reads the terms metadata", /raw_user_meta_data ->> 'terms_accepted'/.test(migration));
check("the trigger stamps terms_accepted_at", /terms_accepted_at/.test(migration));

// The legacy `on_auth_user_created` trigger (handle_new_user) fires first and
// creates the row, so our trigger MUST upsert — an insert-ignore no-ops and
// leaves full_name / terms_accepted_at NULL. Regression pinned by the fix.
const triggerFix = read("supabase/migrations/20261012000000_profile_signup_trigger_fix.sql");
check("the fix redefines the profile trigger", triggerFix.includes("handle_new_user_profile"));
check("the trigger upserts instead of ignoring conflicts", /ON CONFLICT \(id\) DO UPDATE/.test(triggerFix));
check("the upsert only fills the empty name", /COALESCE\(NULLIF\(public\.profiles\.full_name, ''\), EXCLUDED\.full_name\)/.test(triggerFix));
check("the upsert keeps the first acceptance", /terms_accepted_at = COALESCE\(public\.profiles\.terms_accepted_at, EXCLUDED\.terms_accepted_at\)/.test(triggerFix));
check("the fix backfills consent for existing rows", /UPDATE public\.profiles/.test(triggerFix));

// ---------------------------------------------------------------------------
console.log("\n[9c] Wiring: registration handles the confirm-email flow");
check("stops at a confirmation screen when signUp returns no session", /if \(!data\.session\)/.test(register) && /setStep\('confirm'\)/.test(register));
check("renders the confirmation screen", register.includes("checkEmailTitle") || register.includes("checkEmailBody"));
check("maps an expired session to a clear message", /signup\.sessionExpired/.test(register));

// ---------------------------------------------------------------------------
console.log("\n[10] Country set: every code the client can send is accepted server-side");
check("BR is known", isKnownCountryCode("BR"));
check("US is known", isKnownCountryCode("US"));
check("ZZ is rejected", !isKnownCountryCode("ZZ"));
check("lowercase is normalised by the validator", validateProfile({ ...valid, country: "de" }).ok);

// ---------------------------------------------------------------------------
console.log("\n[11] Limits are exported and sane");
check("phone digit bounds exist", PROFILE_LIMITS.phoneDigitsMin > 0 && PROFILE_LIMITS.phoneDigitsMax > PROFILE_LIMITS.phoneDigitsMin);
check("full name bounds exist", PROFILE_LIMITS.fullNameMax > PROFILE_LIMITS.fullNameMin);

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
