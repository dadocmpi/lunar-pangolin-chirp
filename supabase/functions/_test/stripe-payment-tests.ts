// ============================================================================
// Stripe checkout verification tests (no network, no DB, no secrets).
//
// Run: deno run -A supabase/functions/_test/stripe-payment-tests.ts
// ============================================================================

import {
  applicationPaymentStatusFor,
  mapStripeSubscriptionStatus,
  wasEventProcessed,
} from "../_shared/stripe/status.ts";
import { verifyStripeSignature } from "../_shared/stripe/signature.ts";
import {
  expectedPriceIdForPlan,
  isCanonicalPlanId,
  verifyCheckoutSession,
  verifyInvoicePaid,
  type StripeCheckoutSessionLike,
  type StripeInvoiceLike,
  type StripeSubscriptionLike,
  type StripeVerificationContext,
} from "../_shared/stripe/verification.ts";
import { resolveEntitlement } from "../_shared/activation/entitlement.ts";

let passed = 0;
let failed = 0;

function ok(condition: boolean, name: string) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name}`);
  }
}

function eq(actual: unknown, expected: unknown, name: string) {
  ok(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${name} (expected ${JSON.stringify(expected)}, got ${
      JSON.stringify(actual)
    })`,
  );
}

const PRICE = {
  id: "price_starter",
  currency: "usd",
  unit_amount: 20_000,
  recurring: { interval: "month" },
};

const PENDING = {
  id: "pp_1",
  user_id: "user_1",
  plan_id: "starter",
  plan_name: "Starter",
  amount_cents: 20_000,
  currency: "USD",
  status: "pending",
  status_enum: "pending",
  metadata: {
    application_id: "app_1",
    stripe_customer_id: "cus_1",
    stripe_subscription_id: "sub_1",
  },
};

const CUSTOMER = {
  id: "cus_1",
  email: "customer@example.com",
  metadata: { user_id: "user_1" },
};

const SUBSCRIPTION: StripeSubscriptionLike = {
  id: "sub_1",
  status: "active",
  customer: "cus_1",
  metadata: {
    pending_payment_id: "pp_1",
    user_id: "user_1",
    plan_id: "starter",
  },
  items: { data: [{ price: PRICE, quantity: 1 }] },
};

const SESSION: StripeCheckoutSessionLike = {
  id: "cs_1",
  mode: "subscription",
  payment_status: "paid",
  amount_total: 20_000,
  currency: "usd",
  customer: "cus_1",
  subscription: "sub_1",
  metadata: {
    pending_payment_id: "pp_1",
    user_id: "user_1",
    plan_id: "starter",
    application_id: "app_1",
  },
  line_items: { data: [{ price: PRICE, quantity: 1 }] },
};

const INVOICE: StripeInvoiceLike = {
  id: "in_1",
  status: "paid",
  paid: true,
  amount_paid: 20_000,
  currency: "usd",
  customer: "cus_1",
  subscription: "sub_1",
  payment_intent: "pi_1",
  period_end: 1_800_000_000,
  subscription_details: { metadata: { pending_payment_id: "pp_1" } },
};

const CTX: StripeVerificationContext = {
  pending: PENDING,
  expectedPriceId: "price_starter",
  customer: CUSTOMER,
  userEmail: "customer@example.com",
  subscription: SUBSCRIPTION,
};

console.log("\n[1] Failed renewal maps to a valid, non-active status");
eq(mapStripeSubscriptionStatus("past_due"), "failed", "past_due -> failed");
eq(mapStripeSubscriptionStatus("unpaid"), "failed", "unpaid -> failed");
eq(
  mapStripeSubscriptionStatus("incomplete_expired"),
  "failed",
  "incomplete_expired -> failed",
);
eq(mapStripeSubscriptionStatus("incomplete"), "failed", "incomplete -> failed");
eq(mapStripeSubscriptionStatus("trialing"), "pending", "trialing -> pending");
eq(mapStripeSubscriptionStatus("paused"), "pending", "paused -> pending");
eq(mapStripeSubscriptionStatus("canceled"), "canceled", "canceled -> canceled");
eq(mapStripeSubscriptionStatus("active"), "confirmed", "active -> confirmed");
eq(
  mapStripeSubscriptionStatus("something_new"),
  "failed",
  "unknown status fails closed to failed",
);
eq(
  applicationPaymentStatusFor("failed"),
  "failed",
  "application payment status is failed, never payment_confirmed",
);
const failedEntitlement = resolveEntitlement({
  id: "pp_1",
  plan_id: "starter",
  status_enum: "failed",
});
ok(!failedEntitlement.entitled, "failed payment is not entitled");
eq(
  failedEntitlement.reason,
  "payment_failed",
  "failed payment entitlement reason",
);

console.log("\n[2] Invalid status transition / no invalid Stripe strings");
const webhookSource = Deno.readTextFileSync(
  new URL("../stripe-webhook/index.ts", import.meta.url),
);
ok(
  !/status_enum:\s*"past_due"/.test(webhookSource) &&
    !/status_enum:\s*"incomplete"/.test(webhookSource) &&
    !/status_enum:\s*"trialing"/.test(webhookSource),
  "webhook never writes raw Stripe lifecycle strings",
);
const confirmationSource = Deno.readTextFileSync(
  new URL("../_shared/stripe/confirmation.ts", import.meta.url),
);
ok(
  confirmationSource.includes("status: next") &&
    confirmationSource.includes("status_enum: next"),
  "webhook writes both status columns from the canonical mapping",
);
ok(
  !/new_status:\s*"payment_confirmed"/.test(confirmationSource),
  "audit log uses canonical confirmed, not the legacy payment_confirmed enum",
);
ok(
  !/previous_status:.*payment_confirmed/.test(webhookSource),
  "refund/dispute audit never writes the legacy payment_confirmed enum",
);
const reconcileSource = Deno.readTextFileSync(
  new URL("../stripe-reconcile/index.ts", import.meta.url),
);
ok(
  /confirmFromCheckoutSession\([\s\S]*?ctx\.user\.id/.test(reconcileSource) &&
    /confirmFromInvoicePaid\([\s\S]*?ctx\.user\.id/.test(reconcileSource),
  "reconcile scopes confirmation to the JWT user",
);
const notPaid = verifyCheckoutSession(CTX, {
  ...SESSION,
  payment_status: "unpaid",
});
eq(notPaid.reason, "not_paid", "unpaid checkout is rejected");

console.log("\n[3] Wrong amount");
eq(
  verifyCheckoutSession(CTX, { ...SESSION, amount_total: 19_999 }).reason,
  "wrong_amount",
  "checkout amount mismatch is rejected",
);
eq(
  verifyInvoicePaid(CTX, { ...INVOICE, amount_paid: 19_999 }, SUBSCRIPTION).reason,
  "wrong_amount",
  "invoice amount mismatch is rejected",
);

console.log("\n[4] Wrong currency");
eq(
  verifyCheckoutSession(CTX, { ...SESSION, currency: "eur" }).reason,
  "wrong_currency",
  "checkout currency mismatch is rejected",
);
eq(
  verifyInvoicePaid(CTX, { ...INVOICE, currency: "eur" }, SUBSCRIPTION).reason,
  "wrong_currency",
  "invoice currency mismatch is rejected",
);

console.log("\n[5] Wrong Price ID");
eq(
  verifyCheckoutSession(CTX, {
    ...SESSION,
    line_items: {
      data: [{ price: { ...PRICE, id: "price_other" }, quantity: 1 }],
    },
  }).reason,
  "wrong_price",
  "checkout Price ID mismatch is rejected",
);
eq(
  verifyInvoicePaid(CTX, INVOICE, {
    ...SUBSCRIPTION,
    items: {
      data: [{ price: { ...PRICE, id: "price_other" }, quantity: 1 }],
    },
  }).reason,
  "wrong_price",
  "invoice subscription Price ID mismatch is rejected",
);

console.log("\n[6] Forged webhook");
const secret = "whsec_test";
const body = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });
const timestamp = 1_700_000_000;
const encoder = new TextEncoder();
const key = await crypto.subtle.importKey(
  "raw",
  encoder.encode(secret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"],
);
const mac = await crypto.subtle.sign(
  "HMAC",
  key,
  encoder.encode(`${timestamp}.${body}`),
);
const validSig = Array.from(new Uint8Array(mac))
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");
const header = `t=${timestamp},v1=${validSig}`;

ok(
  (await verifyStripeSignature(body, header, secret, {
    nowSeconds: timestamp,
  })).ok === true,
  "valid signature is accepted",
);
ok(
  (await verifyStripeSignature(body, header, "whsec_wrong", {
    nowSeconds: timestamp,
  })).ok === false,
  "wrong secret is rejected",
);
ok(
  (await verifyStripeSignature(`${body} `, header, secret, {
    nowSeconds: timestamp,
  })).ok === false,
  "tampered body is rejected",
);
ok(
  (await verifyStripeSignature(body, header, secret, {
    nowSeconds: timestamp + 301,
  })).ok === false,
  "expired timestamp is rejected",
);
ok(
  (await verifyStripeSignature(body, "t=1,v1=zz", secret)).ok === false,
  "malformed signature is rejected",
);

console.log("\n[7] Duplicate webhook");
ok(
  wasEventProcessed({ processed_event_ids: ["evt_1"] }, "evt_1") === true,
  "processed event is detected",
);
ok(
  wasEventProcessed({ processed_event_ids: ["evt_1"] }, "evt_2") === false,
  "new event is not treated as processed",
);
ok(
  wasEventProcessed({}, "evt_1") === false,
  "missing processed_event_ids is not a match",
);

console.log("\n[8] Delayed checkout.session.completed / invoice.paid recovery");
eq(
  verifyInvoicePaid(CTX, INVOICE, SUBSCRIPTION).reason,
  "ok",
  "verified invoice.paid can confirm a pending payment",
);
eq(
  verifyInvoicePaid(CTX, { ...INVOICE, status: "open", paid: false }, SUBSCRIPTION)
    .reason,
  "not_paid",
  "unpaid invoice is rejected",
);
eq(
  verifyInvoicePaid(CTX, INVOICE, { ...SUBSCRIPTION, status: "past_due" }).reason,
  "subscription_not_active",
  "inactive subscription invoice is rejected",
);

console.log("\n[9] Unknown Signals Plan");
ok(isCanonicalPlanId("signals") === false, "signals is not a canonical plan");
eq(
  expectedPriceIdForPlan("signals", {
    STRIPE_PRICE_SIGNALS: "price_signals",
  }),
  null,
  "no Stripe Price ID is invented for signals",
);
eq(
  verifyCheckoutSession(
    { ...CTX, pending: { ...PENDING, plan_id: "signals" } },
    SESSION,
  ).reason,
  "unknown_plan",
  "signals checkout is rejected as unknown_plan",
);
const signalsEntitlement = resolveEntitlement({
  id: "pp_signals",
  plan_id: "signals",
  status_enum: "confirmed",
});
ok(!signalsEntitlement.entitled, "signals payment is not entitled");
eq(
  signalsEntitlement.reason,
  "unknown_plan",
  "signals entitlement reason is unknown_plan",
);

console.log("\n[10] Browser success page without a verified webhook");
const successPage = Deno.readTextFileSync(
  new URL("../../../src/pages/CheckoutSuccess.tsx", import.meta.url),
);
ok(
  successPage.includes('serverStatus?.status === "confirmed"'),
  "success page only completes when the server says confirmed",
);
ok(
  !/activate-account|application-activate/.test(successPage),
  "success page never activates an account",
);
const paymentStatusSource = Deno.readTextFileSync(
  new URL("../payment-status/index.ts", import.meta.url),
);
ok(
  paymentStatusSource.includes('.eq("user_id", user.id)'),
  "payment-status is ownership-scoped",
);

console.log("\n[11] Customer and subscription identity");
eq(
  verifyCheckoutSession(CTX, {
    ...SESSION,
    customer: "cus_other",
  }).reason,
  "customer_mismatch",
  "checkout customer mismatch is rejected",
);
eq(
  verifyCheckoutSession(CTX, {
    ...SESSION,
    subscription: "sub_other",
  }).reason,
  "subscription_mismatch",
  "checkout subscription mismatch is rejected",
);
eq(
  verifyInvoicePaid(CTX, INVOICE, {
    ...SUBSCRIPTION,
    metadata: { pending_payment_id: "pp_other", user_id: "user_1" },
  }).reason,
  "subscription_mismatch",
  "invoice subscription metadata mismatch is rejected",
);

console.log("\n[12] Price ID comes from the canonical plan env mapping");
eq(
  expectedPriceIdForPlan("starter", {
    STRIPE_PRICE_STARTER_USD: "price_starter",
  }),
  "price_starter",
  "starter Price ID is read from its own env var",
);
eq(
  expectedPriceIdForPlan("starter", {
    STRIPE_PRICE_PROFESSIONAL_USD: "price_professional",
  }),
  null,
  "missing plan Price ID is rejected",
);

console.log("\n[13] Payment refund and cancellation state");
eq(
  applicationPaymentStatusFor("refunded"),
  "refunded",
  "refunded application status stays refunded",
);
eq(
  applicationPaymentStatusFor("canceled"),
  "canceled",
  "canceled application status stays canceled",
);
const refundedEntitlement = resolveEntitlement({
  id: "pp_refund",
  plan_id: "starter",
  status_enum: "refunded",
});
ok(!refundedEntitlement.entitled, "refunded payment is not entitled");
eq(
  refundedEntitlement.reason,
  "payment_refunded",
  "refunded entitlement reason",
);
const canceledEntitlement = resolveEntitlement({
  id: "pp_cancel",
  plan_id: "starter",
  status_enum: "canceled",
});
ok(!canceledEntitlement.entitled, "canceled payment is not entitled");
eq(
  canceledEntitlement.reason,
  "payment_canceled",
  "canceled entitlement reason",
);
ok(
  webhookSource.includes('status: "refunded"') &&
    webhookSource.includes('status_enum: "refunded"'),
  "charge.refunded writes both canonical status columns",
);
ok(
  webhookSource.includes('status: "disputed"') &&
    webhookSource.includes('status_enum: "disputed"'),
  "charge.dispute.created writes both canonical status columns",
);

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
