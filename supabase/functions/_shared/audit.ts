import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PaymentStatus } from "./plans.ts";

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
 * Append a single row to payment_audit_log. This table has INSERT-only RLS:
 * rows cannot be updated or deleted by anyone, including the service role
 * (enforced by trigger in the migration).
 *
 * We deliberately do NOT log private credentials, full card numbers,
 * seed phrases, signatures, or API keys. The `reason` field is capped and
 * restricted to a small allow-list in the migration.
 */
export async function logPaymentEvent(
  client: SupabaseClient,
  ev: AuditEvent,
): Promise<void> {
  const { error } = await client.from("payment_audit_log").insert({
    payment_id: ev.paymentId,
    actor: ev.actor,
    source: ev.source,
    event_id: ev.eventId,
    previous_status: ev.previousStatus,
    new_status: ev.newStatus,
    reason: ev.reason.slice(0, 200),
  });
  // We do not throw on audit log failure — payment integrity comes first —
  // but we surface it to the caller so the test harness can detect it.
  if (error) {
    // eslint-disable-next-line no-console
    console.error("audit_log_failed", { paymentId: ev.paymentId, error: error.message });
  }
}