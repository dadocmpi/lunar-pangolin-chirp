// ============================================================================
// activation-review-tests — the operator review path.
//
// Run: deno run -A supabase/functions/_test/activation-review-tests.ts
//
// Exercises the pure state machine + operator predicate and asserts the
// security wiring in activation-review: operator-only (app_metadata.operator),
// one legal status transition per action, an append-only audit row, a
// short-lived signed receipt URL, and no Tradovate call.
// ============================================================================

import {
  ACTION_RESULT,
  ACTIVATION_STATUSES,
  canReview,
  isActivationStatus,
  isOpenStatus,
  type ActivationStatus,
  type ReviewAction,
} from "../_shared/activation/status.ts";
import { isOperatorMeta } from "../_shared/activation/operator.ts";
import { ACTIVATION_FIELD_LIMITS, cleanText } from "../_shared/activation/limits.ts";

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
console.log("\n[1] Operator predicate: only app_metadata.operator === true");
check("true is an operator", isOperatorMeta({ operator: true }));
check("false is not", isOperatorMeta({ operator: false }) === false);
check("\"true\" (string) is not", isOperatorMeta({ operator: "true" }) === false);
check("1 is not", isOperatorMeta({ operator: 1 }) === false);
check("missing flag is not", isOperatorMeta({}) === false);
check("null meta is not", isOperatorMeta(null) === false);
check("undefined meta is not", isOperatorMeta(undefined) === false);
check("string meta is not", isOperatorMeta("operator") === false);

// ---------------------------------------------------------------------------
console.log("\n[2] Status vocabulary is exactly the client-visible set");
check("five statuses", ACTIVATION_STATUSES.length === 5);
check(
  "isActivationStatus accepts a real status",
  isActivationStatus("approved"),
);
check("isActivationStatus rejects a bogus status", isActivationStatus("cancelled") === false);
check("isActivationStatus rejects a non-string", isActivationStatus(7) === false);

// ---------------------------------------------------------------------------
console.log("\n[3] Every action maps to exactly one status");
check("start_review -> in_review", ACTION_RESULT.start_review === "in_review");
check("approve -> approved", ACTION_RESULT.approve === "approved");
check("reject -> rejected", ACTION_RESULT.reject === "rejected");
check("request_info -> info_requested", ACTION_RESULT.request_info === "info_requested");

// ---------------------------------------------------------------------------
console.log("\n[4] Legal transitions only");
const actions: ReviewAction[] = ["start_review", "approve", "reject", "request_info"];
// Exhaustive truth table: pending/in_review/info_requested can move; terminal
// states are frozen.
const allowed: Record<ActivationStatus, ActivationStatus[]> = {
  pending: ["in_review", "approved", "rejected", "info_requested"],
  in_review: ["approved", "rejected", "info_requested"],
  info_requested: ["in_review", "approved", "rejected"],
  approved: [],
  rejected: [],
};
for (const from of ACTIVATION_STATUSES) {
  for (const to of ACTIVATION_STATUSES) {
    const expect = allowed[from].includes(to);
    check(`${from} -> ${to} is ${expect ? "legal" : "blocked"}`, canReview(from, to) === expect);
  }
}
// A terminal state can never be re-opened by any action.
for (const a of actions) {
  check(`approved cannot be re-opened by ${a}`, canReview("approved", ACTION_RESULT[a]) === false);
  check(`rejected cannot be re-opened by ${a}`, canReview("rejected", ACTION_RESULT[a]) === false);
}

// ---------------------------------------------------------------------------
console.log("\n[5] Open status blocks a duplicate submit; decided does not");
check("pending is open", isOpenStatus("pending"));
check("in_review is open", isOpenStatus("in_review"));
check("info_requested is not open", isOpenStatus("info_requested") === false);
check("approved is not open", isOpenStatus("approved") === false);
check("rejected is not open", isOpenStatus("rejected") === false);

// ---------------------------------------------------------------------------
console.log("\n[6] Operator note limits");
check(
  "note is capped to the operator limit",
  cleanText("x".repeat(999), ACTIVATION_FIELD_LIMITS.operatorNote).length ===
    ACTIVATION_FIELD_LIMITS.operatorNote,
);
check("note is trimmed", cleanText("  hi  ", 100) === "hi");
check("non-string note -> empty", cleanText(42, 100) === "");

// ---------------------------------------------------------------------------
console.log("\n[7] Wiring: activation-review");
const review = read("supabase/functions/activation-review/index.ts");
check("operator-only via requireOperator", review.includes("requireOperator(req)"));
check("403 on a non-operator", review.includes("ForbiddenError") && /403/.test(review));
check("401 without a JWT", review.includes("UnauthorizedError") && /401/.test(review));
check("reads app_metadata from the admin API, not the token", review.includes("auth.admin") && review.includes("getUserById"));
check("uses the shared state machine", review.includes("canReview(") && review.includes("ACTION_RESULT"));
check("illegal transition -> 409", review.includes("invalid_transition") && /409/.test(review));
check("reject/request_info require a note", review.includes("note_required"));
check("writes the append-only audit log", review.includes("payment_audit_log") && review.includes('payment_table: "account_activations"'));
check("receipt via a SHORT-LIVED signed URL", review.includes("createSignedUrl(") && review.includes("SIGNED_URL_TTL_SECONDS"));
check("signed URL TTL is short (<= 600s)", /SIGNED_URL_TTL_SECONDS\s*=\s*(\d+)/.test(review) && Number(/SIGNED_URL_TTL_SECONDS\s*=\s*(\d+)/.exec(review)![1]) <= 600);
check("emails the customer through the shared userEmail module", review.includes("sendUserEmailInBackground("));
check("notifies the owner through the shared email module", review.includes("notifyOwnerInBackground("));
check("honours the runtime kill switch (503)", /!config\.enabled[\s\S]{0,120}503/.test(review));
check("no broker credential is ever read", !/password|cid|secret/i.test(review.replace(/\/\/[^\n]*/g, "")));
check(
  "makes no Tradovate API call",
  !/restService|authService|tradovateapi|tradovate-connect|tradovate-data/.test(review),
);

// ---------------------------------------------------------------------------
console.log("\n[8] Wiring: the migration enforces owner-only RLS + private bucket");
const migration = read("supabase/migrations/20261010000000_account_activation.sql");
check("table exists", /CREATE TABLE IF NOT EXISTS public\.account_activations/.test(migration));
check("RLS is enabled", /ENABLE ROW LEVEL SECURITY/.test(migration));
check("owner can read only their own rows", /account_activations_owner_select[\s\S]{0,160}user_id = auth\.uid\(\)/.test(migration));
check("operator can read all rows", /account_activations_operator_select[\s\S]{0,200}operator/.test(migration));
check("client INSERT is denied", /account_activations_no_client_insert[\s\S]{0,120}WITH CHECK \(false\)/.test(migration));
check("client UPDATE is denied", /account_activations_no_client_update[\s\S]{0,120}USING \(false\)/.test(migration));
check("client DELETE is denied", /account_activations_no_client_delete[\s\S]{0,120}USING \(false\)/.test(migration));
check("private bucket is created", /'activation-receipts',\s*'activation-receipts',\s*false/.test(migration));
check("storage objects are user-scoped", /storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/.test(migration));
check("no broker credential column exists", !/password|cid|secret/i.test(migration.replace(/--[^\n]*/g, "")));

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
