// ============================================================================
// Payment validation, idempotency, transitions, and activation.
// All imports are from the local option_a/ directory or Deno stdlib only.
// This file runs on Deno (Edge Functions) only. Never bundled into browser.
// ============================================================================

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import type { PaymentStatus } from "./plans.ts";
import {
  getPlan,
  isSupportedCurrency,
  PLANS,
  PLAN_IDS,
  canTransition,
} from "./plans.ts";
import { logPaymentEvent } from "./audit.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CheckoutInput {
  planId?: unknown;
  clientAmountCents?: unknown;
  clientCurrency?: unknown;
  network?: unknown;
  idempotencyKey?: unknown;
  metadata?: Record<string, unknown>;
}

export interface ValidatedRequest {
  userId: string;
  userEmail: string | null;
  planId: import("./plans.ts").PlanId;
  amountCents: number;   // server-derived, never from the browser
  currency: "USD";
  network: ReturnType<typeof import("./plans.ts").getCryptoNetwork> | null;
  idempotencyKey: string;
  metadata: Record<string, unknown>;
}

/** Thrown on validation or state-machine failures. */
export class PaymentError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
    this.name = "PaymentError";
  }
}

// ---------------------------------------------------------------------------
// Service-client factory (service role, bypasses RLS)
// ---------------------------------------------------------------------------

export function makeServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new PaymentError("server_misconfigured");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Validation (server-only — never trusts the browser)
// ---------------------------------------------------------------------------

/** Throws PaymentError on any invalid input. Returns ValidatedRequest on success. */
export function validateCheckoutInput(input: CheckoutInput): ValidatedRequest {
  if (!input || typeof input !== "object") {
    throw new PaymentError("invalid_request");
  }

  // Plan — must resolve from the canonical table.
  const plan = getPlan(input.planId);

  // Currency — only USD is supported.
  if (!isSupportedCurrency(input.clientCurrency)) {
    throw new PaymentError("invalid_currency");
  }

  // Network — optional, but if present must be in the allow-list.
  let network: ReturnType<typeof import("./plans.ts").getCryptoNetwork> | null = null;
  if (input.network !== undefined && input.network !== null) {
    network = (input.network as unknown) as ReturnType<typeof import("./plans.ts").getCryptoNetwork>;
    // Validate it is a known network
    try {
      const { getCryptoNetwork } = require("./plans.ts");
      network = getCryptoNetwork(input.network);
    } catch {
      throw new PaymentError("invalid_network");
    }
  }

  // Idempotency key — required, min 8 chars, max 200.
  if (
    typeof input.idempotencyKey !== "string" ||
    input.idempotencyKey.length < 8
  ) {
    throw new PaymentError("idempotency_key_required");
  }
  if (input.idempotencyKey.length > 200) {
    throw new PaymentError("idempotency_key_too_long");
  }

  // Server-derives the amount. Browser amount is always ignored.
  const amountCents = plan.priceCents;

  // Strip metadata to safe primitives only (strings ≤200 chars, numbers, booleans).
  const metadata: Record<string, unknown> = {};
  if (input.metadata && typeof input.metadata === "object") {
    for (const [k, v] of Object.entries(input.metadata)) {
      if (typeof v === "string" && v.length <= 200) metadata[k] = v;
      else if (typeof v === "number" && Number.isFinite(v)) metadata[k] = v;
      else if (typeof v === "boolean") metadata[k] = v;
    }
  }

  return {
    userId: "",      // filled by caller after JWT verification
    userEmail: null,
    planId: plan.id,
    amountCents,
    currency: "USD",
    network,
    idempotencyKey: input.idempotencyKey,
    metadata,
  };
}

// ---------------------------------------------------------------------------
// Pending payment CRUD
// ---------------------------------------------------------------------------

export interface PendingPaymentRow {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;           // legacy text column (still written by legacy code)
  status_enum: PaymentStatus | null;
  amount_cents: number | null;
  network: string | null;
  idempotency_key: string | null;
  confirmed_at: string | null;
  tx_hash: string | null;
  account_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Insert a pending payment with idempotency.
 * Returns { payment, created } where created is false on duplicate.
 */
export async function upsertPendingPayment(
  client: SupabaseClient,
  params: {
    userId: string;
    planId: string;
    planName: string;
    amountCents: number;
    currency: string;
    network: string | null;
    method: "wise" | "crypto" | "card";
    idempotencyKey: string;
    metadata: Record<string, unknown>;
  },
): Promise<{ payment: PendingPaymentRow; created: boolean }> {
  // Idempotency pre-check
  const { data: existing } = await client
    .from("pending_payments")
    .select("*")
    .eq("user_id", params.userId)
    .eq("idempotency_key", params.idempotencyKey)
    .maybeSingle();

  if (existing) {
    return { payment: existing as PendingPaymentRow, created: false };
  }

  const { data, error } = await client
    .from("pending_payments")
    .insert({
      user_id:         params.userId,
      plan_name:       params.planName,
      amount_cents:    params.amountCents,
      currency:        params.currency,
      network:         params.network,
      method:          params.method,
      idempotency_key: params.idempotencyKey,
      status:         "pending",           // legacy text column
      status_enum:     "pending",          // new enum column
      metadata:        params.metadata,
    })
    .select("*")
    .single();

  if (error) {
    // Race: another concurrent insert won the unique index.
    if (error.code === "23505") {
      const { data: raced } = await client
        .from("pending_payments")
        .select("*")
        .eq("user_id", params.userId)
        .eq("idempotency_key", params.idempotencyKey)
        .single();
      if (raced) return { payment: raced as PendingPaymentRow, created: false };
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

  return { payment: data as PendingPaymentRow, created: true };
}

/**
 * Update status_enum on pending_payments.
 * Throws PaymentError if the transition is not allowed.
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
): Promise<PendingPaymentRow> {
  if (!canTransition(params.previousStatus, params.newStatus)) {
    throw new PaymentError(
      "invalid_transition",
      `cannot transition ${params.previousStatus} -> ${params.newStatus}`,
    );
  }

  const updatePayload: Record<string, unknown> = {
    status_enum:    params.newStatus,
    status:        params.newStatus,  // keep legacy text column in sync
    updated_at:    new Date().toISOString(),
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
    .from("pending_payments")
    .update(updatePayload)
    .eq("id", params.paymentId)
    .eq("status_enum", params.previousStatus)  // optimistic concurrency
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

  return data as PendingPaymentRow;
}

/**
 * Read a pending payment by id, asserting ownership.
 */
export async function readPendingPaymentForUser(
  client: SupabaseClient,
  paymentId: string,
  userId: string,
): Promise<PendingPaymentRow> {
  const { data, error } = await client
    .from("pending_payments")
    .select("*")
    .eq("id", paymentId)
    .eq("user_id", userId)
    .single();
  if (error || !data) throw new PaymentError("payment_not_found");
  return data as PendingPaymentRow;
}

// ---------------------------------------------------------------------------
// Service activation (only after confirmed payment)
// ---------------------------------------------------------------------------

/**
 * Insert a services row after a confirmed payment.
 * Idempotent via the unique partial index on (user_id, plan_name) WHERE activated = true.
 * Returns { activated, serviceId }.
 */
export async function activateServiceForPayment(
  client: SupabaseClient,
  payment: PendingPaymentRow,
  actor: "system" | "auto_confirm" | "admin",
  source: "wise" | "crypto" | "card" | "admin" | "test",
  eventId: string,
): Promise<{ activated: boolean; serviceId: string | null; reason: string }> {
  if (payment.status_enum !== "confirmed") {
    return { activated: false, serviceId: null, reason: "payment_not_confirmed" };
  }

  const accountId = `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
  const balance = (payment.amount_cents ?? 0) / 100;

  const { data, error } = await client
    .from("services")
    .insert({
      user_id:           payment.user_id,
      plan_name:         payment.plan_name,   // canonical column
      account_id:       accountId,
      status:           "Active",
      balance,
      source_payment_id: payment.id,
      activated:        true,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique index violation — already activated. Idempotent.
      return { activated: false, serviceId: null, reason: "already_activated" };
    }
    throw new PaymentError("db_error", error.message);
  }

  await logPaymentEvent(client, {
    paymentId: payment.id,
    actor,
    source,
    eventId,
    previousStatus: "confirmed",
    newStatus: "confirmed",
    reason: `service_activated:${data.id}`,
  });

  return { activated: true, serviceId: data.id, reason: "ok" };
}