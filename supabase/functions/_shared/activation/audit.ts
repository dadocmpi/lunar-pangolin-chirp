// ============================================================================
// Account-link audit events.
//
// Every lifecycle change is appended to the existing append-only
// public.payment_audit_log (payment_table = 'account_activations'). The table
// has a trigger that blocks UPDATE and DELETE, so the trail cannot be rewritten.
//
// Only identifiers and statuses are logged. No credential, token, receipt
// bytes or provider secret is ever passed to this module.
// ============================================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export type AccountLinkAuditEvent =
  | "checkout_completed"
  | "onboarding_submitted"
  | "in_review"
  | "info_requested"
  | "approved"
  | "rejected"
  | "connected"
  | "suspended"
  | "disconnected"
  | "reinstated";

export interface AccountLinkAuditInput {
  accountLinkId: string;
  userId: string;
  event: AccountLinkAuditEvent;
  from: string | null;
  to: string;
  actor: "user" | "operator" | "system";
  source: "admin" | "stripe" | "wise" | "crypto" | "test";
  reason: string;
  /** Event timestamp; defaults to now. Included in the event id for uniqueness. */
  at?: string;
}

/** Map a payment method onto the audit-log source allow-list. */
export function auditSourceForMethod(method: string | null | undefined): AccountLinkAuditInput["source"] {
  const value = (method ?? "").toLowerCase();
  if (value === "wise") return "wise";
  if (value === "crypto") return "crypto";
  if (value === "stripe" || value === "card") return "stripe";
  return "admin";
}

/**
 * Append one audit row. A failure is logged and swallowed: the lifecycle
 * action must not be rolled back because the audit insert failed.
 */
export async function logAccountLinkEvent(
  client: SupabaseClient,
  input: AccountLinkAuditInput,
): Promise<boolean> {
  const at = input.at ?? new Date().toISOString();
  const { error } = await client.from("payment_audit_log").insert({
    payment_table: "account_activations",
    payment_id: input.accountLinkId,
    user_id: input.userId,
    actor: input.actor,
    source: input.source,
    event_id: `account_link:${input.event}:${input.accountLinkId}:${at}`,
    previous_status: input.from,
    new_status: input.to,
    reason: input.reason.slice(0, 200),
    created_at: at,
  });
  if (error) {
    console.error("account_link_audit_failed", {
      accountLinkId: input.accountLinkId,
      event: input.event,
      error: error.message,
    });
    return false;
  }
  return true;
}
