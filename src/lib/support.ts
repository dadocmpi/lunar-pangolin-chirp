// ============================================================================
// Browser helper for the public Institutional Support form.
//
// The Resend API key and the support inbox address live only on the server.
// This helper forwards the submission to the `support-message` Edge Function,
// which validates it and routes it to SUPPORT_INBOX_EMAIL.
// ============================================================================

import { functionsUrl, isSupabaseConfigured } from "@/integrations/supabase/client";

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export interface SupportMessageInput {
  name: string;
  email: string;
  topic: string;
  message: string;
  /** Locale the visitor submitted from, e.g. "pt". */
  locale: string;
  /** Honeypot field; must stay empty for genuine submissions. */
  website?: string;
}

export type SupportSendResult =
  | { ok: true }
  | { ok: false; error: "not_configured" | "rate_limited" | "delivery_failed" };

/**
 * Submit a support message. Resolves with a result the form can act on; it
 * never throws, so the UI can always show a success or error state.
 */
export async function sendSupportMessage(
  input: SupportMessageInput,
): Promise<SupportSendResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "not_configured" };
  }
  try {
    const res = await fetch(functionsUrl("support-message"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Supabase's recommended `fetch` invocation sends both headers: `apikey`
        // identifies the project, `Authorization` carries the JWT. Sending only
        // `Authorization` happens to work today, but this is the documented form
        // and survives gateway/JWT configuration changes.
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(input),
    });
    if (res.status === 429) return { ok: false, error: "rate_limited" };
    if (!res.ok) return { ok: false, error: "delivery_failed" };
    return { ok: true };
  } catch {
    return { ok: false, error: "delivery_failed" };
  }
}
