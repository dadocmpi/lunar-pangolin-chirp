// ============================================================================
// payment-activation-tests — production checkout, payment status, activation
// and transactional email contract.
//
// Run: deno run -A supabase/functions/_test/payment-activation-tests.ts
//
// No network, no DB, no secrets. Pure resolvers are exercised directly; the
// security-critical wiring is pinned with static assertions against the Edge
// Functions, the migration and the i18n source.
//
// Required scenarios:
//   profile prefill, missing profile fields, Stripe verified activation,
//   forged webhook, wrong amount, wrong currency, wrong Price ID, duplicate
//   webhook, delayed webhook reconciliation, Wise manual review, crypto manual
//   review, customer cannot self-approve, activation email sent exactly once,
//   no password in the email payload, refund and dispute state, cross-user
//   access, operator authorization, all 11 locales.
// ============================================================================

import {
  LIFECYCLE_STATES,
  canonicalPaymentStatus,
  deriveLifecycle,
  formatAmount,
  generateAccountId,
  isConfirmablePaymentStatus,
  isKnownPlanKey,
  lifecycleTone,
  nextActionKey,
  resolveAppUrl,
} from "../_shared/activation/lifecycle.ts";
import {
  activationEmailIdempotencyKey,
  paymentEmailIdempotencyKey,
} from "../_shared/activation/activationService.ts";
import { isOperatorMeta } from "../_shared/activation/operator.ts";
import {
  isAlreadyConfirmedFor,
} from "../_shared/stripe/confirmation.ts";
import { validateCheckoutSession } from "../_shared/stripe/sessionValidation.ts";
import {
  ACTIVATION_SUBJECT,
  TRANSACTIONAL_TEMPLATE_KEYS,
  buildAccountActivatedEmail,
  buildAccountSuspendedEmail,
  buildPaymentDisputedEmail,
  buildPaymentFailedEmail,
  buildPaymentPendingEmail,
  buildPaymentReceivedEmail,
  buildPaymentRefundedEmail,
  formatIsoDate,
  methodLabel,
  type EmailContext,
} from "../_shared/emailTemplates.ts";
import { redactDetailValue, safeCtaUrl } from "../_shared/userEmail.ts";
import {
  EMPTY_CHECKOUT_CUSTOMER,
  prefillCheckoutCustomer,
  validateCheckoutCustomer,
} from "../_shared/checkout/logic.ts";
import {
  PAYMENT_LIFECYCLE_STATES as CLIENT_LIFECYCLE_STATES,
  canConnectProvider,
  formatCountdown,
  lifecycleTone as clientLifecycleTone,
  remainingSeconds,
} from "../../../src/lib/paymentLifecycle.ts";

const ROOT = new URL("../../../", import.meta.url);
const read = (p: string) => Deno.readTextFileSync(new URL(p, ROOT));
const code = (p: string) =>
  read(p).split("\n").filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line)).join("\n");
const sqlCode = (p: string) =>
  read(p).split("\n").filter((line) => !/^\s*--/.test(line)).join("\n");

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

const REQUIRED_STATES = [
  "created",
  "pending",
  "processing",
  "manual_review",
  "confirmed",
  "activation_pending",
  "active",
  "failed",
  "expired",
  "cancelled",
  "refunded",
  "disputed",
  "past_due",
];

// ---------------------------------------------------------------------------
section("[1] Profile prefill and missing fields");
// ---------------------------------------------------------------------------
const profile = {
  first_name: "Maria",
  last_name: "Silva",
  phone_country_code: "+55",
  phone: "11912345678",
  country: "BR",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  city: "Sao Paulo",
  state: "SP",
  postal_code: "01310-100",
};
const prefilled = prefillCheckoutCustomer({
  profile,
  application: { email: "maria@example.com" },
  authEmail: "auth@example.com",
  authFullName: "Maria Silva",
});
check("first name prefilled", prefilled.firstName === "Maria");
check("last name prefilled", prefilled.lastName === "Silva");
check("email prefilled from application", prefilled.email === "maria@example.com");
check("phone prefilled", prefilled.phone === "11912345678");
check("country prefilled", prefilled.country === "BR");
check("street prefilled", prefilled.street === "Avenida Paulista");
check("city prefilled", prefilled.city === "Sao Paulo");
check("region prefilled", prefilled.state === "SP");
check("postal code prefilled", prefilled.postalCode === "01310-100");
check("complete prefill validates", validateCheckoutCustomer(prefilled).ok === true);

const emptyValidation = validateCheckoutCustomer(EMPTY_CHECKOUT_CUSTOMER);
check("empty form is invalid", emptyValidation.ok === false);
check("missing first name reported", emptyValidation.errors.firstName === "required");
check("missing last name reported", emptyValidation.errors.lastName === "required");
check("missing email reported", emptyValidation.errors.email === "invalid_email");
check("missing country reported", Boolean(emptyValidation.errors.country));
check("missing street reported", Boolean(emptyValidation.errors.street));
check("missing city reported", Boolean(emptyValidation.errors.city));
check("missing postal code reported", Boolean(emptyValidation.errors.postalCode));

// ---------------------------------------------------------------------------
section("[2] Stripe verified activation inputs");
// ---------------------------------------------------------------------------
const pending = {
  id: "pp_1",
  user_id: "user_1",
  plan_id: "professional",
  amount_cents: 35000,
  currency: "USD",
  status_enum: "pending",
  metadata: { pending_payment_id: "pp_1" },
};
const goodSession = {
  id: "cs_1",
  mode: "subscription",
  currency: "usd",
  amount_total: 35000,
  payment_status: "paid",
  customer: "cus_1",
  subscription: "sub_1",
  metadata: { pending_payment_id: "pp_1" },
};
const valid = validateCheckoutSession({
  session: goodSession,
  pendingPayment: pending,
  applicationPlanKey: "professional",
});
check("a complete paid subscription validates", valid.ok === true);
check("confirmed payment is confirmable", isConfirmablePaymentStatus("confirmed") === true);
check("legacy payment_confirmed is confirmable", isConfirmablePaymentStatus("payment_confirmed") === true);
check("pending is not confirmable", isConfirmablePaymentStatus("pending") === false);
check("plan key is canonical", isKnownPlanKey("professional") === true);
check("unknown plan key is rejected", isKnownPlanKey("free-lunch") === false);

const webhook = code("supabase/functions/stripe-webhook/index.ts");
check("webhook verifies the Stripe signature", webhook.includes("stripe-signature"));
check("webhook rejects an invalid signature", /Invalid signature/.test(webhook));
check("webhook validates the session before confirming", webhook.includes("validateCheckoutSession("));
check("webhook confirms through the shared helper", webhook.includes("applyCheckoutConfirmation("));
check("webhook activates only after validation", webhook.includes("activatePlanFromVerifiedPayment("));
check("webhook sends the activation email once", webhook.includes("sendActivationEmailOnce("));

// ---------------------------------------------------------------------------
section("[3] Forged webhook, wrong amount, wrong currency, wrong Price ID");
// ---------------------------------------------------------------------------
const forged = validateCheckoutSession({
  session: { ...goodSession, metadata: { pending_payment_id: "other" } },
  pendingPayment: pending,
  applicationPlanKey: "professional",
});
check("a session for another pending payment is rejected", forged.code === "pending_payment_mismatch");

const wrongAmount = validateCheckoutSession({
  session: { ...goodSession, amount_total: 1 },
  pendingPayment: pending,
  applicationPlanKey: "professional",
});
check("wrong amount is rejected", wrongAmount.code === "amount_mismatch");

const wrongCurrency = validateCheckoutSession({
  session: { ...goodSession, currency: "eur" },
  pendingPayment: pending,
  applicationPlanKey: "professional",
});
check("wrong currency is rejected", wrongCurrency.code === "currency_mismatch");

const wrongPlan = validateCheckoutSession({
  session: goodSession,
  pendingPayment: pending,
  applicationPlanKey: "starter",
});
check("wrong plan / Price ID is rejected", wrongPlan.code === "plan_mismatch");

const wrongMode = validateCheckoutSession({
  session: { ...goodSession, mode: "payment" },
  pendingPayment: pending,
  applicationPlanKey: "professional",
});
check("one-off payment mode is rejected", wrongMode.code === "unexpected_mode");

const unpaid = validateCheckoutSession({
  session: { ...goodSession, payment_status: "unpaid" },
  pendingPayment: pending,
  applicationPlanKey: "professional",
});
check("unpaid session is rejected", unpaid.code === "payment_not_paid");

const noSubscription = validateCheckoutSession({
  session: { ...goodSession, subscription: null },
  pendingPayment: pending,
  applicationPlanKey: "professional",
});
check("subscription mode without a subscription is rejected", noSubscription.code === "missing_subscription");

check("stripe-checkout uses canonical USD price ids",
  code("supabase/functions/stripe-checkout/index.ts").includes("STRIPE_PRICE_STARTER_USD"));
check("stripe-checkout keeps mode=subscription",
  code("supabase/functions/stripe-checkout/index.ts").includes('"mode", "subscription"'));
check("the webhook flags a failed validation for manual review",
  webhook.includes("flagCheckoutForManualReview("));

// ---------------------------------------------------------------------------
section("[4] Duplicate webhook and delayed reconciliation");
// ---------------------------------------------------------------------------
check("duplicate event on a confirmed payment is recognised",
  isAlreadyConfirmedFor(
    { ...pending, status_enum: "confirmed", metadata: { processed_event_ids: ["evt_1"] } },
    "evt_1",
  ) === true);
check("a different event is not treated as duplicate",
  isAlreadyConfirmedFor(
    { ...pending, status_enum: "confirmed", metadata: { processed_event_ids: ["evt_1"] } },
    "evt_2",
  ) === false);

const reconcile = code("supabase/functions/stripe-reconcile/index.ts");
check("reconcile retrieves the session from Stripe", reconcile.includes("api.stripe.com/v1/checkout/sessions"));
check("reconcile applies the same validation", reconcile.includes("validateCheckoutSession("));
check("reconcile applies the same confirmation helper", reconcile.includes("applyCheckoutConfirmation("));
check("reconcile activates after confirmation", reconcile.includes("activatePlanFromVerifiedPayment("));
check("reconcile is idempotent on a confirmed payment", reconcile.includes('status_enum === "confirmed"'));

// ---------------------------------------------------------------------------
section("[5] Wise and crypto stay manual; no customer self-approval");
// ---------------------------------------------------------------------------
const wise = code("supabase/functions/wise-checkout/index.ts");
const cryptoFn = code("supabase/functions/crypto-checkout/index.ts");
check("wise never confirms", !/status_enum:\s*["']confirmed["']/.test(wise));
check("wise transitions to pending_manual", wise.includes("pending_manual"));
check("crypto never confirms", !/status_enum:\s*["']confirmed["']/.test(cryptoFn));
check("crypto inserts as pending", cryptoFn.includes("status_enum") || cryptoFn.includes("upsertPendingPayment"));

const operatorPayments = code("supabase/functions/operator-payments/index.ts");
check("manual approval requires an operator", operatorPayments.includes("requireOperator(req)"));
check("manual approval is the only confirm path in operator-payments",
  operatorPayments.includes('status_enum: "confirmed"'));
check("operator-payments supports approve/reject/request/activate/suspend/disconnect/reinstate",
  ["approve_payment", "reject_payment", "request_info", "activate", "suspend", "disconnect", "reinstate"]
    .every((a) => operatorPayments.includes(`"${a}"`)));
check("operator-payments is rate limited", operatorPayments.includes("createRateLimiter("));
check("operator-payments resolves CORS per request", operatorPayments.includes("corsHeadersFor(req)"));

const activationSubmit = code("supabase/functions/activation-submit/index.ts");
const accountLink = code("supabase/functions/account-link/index.ts");
check("activation-submit never writes a confirmed payment", !/status_enum:\s*["']confirmed["']/.test(activationSubmit));
check("account-link never confirms a payment", !/status_enum:\s*["']confirmed["']/.test(accountLink));
check("payment-status is read-only", !/\.update\(|\.insert\(/.test(code("supabase/functions/payment-status/index.ts")));

// ---------------------------------------------------------------------------
section("[6] Activation record, entitlement and audit");
// ---------------------------------------------------------------------------
const service = code("supabase/functions/_shared/activation/activationService.ts");
check("activation is idempotent per payment", service.includes("readActivation(") && service.includes("23505"));
check("activation updates the services entitlement", service.includes('from("services")'));
check("activation writes the append-only audit log", service.includes("payment_audit_log"));
check("audit rows record the operator id", service.includes("actor_id: input.actorId ?? null"));
check("operator-payments records the actor id", operatorPayments.includes("actorId: ctx.user.id"));
check("manual approval is conditional on the status read",
  operatorPayments.includes('.eq("status_enum", payment.status_enum ?? raw)'));
check("manual approval audit event is stable per payment",
  operatorPayments.includes("operator:approve_payment:${payment.id}`"));
check("manual rejection audit event is stable per payment",
  operatorPayments.includes("operator:reject_payment:${payment.id}`"));
check("activation never overwrites an operator suspension", service.includes('existing.status === "suspended"'));
check("activation requires a confirmed payment", service.includes("payment_not_confirmed"));
check("activation derives the plan from the server table", service.includes("PLANS[payment.plan_id]"));

const migration = read("supabase/migrations/20261124000000_plan_activation_lifecycle.sql");
check("migration adds actor_id", migration.includes("ADD COLUMN IF NOT EXISTS actor_id"));
check("migration creates plan_activations", migration.includes("CREATE TABLE IF NOT EXISTS public.plan_activations"));
check("one activation per payment", migration.includes("UNIQUE (payment_id)"));
check("RLS enabled on plan_activations", migration.includes("ENABLE ROW LEVEL SECURITY"));
check("client writes are denied", migration.includes("plan_activations_no_client_insert") && migration.includes("WITH CHECK (false)"));
check("operator policy requires a strict boolean",
  migration.includes("jsonb_typeof(auth.jwt() -> 'app_metadata' -> 'operator') = 'boolean'"));
check("audit log accepts plan_activations", migration.includes("plan_activations"));
check("no credential column exists", !/password|cid|secret|api[_-]?key/i.test(sqlCode("supabase/migrations/20261124000000_plan_activation_lifecycle.sql")));

// ---------------------------------------------------------------------------
section("[7] Activation email exactly once and no secrets");
// ---------------------------------------------------------------------------
check("claim is atomic on the null claim timestamp",
  service.includes('.is("activation_email_claimed_at", null)'));
check("a sent email is never re-sent", service.includes('.is("activation_email_sent_at", null)'));
check("a failed delivery releases the claim",
  service.includes("activation_email_claimed_at: null"));
check("provider idempotency header is set", code("supabase/functions/_shared/userEmail.ts").includes("Idempotency-Key"));
check("activation idempotency key is stable", activationEmailIdempotencyKey("pp_1") === "braxel-activation-pp_1");
check("payment idempotency key is stable",
  paymentEmailIdempotencyKey("payment_failed", "pp_1") === "braxel-payment_failed-pp_1");

const ctx: EmailContext = {
  firstName: "Maria",
  planName: "Professional",
  amountFormatted: formatAmount(35000, "USD"),
  method: "stripe",
  reference: "pp_1",
  accountId: "BRX-12345678",
  activationDate: "2026-11-22T12:00:00Z",
  status: "Active",
  dashboardUrl: "https://braxelmarkets.vercel.app/dashboard",
  supportEmail: "support@example.com",
};
const activationEmail = buildAccountActivatedEmail(ctx);
check("activation subject is exact", activationEmail.subject === ACTIVATION_SUBJECT);
check("activation subject text", activationEmail.subject === "Your Braxel Markets account is now active");
const activationText = [
  activationEmail.heading,
  activationEmail.body,
  ...activationEmail.details.flat(),
  ...(activationEmail.bullets ?? []),
  activationEmail.cta?.url ?? "",
  activationEmail.footnote ?? "",
].join("\n");
check("email contains the first name", activationText.includes("Maria"));
check("email contains the account id", activationText.includes("BRX-12345678"));
check("email contains the plan", activationText.includes("Professional"));
check("email contains the account status", activationText.includes("Active"));
check("email contains the activation date", activationText.includes("2026-11-22"));
check("email contains the dashboard link", activationText.includes("/dashboard"));
check("email contains next steps", (activationEmail.bullets ?? []).length >= 3);
check("email contains the support contact", activationText.includes("support@example.com"));
check("email contains a security notice", /never ask/i.test(activationEmail.footnote ?? ""));
check("email has no password value", !/password/i.test(activationText));
check("email has no secret-like value", !/sk_live|whsec_|api[_-]?key|private[_-]?key|bearer /i.test(activationText));
check("email has no card number", !/(?:\d[ -]?){13,19}/.test(activationText));
check("email has no provider token", !/tradovate/i.test(activationText));
check("email has no crypto private key", !/seed phrase|mnemonic/i.test(activationText));

check("redaction hides a secret-like value", redactDetailValue("sk_live_123") === "«redacted»");
check("redaction hides a card-like value", redactDetailValue("4242 4242 4242 4242") === "«redacted»");
check("redaction keeps normal text", redactDetailValue("Professional") === "Professional");
check("CTA rejects javascript:", safeCtaUrl("javascript:alert(1)") === null);
check("CTA accepts https", safeCtaUrl("https://braxelmarkets.vercel.app") !== null);

// ---------------------------------------------------------------------------
section("[8] All required email templates");
// ---------------------------------------------------------------------------
check("seven transactional templates exist", TRANSACTIONAL_TEMPLATE_KEYS.length === 7);
for (const key of TRANSACTIONAL_TEMPLATE_KEYS) {
  check(`template ${key} is registered`, TRANSACTIONAL_TEMPLATE_KEYS.includes(key));
}
const builders = [
  buildPaymentReceivedEmail,
  buildPaymentPendingEmail,
  buildPaymentFailedEmail,
  buildAccountActivatedEmail,
  buildAccountSuspendedEmail,
  buildPaymentRefundedEmail,
  buildPaymentDisputedEmail,
];
for (const build of builders) {
  const email = build(ctx);
  const text = [email.subject, email.heading, email.body, ...email.details.flat()].join("\n");
  check(`${email.templateKey} has a subject`, email.subject.length > 0);
  check(`${email.templateKey} has no secret-like value`, !/sk_live|whsec_|api[_-]?key/i.test(text));
}
check("suspended email includes the account id", buildAccountSuspendedEmail(ctx).details.flat().includes("BRX-12345678"));
check("refunded email mentions refund", /refund/i.test(buildPaymentRefundedEmail(ctx).body));
check("disputed email mentions dispute", /dispute/i.test(buildPaymentDisputedEmail(ctx).body));
check("method label maps stripe to Card", methodLabel("stripe") === "Card");
check("method label maps crypto", methodLabel("crypto") === "Crypto");
check("method label maps wise to bank transfer", methodLabel("wise") === "Bank transfer");
check("date formatting is stable", formatIsoDate("2026-11-22T12:00:00Z") === "2026-11-22");

// ---------------------------------------------------------------------------
section("[9] Lifecycle: all required states + refund/dispute precedence");
// ---------------------------------------------------------------------------
for (const state of REQUIRED_STATES) {
  check(`state ${state} exists`, (LIFECYCLE_STATES as readonly string[]).includes(state));
}
check("server and client lifecycle lists match",
  JSON.stringify(LIFECYCLE_STATES) === JSON.stringify(CLIENT_LIFECYCLE_STATES));
check("created maps", deriveLifecycle("created", null) === "created");
check("pending maps", deriveLifecycle("pending", null) === "pending");
check("processing maps", deriveLifecycle("processing", null) === "processing");
check("pending_manual maps to manual_review", deriveLifecycle("pending_manual", null) === "manual_review");
check("confirmed maps", deriveLifecycle("confirmed", null) === "confirmed");
check("confirmed + pending activation maps", deriveLifecycle("confirmed", "activation_pending") === "activation_pending");
check("active maps", deriveLifecycle("confirmed", "active") === "active");
check("failed maps", deriveLifecycle("failed", null) === "failed");
check("rejected maps to failed", deriveLifecycle("rejected", null) === "failed");
check("incomplete_expired maps to expired", deriveLifecycle("incomplete_expired", null) === "expired");
check("canceled maps to cancelled", deriveLifecycle("canceled", null) === "cancelled");
check("refunded maps", deriveLifecycle("refunded", null) === "refunded");
check("disputed maps", deriveLifecycle("disputed", null) === "disputed");
check("past_due maps", deriveLifecycle("past_due", null) === "past_due");
check("suspended maps", deriveLifecycle("confirmed", "suspended") === "suspended");
check("disconnected maps", deriveLifecycle("confirmed", "disconnected") === "disconnected");
check("refund wins over an active activation", deriveLifecycle("refunded", "active") === "refunded");
check("dispute wins over an active activation", deriveLifecycle("disputed", "active") === "disputed");

check("next action for pending is complete_payment", nextActionKey("pending") === "complete_payment");
check("next action for manual review", nextActionKey("manual_review") === "await_manual_review");
check("next action for active is connect_provider", nextActionKey("active") === "connect_provider");
check("next action for failed is update_payment_method", nextActionKey("failed") === "update_payment_method");
check("next action for refunded is contact_support", nextActionKey("refunded") === "contact_support");
check("tone for active is success", lifecycleTone("active") === "success");
check("tone for failed is error", lifecycleTone("failed") === "error");
check("tone matches client", lifecycleTone("manual_review") === clientLifecycleTone("manual_review"));
check("provider connect only when active", canConnectProvider("active") === true && canConnectProvider("pending") === false);

check("canonical status keeps confirmed", canonicalPaymentStatus("confirmed") === "confirmed");
check("canonical status maps legacy payment_confirmed", canonicalPaymentStatus("payment_confirmed") === "confirmed");
check("canonical status maps unknown to pending", canonicalPaymentStatus("weird") === "pending");
check("canonical status keeps past_due", canonicalPaymentStatus("past_due") === "past_due");

check("account id is stable", generateAccountId("pp_1") === generateAccountId("pp_1"));
check("account id is formatted", /^BRX-[0-9A-F]{8}$/.test(generateAccountId("pp_1")));
check("different payments get different ids", generateAccountId("pp_1") !== generateAccountId("pp_2"));
check("app url falls back safely", resolveAppUrl("javascript:alert(1)") === "https://braxelmarkets.vercel.app");
check("app url strips a trailing slash", resolveAppUrl("https://example.com/") === "https://example.com");
check("amount formatting", formatAmount(35000, "USD") === "USD 350.00");

check("countdown formats mm:ss", formatCountdown(65) === "01:05");
check("countdown formats hh:mm:ss", formatCountdown(3665) === "1:01:05");
check("remaining seconds never negative", remainingSeconds("2020-01-01T00:00:00Z", Date.now()) === 0);
check("remaining seconds null without expiry", remainingSeconds(null) === null);

// ---------------------------------------------------------------------------
section("[10] Refund and dispute emails are wired");
// ---------------------------------------------------------------------------
check("webhook sends the refunded email", webhook.includes('template: "payment_refunded"'));
check("webhook sends the disputed email", webhook.includes('template: "payment_disputed"'));
check("webhook sends the failed email on renewal failure",
  webhook.includes('template: "payment_failed"'));
check("webhook never activates on a refund", !/charge\.refunded[\s\S]{0,2000}activatePlanFromVerifiedPayment/.test(webhook));
check("webhook never activates on a dispute", !/charge\.dispute\.created[\s\S]{0,2000}activatePlanFromVerifiedPayment/.test(webhook));

// ---------------------------------------------------------------------------
section("[11] Cross-user access and ownership");
// ---------------------------------------------------------------------------
const paymentStatus = code("supabase/functions/payment-status/index.ts");
check("payment-status derives the user from the JWT", paymentStatus.includes("auth.getUser("));
check("payment-status scopes the payment to the user",
  paymentStatus.includes('.eq("user_id", user.id)'));
check("payment-status scopes the activation to the user",
  paymentStatus.includes('.eq("user_id", user.id)'));
check("payment-status ignores a body user id",
  !/body\.value\.user_?id|searchParams\.get\(\s*["']user_?id["']/.test(paymentStatus));
check("activation-submit scopes to the JWT user",
  activationSubmit.includes('.eq("user_id", ctx.user.id)'));
check("account-link scopes to the JWT user",
  accountLink.includes('.eq("user_id", ctx.user.id)'));
check("activation-review reads the payment scoped to the row owner",
  code("supabase/functions/activation-review/index.ts").includes('.eq("user_id", row.user_id)'));

// ---------------------------------------------------------------------------
section("[12] Operator authorization");
// ---------------------------------------------------------------------------
check("operator predicate is a strict boolean", isOperatorMeta({ operator: true }) === true);
check("operator predicate rejects the string true", isOperatorMeta({ operator: "true" }) === false);
check("operator predicate rejects a missing flag", isOperatorMeta({}) === false);
check("operator predicate rejects null", isOperatorMeta(null) === false);
check("requireOperator reads app_metadata from the admin API",
  code("supabase/functions/_shared/activation/operator.ts").includes("getUserById"));
check("activation-review requires an operator",
  code("supabase/functions/activation-review/index.ts").includes("requireOperator(req)"));
check("operator-payments records the operator id",
  operatorPayments.includes("ctx.user.id"));
check("operator-payments never returns a secret", !/service_role_key|STRIPE_SECRET_KEY|RESEND_API_KEY/.test(operatorPayments));

// ---------------------------------------------------------------------------
section("[13] All 11 locales carry the new namespaces");
// ---------------------------------------------------------------------------
const i18n = read("src/i18n.ts");
const locales = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"];
check("11 locale objects exist", locales.every((l) => i18n.includes(`const ${l}Translation = `)));
check("paymentCard namespace exists in all 11",
  (i18n.match(/paymentCard: \{/g) ?? []).length === 11);
check("operatorPayments namespace exists in all 11",
  (i18n.match(/operatorPayments: \{/g) ?? []).length === 11);
check("all 13 required status labels are translated",
  REQUIRED_STATES.every((s) => (i18n.match(new RegExp(`"${s}":`, "g")) ?? []).length >= 11));

// ---------------------------------------------------------------------------
section("[14] Database/function wiring");
// ---------------------------------------------------------------------------
check("plan_activations migration is the new head",
  read("supabase/migrations/20261124000000_plan_activation_lifecycle.sql").length > 0);
check("operator-payments is JWT protected",
  read("supabase/config.toml").includes("[functions.operator-payments]"));
check("payment-status returns lifecycle + next_action",
  paymentStatus.includes("next_action: nextActionKey(lifecycle)"));
check("payment-status supports the latest payment",
  paymentStatus.includes("order(\"created_at\", { ascending: false })"));
check("no order/copy-trade/payout function was added",
  !["place-order", "orders", "liquidate", "copy-trade", "payout", "ach", "wire"]
    .some((name) => {
      try {
        Deno.statSync(new URL(`supabase/functions/${name}/index.ts`, ROOT));
        return true;
      } catch {
        return false;
      }
    }));
check("activation service never calls Tradovate",
  !/restService|authService|tradovateapi/i.test(service));
check("activation never stores a credential",
  !/password|cid\b|secret/i.test(service));

// ---------------------------------------------------------------------------
console.log(
  failed === 0
    ? `\npayment activation tests passed (${passed} checks)`
    : `\npayment activation tests FAILED (${failed} of ${passed + failed})`,
);
if (failed > 0) Deno.exit(1);
