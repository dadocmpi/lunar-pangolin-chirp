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

export interface WithdrawalGateConfig {
  /**
   * When set to a positive number of cents, an otherwise-approved withdrawal
   * at or above this amount is accepted but flagged for human review instead
   * of being auto-processed. Read from KYC_MANUAL_REVIEW_THRESHOLD_CENTS.
   * 0 / undefined = never force review.
   */
  manualReviewThresholdCents?: number;
}

/** Parse the threshold from an env bag. Junk / negative / absent => 0 (off). */
export function manualReviewThresholdCentsFromEnv(env: {
  KYC_MANUAL_REVIEW_THRESHOLD_CENTS?: string;
}): number {
  const raw = Number(env.KYC_MANUAL_REVIEW_THRESHOLD_CENTS ?? 0);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.round(raw);
}

/**
 * True when an approved withdrawal must be held for human review purely
 * because of its size. Never true when the threshold is off.
 */
export function requiresManualReview(
  amountCents: number,
  thresholdCents: number,
): boolean {
  return thresholdCents > 0 && amountCents >= thresholdCents;
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
  insertWithdrawal(
    row: Record<string, unknown>,
    opts?: { status?: string; manualReview?: boolean },
  ): Promise<{ ok: boolean; error?: string }>;
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
 * client-supplied status. When `config.manualReviewThresholdCents` is set and
 * the amount reaches it, an approved withdrawal is still accepted but is
 * stored for human review (status `manual_review`) instead of auto-processing.
 */
export async function handleWithdrawalRequest(
  db: GateDb,
  authenticatedUserId: string | null,
  input: WithdrawalInput,
  config: WithdrawalGateConfig = {},
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

  const thresholdCents = config.manualReviewThresholdCents ?? 0;
  const manualReview = requiresManualReview(input.amountCents, thresholdCents);

  const inserted = await db.insertWithdrawal({
    user_id: authenticatedUserId,
    service_id: input.accountId ?? null,
    account_id: input.accountId ?? null,
    amount_cents: input.amountCents,
    currency: input.currency ?? "USD",
    method: input.method ?? null,
    destination: input.destination ?? null,
    network: input.network ?? null,
    status: manualReview ? "manual_review" : "pending",
    manual_review: manualReview,
    kyc_status_at_request: decision.status,
  }, { status: manualReview ? "manual_review" : "pending", manualReview });
  if (!inserted.ok) {
    return { status: 500, body: { error: "insert_failed" } };
  }

  return {
    status: 201,
    body: { ok: true, kycStatus: decision.status, manualReview },
  };
}
