// ============================================================================
// Append-only audit log writer.
// All audit events are appended via the log_payment_event RPC.
// The database trigger on payment_audit_log blocks UPDATE and DELETE.
// This file runs on Deno (Edge Functions) only. Never bundled into browser.
// ============================================================================

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import type { PaymentStatus } from "./plans.ts";

export interface AuditEvent {
  paymentId: string;
  actor: "system" | "user" | "admin" | "auto_confirm";
  source: "wise" | "crypto" | "card" | "admin" | "test";
  eventId: string;
  previousStatus: PaymentStatus | null;
  newStatus: PaymentStatus;
  reason: string;
}

/**
 * Append a row to payment_audit_log via the RPC.
 * Never writes directly to the table.
 *
 * Does NOT throw on audit log failure — payment integrity comes first.
 * The RPC call failure is surfaced via console.error for observability.
 */
export async function logPaymentEvent(
  client: SupabaseClient,
  ev: AuditEvent,
): Promise<void> {
  try {
    const { error } = await client.rpc("log_payment_event", {
      p_payment_table:    "pending_payments",
      p_payment_id:       ev.paymentId,
      p_actor:           ev.actor,
      p_source:          ev.source,
      p_event_id:        ev.eventId,
      p_previous_status: ev.previousStatus,
      p_new_status:      ev.newStatus,
      p_reason:          ev.reason.slice(0, 200),
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error("[audit] log_payment_event failed", {
        paymentId: ev.paymentId,
        error: error.message,
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[audit] log_payment_event exception", { paymentId: ev.paymentId, err });
  }
}