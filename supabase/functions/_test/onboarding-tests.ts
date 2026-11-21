// ============================================================================
// onboarding-tests — customer onboarding + managed-account lifecycle.
//
// Run: deno run -A supabase/functions/_test/onboarding-tests.ts
//
// Covers the required scenarios without network or DB:
//   paid user onboarding, unpaid user cannot activate, cross-user account-link
//   access, duplicate submission, operator approval/rejection, disconnected,
//   suspended, disabled execution kill switch, and refund/cancellation.
//
// The pure resolvers are exercised directly; the wiring assertions pin the
// security-critical lines in the Edge Functions and the migration.
// ============================================================================

import {
  PAYMENT_NOT_CONFIRMED,
  normalizePaymentStatus,
  resolveEntitlement,
  type PaymentRowLike,
} from "../_shared/activation/entitlement.ts";
import {
  ACTION_RESULT,
  ACTIVATION_STATUSES,
  blocksNewSubmission,
  canReview,
  isActivationStatus,
} from "../_shared/activation/status.ts";
import {
  EXECUTION_CAPABILITY_IMPLEMENTED,
  isExecutionCapabilityEnabled,
} from "../_shared/features.ts";
import {
  ACTIVATION_STATUSES as CLIENT_STATUSES,
  blocksNewSubmission as clientBlocksNewSubmission,
  canReview as clientCanReview,
} from "../../../src/lib/activationStatus.ts";
import {
  paymentReasonLabelKey,
  resolveOnboardingStep,
} from "../../../src/lib/onboarding.ts";

const ROOT = new URL("../../../", import.meta.url);
const read = (p: string) => Deno.readTextFileSync(new URL(p, ROOT));
const stripComments = (s: string) =>
  s.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

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

const CONFIRMED: PaymentRowLike = {
  id: "pay-1",
  plan_id: "professional",
  plan_name: "Professional",
  status_enum: "confirmed",
  method: "stripe",
  metadata: {},
};

// ---------------------------------------------------------------------------
console.log("\n[1] Paid user onboarding");
const paid = resolveEntitlement(CONFIRMED, { testMode: false });
check("confirmed payment is entitled", paid.entitled === true);
check("reason is confirmed", paid.reason === "confirmed");
check("plan key comes from the payment row", paid.planKey === "professional");
check("plan name comes from the payment row", paid.planName === "Professional");
check("payment id is carried", paid.paymentId === "pay-1");
check("legacy payment_confirmed is accepted",
  resolveEntitlement({ ...CONFIRMED, status_enum: "payment_confirmed" }).entitled === true);
check("status falls back to the legacy status column",
  resolveEntitlement({ ...CONFIRMED, status_enum: null, status: "confirmed" }).entitled === true);
check("onboarding step is form for a paid user with no link",
  resolveOnboardingStep({ enabled: true, entitled: true, status: null }) === "form");
check("payment label is the confirmed copy",
  paymentReasonLabelKey(paid.reason) === "onboarding.paymentConfirmed");

// ---------------------------------------------------------------------------
console.log("\n[2] Unpaid user cannot activate");
check("no payment row -> not entitled", resolveEntitlement(null).entitled === false);
check("no payment row -> no_payment", resolveEntitlement(null).reason === "no_payment");
check("pending payment -> not entitled",
  resolveEntitlement({ ...CONFIRMED, status_enum: "pending" }).entitled === false);
check("processing payment -> not entitled",
  resolveEntitlement({ ...CONFIRMED, status_enum: "processing" }).entitled === false);
check("unknown plan -> not entitled",
  resolveEntitlement({ ...CONFIRMED, plan_id: "platinum" }).entitled === false);
check("unknown plan reason", resolveEntitlement({ ...CONFIRMED, plan_id: "platinum" }).reason === "unknown_plan");
check("test payment in live mode -> not entitled",
  resolveEntitlement({ ...CONFIRMED, metadata: { is_test: true } }, { testMode: false }).entitled === false);
check("test payment in test mode -> entitled",
  resolveEntitlement({ ...CONFIRMED, metadata: { is_test: true } }, { testMode: true }).entitled === true);
check("unpaid user step is payment_required",
  resolveOnboardingStep({ enabled: true, entitled: false, status: null }) === "payment_required");

const submit = stripComments(read("supabase/functions/activation-submit/index.ts"));
check("submit reads the payment with the service role", submit.includes('from("pending_payments")'));
check("submit scopes the payment to the JWT user",
  /\.eq\(\s*"user_id",\s*ctx\.user\.id\s*\)/.test(submit));
check("submit resolves the entitlement server-side", submit.includes("resolveEntitlement("));
check("submit refuses an unentitled user with payment_not_confirmed",
  submit.includes("PAYMENT_NOT_CONFIRMED") && /402/.test(submit));
check("submit never reads a plan key or payment status from the form",
  !/form\.get\(\s*["'](plan_?key|plan_?id|payment_?status|status)["']/.test(submit));
check("the canonical error code is stable", PAYMENT_NOT_CONFIRMED === "payment_not_confirmed");

// ---------------------------------------------------------------------------
console.log("\n[3] Cross-user account-link access");
const accountLink = stripComments(read("supabase/functions/account-link/index.ts"));
check("account-link derives the user from the JWT", accountLink.includes("requireUser(req)"));
check("account-link never reads a body/query user id",
  !/parsed\.value\.user_?id|searchParams\.get\(\s*["']user_?id["']/.test(accountLink));
check("account-link scopes the read to the JWT user",
  /\.eq\(\s*"user_id",\s*ctx\.user\.id\s*\)/.test(accountLink));
check("account-link scopes the disconnect update to the JWT user",
  /\.update\([\s\S]{0,400}?\.eq\(\s*"id",\s*id\s*\)[\s\S]{0,120}?\.eq\(\s*"user_id",\s*ctx\.user\.id\s*\)/.test(accountLink));
check("a foreign id answers 404, not 403", /not_found[\s\S]{0,40}404/.test(accountLink));
const migration = read("supabase/migrations/20261122000000_account_link_lifecycle.sql");
const baseMigration = read("supabase/migrations/20261010000000_account_activation.sql");
check("RLS remains enabled", /ENABLE ROW LEVEL SECURITY/.test(baseMigration));
check("owner-only SELECT policy remains",
  /account_activations_owner_select[\s\S]{0,160}user_id = auth\.uid\(\)/.test(baseMigration));
check("client INSERT remains denied",
  /account_activations_no_client_insert[\s\S]{0,120}WITH CHECK \(false\)/.test(baseMigration));

// ---------------------------------------------------------------------------
console.log("\n[4] Duplicate account-link submission");
check("pending blocks", blocksNewSubmission("pending"));
check("in_review blocks", blocksNewSubmission("in_review"));
check("approved blocks", blocksNewSubmission("approved"));
check("suspended blocks", blocksNewSubmission("suspended"));
check("rejected does not block", blocksNewSubmission("rejected") === false);
check("disconnected does not block", blocksNewSubmission("disconnected") === false);
check("submit uses the shared duplicate rule", submit.includes("blocksNewSubmission("));
check("submit answers 409 for a duplicate", /409/.test(submit));
check("duplicate response distinguishes active from pending",
  submit.includes('"already_active"') && submit.includes('"already_pending"'));

// ---------------------------------------------------------------------------
console.log("\n[5] Operator approval and rejection");
check("pending -> approved is legal", canReview("pending", "approved"));
check("in_review -> approved is legal", canReview("in_review", "approved"));
check("pending -> rejected is legal", canReview("pending", "rejected"));
check("approve maps to approved", ACTION_RESULT.approve === "approved");
check("reject maps to rejected", ACTION_RESULT.reject === "rejected");
const review = stripComments(read("supabase/functions/activation-review/index.ts"));
check("review requires an operator", review.includes("requireOperator(req)"));
check("review refuses an illegal transition", review.includes("invalid_transition"));
check("review writes the audit helper", review.includes("logAccountLinkEvent("));
check("approval records both approved and connected events",
  review.includes('"approved", "connected"'));
check("rejection records a rejected event", review.includes('"rejected"'));

// ---------------------------------------------------------------------------
console.log("\n[6] Disconnected account");
check("approved -> disconnected is legal", canReview("approved", "disconnected"));
check("suspended -> disconnected is legal", canReview("suspended", "disconnected"));
check("disconnected is terminal", canReview("disconnected", "approved") === false);
check("disconnect maps to disconnected", ACTION_RESULT.disconnect === "disconnected");
check("review records a disconnected event", review.includes('"disconnected"'));
check("customer disconnect is audited", accountLink.includes("logAccountLinkEvent(") && accountLink.includes('"disconnected"'));
check("disconnected state is a real status", isActivationStatus("disconnected"));
check("onboarding step for a disconnected paid user is form",
  resolveOnboardingStep({ enabled: true, entitled: true, status: "disconnected" }) === "form");
check("an information request lets a paid customer resubmit",
  resolveOnboardingStep({ enabled: true, entitled: true, status: "info_requested" }) === "info_needed");
check("an unpaid information request is sent back to payment",
  resolveOnboardingStep({ enabled: true, entitled: false, status: "info_requested" }) === "payment_required");

// ---------------------------------------------------------------------------
console.log("\n[7] Suspended account");
check("approved -> suspended is legal", canReview("approved", "suspended"));
check("suspended -> approved (reinstate) is legal", canReview("suspended", "approved"));
check("suspend maps to suspended", ACTION_RESULT.suspend === "suspended");
check("reinstate maps to approved", ACTION_RESULT.reinstate === "approved");
check("review records a suspended event", review.includes('"suspended"'));
check("review records a reinstated event", review.includes('"reinstated"'));
check("onboarding step for a suspended user is suspended",
  resolveOnboardingStep({ enabled: true, entitled: true, status: "suspended" }) === "suspended");

// ---------------------------------------------------------------------------
console.log("\n[8] Disabled execution kill switch");
check("unset -> disabled", isExecutionCapabilityEnabled({}) === false);
check("empty -> disabled", isExecutionCapabilityEnabled({ EXECUTION_CAPABILITY_ENABLED: "" }) === false);
check("false -> disabled", isExecutionCapabilityEnabled({ EXECUTION_CAPABILITY_ENABLED: "false" }) === false);
check("only exact true enables", isExecutionCapabilityEnabled({ EXECUTION_CAPABILITY_ENABLED: "true" }) === true);
check("no execution implementation ships", EXECUTION_CAPABILITY_IMPLEMENTED === false);
check("account-link reports implemented:false",
  accountLink.includes("implemented: EXECUTION_CAPABILITY_IMPLEMENTED"));
check("account-link exposes the execution flag", accountLink.includes("isExecutionCapabilityEnabled()"));
const features = read("supabase/functions/_shared/features.ts");
check("the kill switch is registered", features.includes("EXECUTION_CAPABILITY_ENABLED"));
check("no order/liquidation/payout endpoint was added",
  !["place-order", "orders", "liquidate", "copy-trade", "payout", "ach", "wire"].some((name) => {
    try {
      Deno.statSync(new URL(`supabase/functions/${name}`, ROOT));
      return true;
    } catch {
      return false;
    }
  }));

// ---------------------------------------------------------------------------
console.log("\n[9] Payment refund or cancellation state");
check("refunded is not entitled",
  resolveEntitlement({ ...CONFIRMED, status_enum: "refunded" }).entitled === false);
check("refunded reason", resolveEntitlement({ ...CONFIRMED, status_enum: "refunded" }).reason === "payment_refunded");
check("canceled is not entitled",
  resolveEntitlement({ ...CONFIRMED, status_enum: "canceled" }).entitled === false);
check("canceled reason", resolveEntitlement({ ...CONFIRMED, status_enum: "canceled" }).reason === "payment_canceled");
check("cancelled spelling is normalized", normalizePaymentStatus({ status_enum: "CANCELLED" }) === "cancelled");
check("failed is not entitled",
  resolveEntitlement({ ...CONFIRMED, status_enum: "failed" }).entitled === false);
check("disputed is not entitled",
  resolveEntitlement({ ...CONFIRMED, status_enum: "disputed" }).entitled === false);
check("refund label is the refunded copy",
  paymentReasonLabelKey("payment_refunded") === "onboarding.paymentRefunded");
check("cancel label is the canceled copy",
  paymentReasonLabelKey("payment_canceled") === "onboarding.paymentCanceled");
check("a refunded paid user is sent back to payment_required",
  resolveOnboardingStep({ enabled: true, entitled: false, status: "disconnected" }) === "payment_required");

// ---------------------------------------------------------------------------
console.log("\n[10] Client and server lifecycle agree");
check("same status vocabulary",
  JSON.stringify(CLIENT_STATUSES) === JSON.stringify(ACTIVATION_STATUSES));
for (const from of ACTIVATION_STATUSES) {
  for (const to of ACTIVATION_STATUSES) {
    if (clientCanReview(from, to) !== canReview(from, to)) {
      check(`client/server transition ${from} -> ${to} agrees`, false);
    }
  }
  if (clientBlocksNewSubmission(from) !== blocksNewSubmission(from)) {
    check(`client/server duplicate rule agrees for ${from}`, false);
  }
}
check("client and server transition rules agree", true);

// ---------------------------------------------------------------------------
console.log("\n[11] Migration is additive and covers the new lifecycle");
check("new statuses are allowed", /'suspended','disconnected'/.test(migration));
check("payment linkage columns exist",
  migration.includes("braxel_plan_key") && migration.includes("payment_id") && migration.includes("payment_status"));
check("lifecycle timestamps exist",
  migration.includes("connected_at") && migration.includes("suspended_at") && migration.includes("disconnected_at"));
check("no broker credential column is added",
  !/password|cid|secret/i.test(stripComments(migration).replace(/--[^\n]*/g, "")));

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
