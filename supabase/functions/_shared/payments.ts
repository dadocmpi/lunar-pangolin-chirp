import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  canTransition,
  getCryptoNetwork,
  getPlan,
  isSupportedCurrency,
  PAYMENT_STATUSES,
  PaymentStatus,
  PlanId,
  SupportedCurrency,
} from "./plans.ts";
import { logPaymentEvent } from "./audit.ts";

export interface CheckoutInput {
  /** Plan id from the canonical table; the browser's value is rejected. */
  planId: unknown;
  /** Amount the *client* claims. We never use this; we re-derive it. */
  clientAmountCents?: unknown;
  /** Currency the client claims. We override to USD. */
  clientCurrency?: unknown;
  /** Network id; we look up canonical config. */
  network?: unknown;
  /** Idempotency key supplied by the client (e.g. event id, click id). */
  idempotencyKey?: unknown;
  /** Optional metadata the client wants attached; we only keep safe fields. */
  metadata?: Record<string, unknown>;
}

export interface ValidatedRequest {
  userId: string;
  userEmail: string | null;
  planId: PlanId;
  amountCents: number; // server-derived
  currency: SupportedCurrency; // always "USD"
  network: ReturnType<typeof getCryptoNetwork> | null; // null for Wise
  idempotencyKey: string;
  metadata: Record<string, unknown>;
}

export class PaymentError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
    this.name = "PaymentError";
  }
}

/** Reject any unknown input. */
export function validateCheckoutInput(input: CheckoutInput): ValidatedRequest {
  if (!input || typeof input !== "object") {
    throw new PaymentError("invalid_request");
  }

  // Plan — must resolve from the canonical table.
  let plan: ReturnType<typeof getPlan>;
  try {
    plan = getPlan(input.planId);
  } catch {
    throw new PaymentError("invalid_plan_id");
  }

  // Currency — only USD is supported at this stage.
  if (!isSupportedCurrency(input.clientCurrency)) {
    throw new PaymentError("invalid_currency");
  }

  // Network — optional, but if present must be one we know.
  let network: ReturnType<typeof getCryptoNetwork> | null = null;
  if (input.network !== undefined && input.network !== null) {
    network = getCryptoNetwork(input.network);
  }

  // Idempotency — required, must be a non-empty string, capped length.
  if (
    typeof input.idempotencyKey !== "string" || input.idempotencyKey.length < 8
  ) {
    throw new PaymentError("idempotency_key_required");
  }
  if (input.idempotencyKey.length > 200) {
    throw new PaymentError("idempotency_key_too_long");
  }

  // We never trust the client amount. Always re-derive.
  const amountCents = plan.priceCents;

  // Strip metadata to safe primitives only.
  const metadata: Record<string, unknown> = {};
  if (input.metadata && typeof input.metadata === "object") {
    for (const [k, v] of Object.entries(input.metadata)) {
      if (typeof v === "string" && v.length <= 200) metadata[k] = v;
      else if (typeof v === "number" && Number.isFinite(v)) metadata[k] = v;
      else if (typeof v === "boolean") metadata[k] = v;
    }
  }

  return {
    userId: "", // filled by caller after JWT verification
    userEmail: null,
    planId: plan.id,
    amountCents,
    currency: "USD",
    network,
    idempotencyKey: input.idempotencyKey,
    metadata,
  };
}

export function makeServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new PaymentError("server_misconfigured", "missing service env");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Create a pending payment using idempotency. Returns:
 *  - { payment: existing, created: false } if a row with this idempotencyKey
 *    already exists for this user.
 *  - { payment: new, created: true } on first insert.
 *
 * The DB has a UNIQUE (user_id, idempotency_key) constraint that backs this
 * up atomically; we still do an explicit pre-check so the response shape is
 * stable.
 */
export async function createPendingPayment(
  client: SupabaseClient,
  params: {
    userId: string;
    planId: PlanId;
    amountCents: number;
    currency: SupportedCurrency;
    network: string | null;
    method: "wise" | "crypto" | "card";
    idempotencyKey: string;
    metadata: Record<string, unknown>;
  },
): Promise<{ payment: PaymentRow; created: boolean }> {
  const { data: existing, error: existingErr } = await client
    .from("payments")
    .select("*")
    .eq("user_id", params.userId)
    .eq("idempotency_key", params.idempotencyKey)
    .maybeSingle();

  if (existingErr) throw new PaymentError("db_error", existingErr.message);
  if (existing) return { payment: existing as PaymentRow, created: false };

  const insertPayload = {
    user_id: params.userId,
    plan_id: params.planId,
    amount_cents: params.amountCents,
    currency: params.currency,
    network: params.network,
    method: params.method,
    idempotency_key: params.idempotencyKey,
    status: "pending" as PaymentStatus,
    metadata: params.metadata,
  };

  const { data, error } = await client
    .from("payments")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    // Race: another insert won the unique index.
    if (error.code === "23505") {
      const { data: raced } = await client
        .from("payments")
        .select("*")
        .eq("user_id", params.userId)
        .eq("idempotency_key", params.idempotencyKey)
        .single();
      if (raced) return { payment: raced as PaymentRow, created: false };
    }
    throw new PaymentError("db_error", error.message);
  }

  await logPaymentEvent(client, {
    paymentId: data.id,
    actor: "system",
    source: params.method,
    eventId: `create:${params.idempotencyKey}`,
    previousStatus: null,
    newStatus: "pending",
    reason: "checkout_intent_created",
  });

  return { payment: data as PaymentRow, created: true };
}

/**
 * Apply a status transition. Throws if the transition is not allowed or the
 * payment is in a terminal state. The DB CHECK constraint on status backs
 * this up at the storage layer.
 */
export async function transitionPayment(
  client: SupabaseClient,
  params: {
    paymentId: string;
    previousStatus: PaymentStatus;
    newStatus: PaymentStatus;
    actor: "system" | "user" | "admin" | "auto_confirm";
    source: "wise" | "crypto" | "card" | "admin" | "test";
    eventId: string;
    reason: string;
    verifiedAmountCents?: number;
    verifiedNetwork?: string | null;
    verifiedTxHash?: string | null;
  },
): Promise<PaymentRow> {
  if (!canTransition(params.previousStatus, params.newStatus)) {
    throw new PaymentError(
      "invalid_transition",
      `cannot transition ${params.previousStatus} -> ${params.newStatus}`,
    );
  }

  const updatePayload: Record<string, unknown> = {
    status: params.newStatus,
    updated_at: new Date().toISOString(),
  };
  if (params.verifiedAmountCents !== undefined) {
    updatePayload.verified_amount_cents = params.verifiedAmountCents;
  }
  if (params.verifiedNetwork !== undefined) {
    updatePayload.verified_network = params.verifiedNetwork;
  }
  if (params.verifiedTxHash !== undefined) {
    updatePayload.verified_tx_hash = params.verifiedTxHash;
  }

  const { data, error } = await client
    .from("payments")
    .update(updatePayload)
    .eq("id", params.paymentId)
    .eq("status", params.previousStatus) // optimistic concurrency
    .select("*")
    .single();

  if (error) {
    throw new PaymentError("db_error", error.message);
  }

  await logPaymentEvent(client, {
    paymentId: params.paymentId,
    actor: params.actor,
    source: params.source,
    eventId: params.eventId,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
    reason: params.reason,
  });

  return data as PaymentRow;
}

/**
 * Activate a service ONLY if the payment is in `confirmed` status. The DB
 * unique index on (user_id, plan_id) WHERE activated = true prevents
 * duplicate service activations.
 */
export async function activateServiceForPayment(
  client: SupabaseClient,
  payment: PaymentRow,
  actor: "system" | "auto_confirm" | "admin",
  source: "wise" | "crypto" | "card" | "admin" | "test",
  eventId: string,
): Promise<{ activated: boolean; serviceId: string | null; reason: string }> {
  if (payment.status !== "confirmed") {
    return {
      activated: false,
      serviceId: null,
      reason: "payment_not_confirmed",
    };
  }

  // Idempotency: a unique partial index on (user_id, plan_id) WHERE
  // activated = true means we can attempt the insert safely.
  const accountId = `TEST-${payment.plan_id.toUpperCase()}-${
    payment.id.slice(0, 8)
  }`;

  const { data, error } = await client
    .from("services")
    .insert({
      user_id: payment.user_id,
      plan_id: payment.plan_id,
      account_id: accountId,
      status: "Active",
      balance: payment.amount_cents / 100,
      source_payment_id: payment.id,
      activated: true,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      // already activated — that's fine, report idempotently
      return { activated: false, serviceId: null, reason: "already_activated" };
    }
    throw new PaymentError("db_error", error.message);
  }

  await logPaymentEvent(client, {
    paymentId: payment.id,
    actor,
    source,
    eventId,
    previousStatus: payment.status,
    newStatus: payment.status,
    reason: `service_activated:${data.id}`,
  });

  return { activated: true, serviceId: data.id, reason: "ok" };
}

export interface PaymentRow {
  id: string;
  user_id: string;
  plan_id: PlanId;
  amount_cents: number;
  currency: SupportedCurrency;
  network: string | null;
  method: "wise" | "crypto" | "card";
  idempotency_key: string;
  status: PaymentStatus;
  metadata: Record<string, unknown>;
  verified_amount_cents: number | null;
  verified_network: string | null;
  verified_tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

/** Helper to read a payment by id and assert it belongs to the user. */
export async function readPaymentForUser(
  client: SupabaseClient,
  paymentId: string,
  userId: string,
): Promise<PaymentRow> {
  const { data, error } = await client
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .eq("user_id", userId)
    .single();
  if (error || !data) throw new PaymentError("payment_not_found");
  return data as PaymentRow;
}

export { PAYMENT_STATUSES };
