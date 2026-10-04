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

console.log(`\nResult: ${passed} passed, ${failed} failed.`);
if (failed > 0) Deno.exit(1);
