// ============================================================================
// Append-only audit events for the managed-account onboarding flow.
//
// Reuses the existing payment_audit_log table (the activation flow already
// writes there). The migration widens its payment_table CHECK to include
// 'account_links'. A failure to write an audit row is logged but never rolls
// back the customer action — the same posture as activation-review.
//
// No credential, token, password or receipt content is ever written here: the
// only fields are ids, statuses and a bounded reason string.
// ============================================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type AuditActor = "user" | "operator" | "system";

export interface LinkAuditInput {
  linkId: string;
  userId: string;
  actor: AuditActor;
  /** Stable event name, e.g. account_link_submitted. */
  event: string;
  previousStatus: string | null;
  newStatus: string;
  reason?: string;
  /** When false the event id is stable and a retry cannot duplicate the row. */
  uniquePerAction?: boolean;
  at?: string;
}

function bounded(value: string | undefined, max = 200): string {
  return (value ?? "").trim().slice(0, max);
}

export async function logLinkAudit(
  admin: SupabaseClient,
  input: LinkAuditInput,
): Promise<void> {
  const at = input.at ?? new Date().toISOString();
  const eventId = input.uniquePerAction === false
    ? `${input.event}:${input.linkId}`
    : `${input.event}:${input.linkId}:${at}`;

  const { error } = await admin.from("payment_audit_log").insert({
    payment_table: "account_links",
    payment_id: input.linkId,
    user_id: input.userId,
    actor: input.actor,
    source: "admin",
    event_id: eventId,
    previous_status: input.previousStatus,
    new_status: input.newStatus,
    reason: bounded(input.reason),
    created_at: at,
  });
  if (error) {
    console.error("account_link_audit_failed", {
      linkId: input.linkId,
      event: input.event,
      error: error.message,
    });
  }
}

/**
 * Record that the onboarding flow verified a completed checkout. This is the
 * "checkout completion" audit event for the onboarding surface; the payment
 * provider webhook already writes its own confirmation row. Idempotent per
 * payment.
 */
export async function logCheckoutVerified(
  admin: SupabaseClient,
  paymentId: string,
  userId: string,
): Promise<void> {
  const { error } = await admin.from("payment_audit_log").insert({
    payment_table: "pending_payments",
    payment_id: paymentId,
    user_id: userId,
    actor: "system",
    source: "admin",
    event_id: `onboarding:checkout_verified:${paymentId}`,
    previous_status: "confirmed",
    new_status: "confirmed",
    reason: "checkout_completed_entitlement_verified",
  });
  if (error && error.code !== "23505") {
    console.error("onboarding_checkout_audit_failed", {
      paymentId,
      error: error.message,
    });
  }
}
