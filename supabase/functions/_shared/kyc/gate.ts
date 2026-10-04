// ============================================================================
// Server-side KYC gate for withdrawals.
//
// The ONLY place that decides whether a withdrawal is allowed. The decision is
// made from server-side state read for the authenticated user; a client-sent
// `kycStatus` / `user_id` is never trusted. Pure decision function is unit
// tested; the DB read and insert are injectable so the endpoint can be tested
// without a network.
// ============================================================================

export type KycStatus = "pending" | "submitted" | "approved" | "rejected";

export interface GateDecision {
  allowed: boolean;
  status: KycStatus;
  reason:
    | "ok"
    | "not_authenticated"
    | "kyc_pending"
    | "kyc_submitted"
    | "kyc_rejected";
}

const KYC_STATUSES: readonly string[] = [
  "pending",
  "submitted",
  "approved",
  "rejected",
];

export function normalizeKycStatus(value: unknown): KycStatus {
  const v = typeof value === "string" ? value.toLowerCase() : "";
  return (KYC_STATUSES.includes(v) ? v : "pending") as KycStatus;
}

/**
 * Decide whether a withdrawal may proceed. `status` MUST be the value the
 * server read for the authenticated user — never a request body field.
 */
export function evaluateWithdrawalGate(
  authenticated: boolean,
  status: unknown,
): GateDecision {
  if (!authenticated) {
    return { allowed: false, status: "pending", reason: "not_authenticated" };
  }
  const s = normalizeKycStatus(status);
  if (s === "approved") return { allowed: true, status: s, reason: "ok" };
  if (s === "submitted") return { allowed: false, status: s, reason: "kyc_submitted" };
  if (s === "rejected") return { allowed: false, status: s, reason: "kyc_rejected" };
  return { allowed: false, status: s, reason: "kyc_pending" };
}

// ---------------------------------------------------------------------------
// Minimal injectable DB surface. Structurally satisfied by a Supabase client
// with the service-role key (reads) — writes go through the same client.
// ---------------------------------------------------------------------------
export interface GateDb {
  /** Return the server-side KYC status for this user. */
  readKycStatus(userId: string): Promise<unknown>;
  /** Insert a withdrawal request row; returns false when the insert failed. */
  insertWithdrawal(row: Record<string, unknown>): Promise<{ ok: boolean; error?: string }>;
}

export interface WithdrawalInput {
  userId: string;
  accountId?: string;
  amountCents: number;
  currency?: string;
  method?: string;
  destination?: string;
  network?: string;
}

export interface WithdrawalResult {
  status: number;
  body: Record<string, unknown>;
}

/**
 * The server-side enforcement entry point. Rejects unless KYC is approved for
 * the authenticated user. Reads the status from the DB, ignores any
 * client-supplied status.
 */
export async function handleWithdrawalRequest(
  db: GateDb,
  authenticatedUserId: string | null,
  input: WithdrawalInput,
): Promise<WithdrawalResult> {
  if (!authenticatedUserId) {
    return { status: 401, body: { error: "unauthorized" } };
  }
  if (!input.amountCents || input.amountCents <= 0) {
    return { status: 400, body: { error: "invalid_amount" } };
  }

  const status = await db.readKycStatus(authenticatedUserId);
  const decision = evaluateWithdrawalGate(true, status);
  if (!decision.allowed) {
    return {
      status: 403,
      body: {
        error: "kyc_required",
        kycStatus: decision.status,
        reason: decision.reason,
      },
    };
  }

  const inserted = await db.insertWithdrawal({
    user_id: authenticatedUserId,
    service_id: input.accountId ?? null,
    account_id: input.accountId ?? null,
    amount_cents: input.amountCents,
    currency: input.currency ?? "USD",
    method: input.method ?? null,
    destination: input.destination ?? null,
    network: input.network ?? null,
    status: "pending",
    kyc_status_at_request: decision.status,
  });
  if (!inserted.ok) {
    return { status: 500, body: { error: "insert_failed" } };
  }

  return {
    status: 201,
    body: { ok: true, kycStatus: decision.status },
  };
}
