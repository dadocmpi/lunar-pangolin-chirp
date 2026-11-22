// ============================================================================
// stripe-confirmation-tests — payment confirmation hardening.
//
// Run: deno run -A supabase/functions/_test/stripe-confirmation-tests.ts
//
// Covers the three Stripe blockers without network or DB:
//   1. the DB accepts the past_due / lifecycle statuses,
//   2. a checkout session is only confirmed after full validation, and
//   3. a lost checkout.session.completed can be reconciled server-side.
//
// The pure validator is exercised directly; the wiring assertions pin the
// security-critical lines in the webhook, the reconcile function and the page.
// ============================================================================

import {
  validateCheckoutSession,
  type PendingPaymentLike,
  type StripeCheckoutSessionLike,
} from "../_shared/stripe/sessionValidation.ts";

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

const validSession: StripeCheckoutSessionLike = {
  id: "cs_test_1",
  mode: "subscription",
  currency: "usd",
  amount_total: 20000,
  payment_status: "paid",
  customer: "cus_1",
  subscription: "sub_1",
  metadata: { pending_payment_id: "pp_1", application_id: "app_1" },
};

const validPending: PendingPaymentLike = {
  id: "pp_1",
  user_id: "user_1",
  plan_id: "starter",
  amount_cents: 20000,
  currency: "USD",
  metadata: {},
  status_enum: "pending",
};

console.log("\n[1] Valid checkout session confirms");
{
  const r = validateCheckoutSession({
    session: validSession,
    pendingPayment: validPending,
    applicationPlanKey: "starter",
  });
  check("valid paid subscription session passes", r.ok === true);
}

console.log("\n[2] Invalid sessions are refused");
{
  const unpaid = validateCheckoutSession({
    session: { ...validSession, payment_status: "unpaid" },
    pendingPayment: validPending,
  });
  check("unpaid session is refused", unpaid.ok === false && unpaid.code === "payment_not_paid");

  const wrongMode = validateCheckoutSession({
    session: { ...validSession, mode: "payment" },
    pendingPayment: validPending,
  });
  check("non-subscription mode is refused", wrongMode.ok === false && wrongMode.code === "unexpected_mode");

  const wrongCurrency = validateCheckoutSession({
    session: { ...validSession, currency: "eur" },
    pendingPayment: validPending,
  });
  check("non-USD currency is refused", wrongCurrency.ok === false && wrongCurrency.code === "currency_mismatch");

  const underpaid = validateCheckoutSession({
    session: { ...validSession, amount_total: 100 },
    pendingPayment: validPending,
  });
  check("amount mismatch is refused", underpaid.ok === false && underpaid.code === "amount_mismatch");

  const missingAmount = validateCheckoutSession({
    session: { ...validSession, amount_total: undefined },
    pendingPayment: validPending,
  });
  check("missing amount is refused", missingAmount.ok === false && missingAmount.code === "invalid_amount");

  const planMismatch = validateCheckoutSession({
    session: validSession,
    pendingPayment: validPending,
    applicationPlanKey: "professional",
  });
  check("plan mismatch is refused", planMismatch.ok === false && planMismatch.code === "plan_mismatch");

  const noSubscription = validateCheckoutSession({
    session: { ...validSession, subscription: null },
    pendingPayment: validPending,
  });
  check("subscription mode without a subscription is refused", noSubscription.ok === false && noSubscription.code === "missing_subscription");

  const idMismatch = validateCheckoutSession({
    session: { ...validSession, metadata: { pending_payment_id: "other" } },
    pendingPayment: validPending,
  });
  check("session/pending id mismatch is refused", idMismatch.ok === false && idMismatch.code === "pending_payment_mismatch");

  const pendingCurrency = validateCheckoutSession({
    session: validSession,
    pendingPayment: { ...validPending, currency: "EUR" },
  });
  check("pending currency mismatch is refused", pendingCurrency.ok === false && pendingCurrency.code === "pending_currency_mismatch");

  const zeroExpected = validateCheckoutSession({
    session: validSession,
    pendingPayment: { ...validPending, amount_cents: 0 },
  });
  check("missing expected amount is refused", zeroExpected.ok === false && zeroExpected.code === "missing_expected_amount");
}

console.log("\n[3] A $0 trial invoice is allowed");
{
  const r = validateCheckoutSession({
    session: { ...validSession, amount_total: 0, payment_status: "no_payment_required" },
    pendingPayment: validPending,
  });
  check("zero-total no_payment_required passes", r.ok === true);
}

console.log("\n[4] Webhook validates before confirming");
{
  const webhook = read("supabase/functions/stripe-webhook/index.ts");
  check("webhook calls validateCheckoutSession", webhook.includes("validateCheckoutSession("));
  check("webhook calls applyCheckoutConfirmation", webhook.includes("applyCheckoutConfirmation("));
  check("webhook flags failed validations for manual review", webhook.includes("flagCheckoutForManualReview("));
  check(
    "webhook no longer writes status_enum: confirmed inline",
    !webhook.includes('status_enum: "confirmed"'),
  );
}

console.log("\n[5] Lost-event recovery is server-side and idempotent");
{
  const reconcile = read("supabase/functions/stripe-reconcile/index.ts");
  check("reconcile retrieves the session from Stripe", reconcile.includes("/checkout/sessions/"));
  check("reconcile reuses the shared validator", reconcile.includes("validateCheckoutSession("));
  check("reconcile applies the shared confirmation", reconcile.includes("applyCheckoutConfirmation("));
  check("reconcile is gated by the payments flag", reconcile.includes("isPaymentsEnabled("));
  check("reconcile is rate limited", reconcile.includes("createRateLimiter("));
  check("reconcile derives the user from the JWT", reconcile.includes("auth.getUser(token)"));

  const page = read("src/pages/CheckoutSuccess.tsx");
  check("success page calls stripe-reconcile", page.includes('functionsUrl("stripe-reconcile")'));
}

console.log("\n[6] Database accepts past_due and lifecycle statuses");
{
  const migration = read("supabase/migrations/20261123000000_payment_lifecycle_status.sql");
  check("migration widens pending_payments.status_enum", migration.includes("past_due"));
  check("migration converts applications.payment_status to text", migration.includes("ALTER COLUMN payment_status TYPE text"));
  check("migration is idempotent (ADD COLUMN IF NOT EXISTS)", migration.includes("ADD COLUMN IF NOT EXISTS confirmed_at"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) Deno.exit(1);
