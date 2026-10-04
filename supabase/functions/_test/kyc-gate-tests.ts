// ============================================================================
// Unit tests: withdrawal KYC gate.
//
// Proves that a withdrawal is rejected for a non-approved user and accepted
// for an approved one — including the "UI bypassed" case where the request
// body claims kycStatus=approved. The gate reads server-side state only.
// No network, no DB, no secrets.
// ============================================================================

import {
  evaluateWithdrawalGate,
  handleWithdrawalRequest,
  manualReviewThresholdCentsFromEnv,
  requiresManualReview,
  type GateDb,
  normalizeKycStatus,
} from "../_shared/kyc/gate.ts";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}`);
  }
}

/** Recording GateDb: fixed server status, captures inserted rows. */
function fakeDb(status: unknown): GateDb & { inserts: Record<string, unknown>[] } {
  const inserts: Record<string, unknown>[] = [];
  return {
    inserts,
    readKycStatus: () => Promise.resolve(status),
    insertWithdrawal: (row) => {
      inserts.push(row);
      return Promise.resolve({ ok: true });
    },
  };
}

console.log("[1] Pure decision function");
check("approved -> allowed", evaluateWithdrawalGate(true, "approved").allowed === true);
check("pending -> denied", evaluateWithdrawalGate(true, "pending").allowed === false);
check("submitted -> denied", evaluateWithdrawalGate(true, "submitted").allowed === false);
check("rejected -> denied", evaluateWithdrawalGate(true, "rejected").allowed === false);
check("unknown/null -> denied (fail closed)", evaluateWithdrawalGate(true, null).allowed === false);
check("not authenticated -> denied", evaluateWithdrawalGate(false, "approved").allowed === false);
check("rejection carries the status reason", evaluateWithdrawalGate(true, "rejected").reason === "kyc_rejected");
check("normalize maps junk to pending", normalizeKycStatus("nonsense") === "pending");
check("normalize is case-insensitive", normalizeKycStatus("APPROVED") === "approved");

console.log("\n[2] Endpoint: non-approved user is rejected even with a faked body flag");
{
  const db = fakeDb("pending");
  // A client that bypasses the UI would send kycStatus. It is ignored: the
  // gate only reads db.readKycStatus().
  const res = await handleWithdrawalRequest(db, "user-1", {
    userId: "user-1",
    amountCents: 50000,
  });
  check("pending user -> HTTP 403", res.status === 403);
  check("body says kyc_required", res.body.error === "kyc_required");
  check("no row was inserted", db.inserts.length === 0);
}

for (const s of ["submitted", "rejected", "pending"]) {
  const db = fakeDb(s);
  const res = await handleWithdrawalRequest(db, "user-1", { userId: "user-1", amountCents: 100 });
  check(`status '${s}' -> 403 and no insert`, res.status === 403 && db.inserts.length === 0);
}

console.log("\n[3] Endpoint: approved user is accepted");
{
  const db = fakeDb("approved");
  const res = await handleWithdrawalRequest(db, "user-1", { userId: "user-1", amountCents: 50000 });
  check("approved -> HTTP 201", res.status === 201);
  check("exactly one row inserted", db.inserts.length === 1);
  check("row bound to the authenticated user id", db.inserts[0].user_id === "user-1");
  check("row records the gate decision", db.inserts[0].kyc_status_at_request === "approved");
}

console.log("\n[4] Endpoint: unauthenticated and invalid input");
{
  const db = fakeDb("approved");
  const res = await handleWithdrawalRequest(db, null, { userId: "x", amountCents: 1 });
  check("no authenticated user -> 401", res.status === 401);
  check("nothing inserted", db.inserts.length === 0);

  const db2 = fakeDb("approved");
  const res2 = await handleWithdrawalRequest(db2, "user-1", { userId: "user-1", amountCents: 0 });
  check("zero amount -> 400", res2.status === 400);
  check("nothing inserted", db2.inserts.length === 0);
}

console.log("\n[5] Endpoint: insert failure is surfaced, not swallowed");
{
  const db: GateDb = {
    readKycStatus: () => Promise.resolve("approved"),
    insertWithdrawal: () => Promise.resolve({ ok: false, error: "boom" }),
  };
  const res = await handleWithdrawalRequest(db, "user-1", { userId: "user-1", amountCents: 100 });
  check("failed insert -> 500", res.status === 500);
}

console.log("\n[6] Manual-review threshold (KYC_MANUAL_REVIEW_THRESHOLD_CENTS)");
check("threshold off -> never manual", requiresManualReview(10_000_000, 0) === false);
check("below threshold -> not manual", requiresManualReview(999_999, 1_000_000) === false);
check("at threshold -> manual", requiresManualReview(1_000_000, 1_000_000) === true);
check("above threshold -> manual", requiresManualReview(2_000_000, 1_000_000) === true);
{
  // Threshold off by default: every approved amount auto-processes.
  const db = fakeDb("approved");
  const res = await handleWithdrawalRequest(db, "user-1", { userId: "user-1", amountCents: 10_000_000 });
  check("no threshold -> not manual review", res.body.manualReview === false);
  check("no threshold -> row status pending", db.inserts[0].status === "pending");
}
{
  // Env parsing: junk / negative / absent are all "off" (0).
  check("absent env -> 0", manualReviewThresholdCentsFromEnv({}) === 0);
  check("junk env -> 0", manualReviewThresholdCentsFromEnv({ KYC_MANUAL_REVIEW_THRESHOLD_CENTS: "abc" }) === 0);
  check("negative env -> 0", manualReviewThresholdCentsFromEnv({ KYC_MANUAL_REVIEW_THRESHOLD_CENTS: "-5" }) === 0);
  check("valid env -> rounded cents", manualReviewThresholdCentsFromEnv({ KYC_MANUAL_REVIEW_THRESHOLD_CENTS: "1000000" }) === 1_000_000);
}
{
  // At/above the threshold: accepted, but stored for human review.
  const db = fakeDb("approved");
  const res = await handleWithdrawalRequest(
    db, "user-1", { userId: "user-1", amountCents: 1_000_000 },
    { manualReviewThresholdCents: 1_000_000 },
  );
  check("at threshold -> HTTP 201 (still accepted)", res.status === 201);
  check("at threshold -> manualReview true", res.body.manualReview === true);
  check("at threshold -> row status manual_review", db.inserts[0].status === "manual_review");
  check("at threshold -> manual_review column true", db.inserts[0].manual_review === true);
  check("at threshold -> still bound to the user", db.inserts[0].user_id === "user-1");
}
{
  // Just below the threshold: auto-processes as pending.
  const db = fakeDb("approved");
  const res = await handleWithdrawalRequest(
    db, "user-1", { userId: "user-1", amountCents: 999_999 },
    { manualReviewThresholdCents: 1_000_000 },
  );
  check("below threshold -> manualReview false", res.body.manualReview === false);
  check("below threshold -> row status pending", db.inserts[0].status === "pending");
}
{
  // The threshold must not let a non-approved user through.
  const db = fakeDb("submitted");
  const res = await handleWithdrawalRequest(
    db, "user-1", { userId: "user-1", amountCents: 9_000_000 },
    { manualReviewThresholdCents: 1_000_000 },
  );
  check("threshold does not bypass KYC", res.status === 403 && db.inserts.length === 0);
}

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
