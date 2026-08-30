import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import type { PaymentStatus } from "./plans.ts";
import {
  getPlan,
  getCryptoNetwork,
  isSupportedCurrency,
  PLANS,
  PLAN_IDS,
  canTransition,
} from "./plans.ts";
import { logPaymentEvent } from "./audit.ts";

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
  network: ReturnType<typeof getCryptoNetwork> | null;
  idempotencyKey: string;
  metadata: Record<string, unknown>;
}

export class PaymentError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
    this.name = "PaymentError";
  }
}

export function makeServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new PaymentError("server_misconfigured");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function validateCheckoutInput(input: CheckoutInput): ValidatedRequest {
  if (!input || typeof input !== "object") {
    throw new PaymentError("invalid_request");
  }

  const plan = getPlan(input.planId);

  if (!isSupportedCurrency(input.clientCurrency)) {
    throw new PaymentError("invalid_currency");
  }

  let network: ReturnType<typeof getCryptoNetwork> | null = null;
  if (input.network !== undefined && input.network !== null) {
    try {
      network = getCryptoNetwork(input.network);
    } catch {
      throw new PaymentError("invalid_network");
    }
  }

  if (
    typeof input.idempotencyKey !== "string" ||
    input.idempotencyKey.length < 8
  ) {
    throw new PaymentError("idempotency_key_required");
  }
  if (input.idempotencyKey.length > 200) {
    throw new PaymentError("idempotency_key_too_long");
  }

  const amountCents = plan.priceCents;

  const metadata: Record<string, unknown> = {};
  if (input.metadata && typeof input.metadata === "object") {
    for (const [k, v] of Object.entries(input.metadata)) {
      if (typeof v === "string" && v.length <= 200) metadata[k] = v;
      else if (typeof v === "number" && Number.isFinite(v)) metadata[k] = v;
      else if (typeof v === "boolean") metadata[k] = v;
    }
  }

  return {
    userId: "",
    userEmail: null,
    planId: plan.id,
    amountCents,
    currency: "USD",
    network,
    idempotencyKey: input.idempotencyKey,
    metadata,
  };
}

export interface PendingPaymentRow {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
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
      status:         "pending",
      status_enum:     "pending",
      metadata:        params.metadata,
    })
    .select("*")
    .single();

  if (error) {
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
    status:        params.newStatus,
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
    .eq("status_enum", params.previousStatus)
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
      plan_name:         payment.plan_name,
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