// Idempotent payment-confirmation writes shared by the Stripe webhook and the
// reconciliation function. Keeping the writes in one place guarantees the
// lost-event recovery path applies exactly the same state changes as the
// webhook path.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.99.0";
import type {
  PendingPaymentLike,
  StripeCheckoutSessionLike,
} from "./sessionValidation.ts";

export interface ApplicationRow {
  id: string;
  user_id?: string | null;
  plan_key?: string | null;
  full_name?: string | null;
  email?: string | null;
  country?: string | null;
}

export interface ApplyConfirmationResult {
  ok: boolean;
  alreadyConfirmed?: boolean;
  application?: ApplicationRow | null;
  error?: string;
}

function idOf(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object") {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" && id.length > 0 ? id : null;
  }
  return null;
}

function metadataOf(pendingPayment: PendingPaymentLike): Record<string, unknown> {
  return (pendingPayment.metadata as Record<string, unknown> | null) ?? {};
}

function processedEventIds(pendingPayment: PendingPaymentLike): string[] {
  const value = metadataOf(pendingPayment).processed_event_ids;
  return Array.isArray(value) ? (value as string[]) : [];
}

export function isAlreadyConfirmedFor(
  pendingPayment: PendingPaymentLike,
  eventId: string,
): boolean {
  return pendingPayment.status_enum === "confirmed" &&
    processedEventIds(pendingPayment).includes(eventId);
}

/**
 * Mark a checkout that failed validation for manual operator review. It never
 * confirms the payment; it records why so an operator can inspect it.
 */
export async function flagCheckoutForManualReview(args: {
  supabase: SupabaseClient;
  pendingPayment: PendingPaymentLike;
  eventId: string;
  reason: string;
}): Promise<void> {
  const metadata = metadataOf(args.pendingPayment);
  const processed = processedEventIds(args.pendingPayment);
  if (processed.includes(args.eventId)) return;

  const reason = `Stripe checkout validation failed: ${args.reason}`.slice(0, 200);

  const { error: updateError } = await args.supabase
    .from("pending_payments")
    .update({
      status_enum: "pending_manual",
      metadata: {
        ...metadata,
        last_applied_status: "pending_manual",
        manual_review_reason: args.reason,
        processed_event_ids: [...processed, args.eventId],
      },
    })
    .eq("id", args.pendingPayment.id);

  if (updateError) {
    console.error("[stripe] manual-review flag failed:", updateError);
    return;
  }

  const { error: auditError } = await args.supabase
    .from("payment_audit_log")
    .insert({
      payment_table: "pending_payments",
      payment_id: args.pendingPayment.id,
      user_id: args.pendingPayment.user_id ?? null,
      actor: "system",
      source: "stripe",
      event_id: args.eventId,
      previous_status: null,
      new_status: "pending_manual",
      reason,
      created_at: new Date().toISOString(),
    });

  if (auditError) {
    console.error("[stripe] manual-review audit log failed:", auditError);
  }
}

/**
 * Apply a validated checkout confirmation. Idempotent: a second call with the
 * same event id for an already-confirmed payment is a no-op.
 */
export async function applyCheckoutConfirmation(args: {
  supabase: SupabaseClient;
  pendingPayment: PendingPaymentLike;
  applicationId: string;
  session: StripeCheckoutSessionLike;
  eventId: string;
  reason: string;
}): Promise<ApplyConfirmationResult> {
  const metadata = metadataOf(args.pendingPayment);
  const processed = processedEventIds(args.pendingPayment);

  if (isAlreadyConfirmedFor(args.pendingPayment, args.eventId)) {
    return { ok: true, alreadyConfirmed: true };
  }

  const customerId = idOf(args.session.customer) ??
    (typeof metadata.stripe_customer_id === "string"
      ? metadata.stripe_customer_id
      : null);
  const subscriptionId = idOf(args.session.subscription) ??
    (typeof metadata.stripe_subscription_id === "string"
      ? metadata.stripe_subscription_id
      : null);

  const { error: updateError } = await args.supabase
    .from("pending_payments")
    .update({
      status_enum: "confirmed",
      confirmed_at: new Date().toISOString(),
      metadata: {
        ...metadata,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        last_applied_status: "confirmed",
        processed_event_ids: [...processed, args.eventId],
      },
    })
    .eq("id", args.pendingPayment.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  const { data: application, error: appError } = await args.supabase
    .from("applications")
    .update({
      payment_status: "payment_confirmed",
      activation_status: "activation_pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", args.applicationId)
    .select("id, user_id, plan_key, full_name, email, country")
    .single();

  if (appError) {
    // The payment itself is confirmed; surface the application error so the
    // caller can log it without re-confirming.
    console.error("[stripe] application update failed:", appError);
  }

  const { error: auditError } = await args.supabase
    .from("payment_audit_log")
    .insert({
      payment_table: "pending_payments",
      payment_id: args.pendingPayment.id,
      user_id: args.pendingPayment.user_id ?? null,
      actor: "system",
      source: "stripe",
      event_id: args.eventId,
      previous_status: null,
      new_status: "payment_confirmed",
      reason: args.reason.slice(0, 200),
      created_at: new Date().toISOString(),
    });

  if (auditError) {
    console.error("[stripe] audit log failed:", auditError);
  }

  return {
    ok: true,
    application: (application as ApplicationRow | null) ?? null,
    error: appError?.message,
  };
}
