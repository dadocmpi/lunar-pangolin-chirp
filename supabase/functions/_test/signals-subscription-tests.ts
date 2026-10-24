// ============================================================================
// signals-subscription-tests — the monthly signals-plan billing.
//
// Run: deno run -A supabase/functions/_test/signals-subscription-tests.ts
//
// Exercises the pure Stripe->status mapping and asserts the security wiring in
// signals-checkout and stripe-webhook: the plan becomes active ONLY from a
// verified webhook event, a failed payment or cancellation deactivates it, the
// browser never declares the price, the user comes from the JWT, and nothing
// calls Tradovate or stores a broker credential.
// ============================================================================

import {
  isInactiveStatus,
  isPlanActive,
  isSubscriptionStatus,
  needsPayment,
  stripeSubscriptionToStatus,
  SUBSCRIPTION_STATUSES,
  subscriptionStatusKey,
} from "../_shared/signals/status.ts";
import { isPaymentsEnabled } from "../_shared/payments-flag.ts";

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
console.log("\n[1] Stripe status -> our vocabulary");
check("active -> active", stripeSubscriptionToStatus("active") === "active");
check("trialing counts as active", stripeSubscriptionToStatus("trialing") === "active");
check("past_due -> past_due", stripeSubscriptionToStatus("past_due") === "past_due");
check("unpaid -> unpaid", stripeSubscriptionToStatus("unpaid") === "unpaid");
check("incomplete -> incomplete", stripeSubscriptionToStatus("incomplete") === "incomplete");
check("incomplete_expired -> canceled", stripeSubscriptionToStatus("incomplete_expired") === "canceled");
check("paused -> past_due", stripeSubscriptionToStatus("paused") === "past_due");
check("canceled -> canceled", stripeSubscriptionToStatus("canceled") === "canceled");
check("an unknown status is NEVER active", stripeSubscriptionToStatus("something_new") === "incomplete");
check("undefined is NEVER active", stripeSubscriptionToStatus(undefined) === "incomplete");
check("a non-string is NEVER active", stripeSubscriptionToStatus(7) === "incomplete");

// ---------------------------------------------------------------------------
console.log("\n[2] The plan is active for exactly one status");
check("'active' is the only active status", SUBSCRIPTION_STATUSES.filter(isPlanActive).join(",") === "active");
check("isPlanActive('active')", isPlanActive("active"));
check("isPlanActive('pending') is false", isPlanActive("pending") === false);
check("isPlanActive('past_due') is false", isPlanActive("past_due") === false);
check("isPlanActive('canceled') is false", isPlanActive("canceled") === false);
check("isPlanActive(null) is false", isPlanActive(null) === false);
check("isPlanActive(undefined) is false", isPlanActive(undefined) === false);
check("needsPayment is the inverse of active", needsPayment("active") === false && needsPayment("none") === true);
check("isInactiveStatus('active') is false", isInactiveStatus("active") === false);
check("isInactiveStatus('past_due')", isInactiveStatus("past_due"));

// ---------------------------------------------------------------------------
console.log("\n[3] The status vocabulary is closed");
check("seven statuses", SUBSCRIPTION_STATUSES.length === 7);
check("accepts a real status", isSubscriptionStatus("active"));
check("rejects a bogus status", isSubscriptionStatus("paid") === false);
check("rejects a non-string", isSubscriptionStatus(3) === false);
check("i18n key is namespaced", subscriptionStatusKey("past_due") === "subscription.status.past_due");

// ---------------------------------------------------------------------------
console.log("\n[4] Wiring: signals-checkout never activates the plan");
const checkout = read("supabase/functions/signals-checkout/index.ts").replace(/\/\/[^\n]*/g, "");
check("enforces the shared payments gate", checkout.includes('from "../_shared/payments-flag.ts"'));
check("calls isPaymentsEnabled()", checkout.includes("isPaymentsEnabled()"));
check("fails closed when payments are off (503)", /!isPaymentsEnabled\(\)[\s\S]{0,160}503/.test(checkout));
check("requires the activation flow to be on (503)", /!config\.enabled[\s\S]{0,160}503/.test(checkout));
check("derives the user from the JWT", checkout.includes("requireUser(req)"));
check("never reads a body user id", !/body\.user_?id|json\.user_?id/.test(checkout));
check("requires an approved activation (403)", /status !== "approved"[\s\S]{0,120}403/.test(checkout));
check("refuses when already active (409)", /already_active[\s\S]{0,60}409/.test(checkout));
check("the Stripe price comes from a secret", checkout.includes("STRIPE_PRICE_SIGNALS_MONTHLY"));
check("the price is never taken from the request", !/body\.price|json\.price/.test(checkout));
check("creates a subscription-mode Checkout Session", /"mode",\s*"subscription"/.test(checkout));
check("records only 'pending', never 'active'", /subscription_status:\s*"pending"/.test(checkout) && !/subscription_status:\s*"active"/.test(checkout));
check("rate-limits per ip and per user", checkout.includes("`ip:${ip}`") && checkout.includes("`user:${ctx.user.id}`"));
check("makes no Tradovate call", !/restService|authService|tradovateapi/.test(checkout));
check("stores no broker credential", !/password|\bcid\b|client_secret\b/i.test(checkout));

// ---------------------------------------------------------------------------
console.log("\n[5] Wiring: stripe-webhook drives the plan state");
const webhook = read("supabase/functions/stripe-webhook/index.ts").replace(/\/\/[^\n]*/g, "");
check("handles checkout.session.completed", webhook.includes('"checkout.session.completed"'));
check("handles invoice.paid", webhook.includes('"invoice.paid"'));
check("handles invoice.payment_failed", webhook.includes('"invoice.payment_failed"'));
check("handles customer.subscription.updated", webhook.includes('"customer.subscription.updated"'));
check("handles customer.subscription.deleted", webhook.includes('"customer.subscription.deleted"'));
check("maps through the shared module", webhook.includes("stripeSubscriptionToStatus("));
// Scope to the signals section so the legacy pending_payments handler (which
// also mentions these events) cannot satisfy the check by accident.
const signalsSection = webhook.slice(webhook.indexOf("function extractSignalsEvent"));
check("a failed payment deactivates (past_due)", /invoice\.payment_failed[\s\S]{0,260}"past_due"/.test(signalsSection));
check("a cancellation deactivates (canceled)", /customer\.subscription\.deleted[\s\S]{0,260}"canceled"/.test(signalsSection));
check("the session metadata identifies the signals subscription", webhook.includes('meta.kind !== "signals_subscription"'));
check("the legacy pending_payments flow is untouched", webhook.includes("pending_payment_id"));
check("idempotency via the append-only audit log", webhook.includes("payment_audit_log") && webhook.includes("23505"));
check("the audit row is scoped to account_activations", webhook.includes('payment_table: "account_activations"'));
check("the plan update only touches account_activations", webhook.includes('.from("account_activations").update('));
check("no Tradovate call", !/restService|authService|tradovateapi/.test(webhook));
check("no broker credential is read or stored", !/password|\bcid\b|client_secret\b/i.test(webhook));

// ---------------------------------------------------------------------------
console.log("\n[6] Wiring: stripe-portal resolves the signals customer");
const portal = read("supabase/functions/stripe-portal/index.ts").replace(/\/\/[^\n]*/g, "");
check("falls back to the activation customer", /account_activations[\s\S]{0,160}stripe_customer_id/.test(portal));
check("still reads the legacy pending payment first", portal.includes("pending_payments"));

// ---------------------------------------------------------------------------
console.log("\n[7] Wiring: migration is additive, constrained and credential-free");
const migration = read("supabase/migrations/20261011000000_signals_subscription.sql")
  .replace(/--[^\n]*/g, "");
check("adds subscription_status", /ADD COLUMN IF NOT EXISTS subscription_status/.test(migration));
check("adds stripe_customer_id", /ADD COLUMN IF NOT EXISTS stripe_customer_id/.test(migration));
check("adds stripe_subscription_id", /ADD COLUMN IF NOT EXISTS stripe_subscription_id/.test(migration));
check("constrains the status values", /subscription_status IN \(/.test(migration));
check("does not drop or rewrite anything", !/DROP TABLE|DROP COLUMN|TRUNCATE/.test(migration));
check("has no credential column", !/password|\bcid\b|secret/i.test(migration));
check("indexes the subscription id", /account_activations_stripe_subscription_idx/.test(migration));

// ---------------------------------------------------------------------------
console.log("\n[8] Wiring: the client mirrors the server rule");
const client = read("src/lib/subscriptionStatus.ts");
check("client treats only 'active' as active", /status === "active"/.test(client));
check("client fails closed on an unknown value", /isSubscriptionStatus\(value\) \? value : "none"/.test(client));
const billing = read("src/lib/signalsBilling.ts");
check("billing calls signals-checkout", billing.includes('"signals-checkout"'));
check("billing calls stripe-portal", billing.includes('"stripe-portal"'));
check("billing never sends a price or plan id", !/priceId|price_id/.test(billing));
check("billing sends no body user id", !/user_id|userId/.test(billing));

// ---------------------------------------------------------------------------
console.log("\n[9] The payments gate governs this surface too");
check("isPaymentsEnabled is a pure boolean here", typeof isPaymentsEnabled() === "boolean");

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
