// ============================================================================
// Frontend helper for owner notifications.
//
// Browser code must never hold the Resend API key, so it cannot call Resend
// directly. This helper forwards the event to the `notify-owner` Edge
// Function, which owns the key and performs the send through the single
// central module (supabase/functions/_shared/email.ts).
//
// Delivery is fire-and-forget: a failure here never blocks or breaks the
// user's action (signup, checkout, form submit).
// ============================================================================

import { functionsUrl, isSupabaseConfigured } from "@/integrations/supabase/client";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export type OwnerEventType =
  | "novo_cliente"
  | "novo_lead"
  | "compra"
  | "pagamento"
  | "conta"
  | "erro"
  | "webhook";

export interface NotifyOwnerOptions {
  type: OwnerEventType;
  subject: string;
  data?: Record<string, unknown>;
  replyTo?: string | null;
  idempotencyKey?: string | null;
}

/**
 * Queue an owner notification. Resolves once the request is dispatched; the
 * email itself is sent asynchronously by the Edge Function. Any error is
 * swallowed and logged — never rethrown.
 */
export async function notifyOwner(options: NotifyOwnerOptions): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await fetch(functionsUrl("notify-owner"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        type: options.type,
        subject: options.subject,
        data: options.data ?? {},
        replyTo: options.replyTo ?? null,
        idempotencyKey: options.idempotencyKey ?? null,
      }),
      keepalive: true,
    });
  } catch (err) {
    console.error("[notifyOwner] dispatch failed (non-blocking):", err);
  }
}

/** Fire-and-forget wrapper — does not return a promise to await. */
export function notifyOwnerInBackground(options: NotifyOwnerOptions): void {
  void notifyOwner(options);
}
