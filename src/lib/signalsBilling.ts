// ============================================================================
// signalsBilling — client calls for the monthly signals-plan subscription.
//
// Thin wrappers around two Edge Functions:
//   * signals-checkout  -> returns a Stripe Checkout URL for the subscription;
//   * stripe-portal     -> returns a Stripe Billing Portal URL (update card,
//                          cancel). The portal is also how a customer cancels.
//
// The browser never sends a price or a plan id: the server reads the Stripe
// price from its own secret. The plan only turns active when Stripe's webhook
// confirms the payment, so nothing here can activate it.
// ============================================================================

import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

export interface BillingResult {
  ok: boolean;
  /** Present only when ok is false. */
  error?: string;
  /** Present only when ok is true. */
  url?: string;
}

async function callBilling(
  fn: "signals-checkout" | "stripe-portal",
): Promise<BillingResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "not_configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { ok: false, error: "unauthorized" };

  let res: Response;
  try {
    res = await fetch(functionsUrl(fn), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({}),
    });
  } catch {
    return { ok: false, error: "network" };
  }

  const json = await res.json().catch(() => ({})) as Record<string, unknown>;
  if (!res.ok || typeof json?.url !== "string") {
    return { ok: false, error: typeof json?.error === "string" ? json.error : "unknown" };
  }
  return { ok: true, url: json.url };
}

/** Start the monthly signals subscription via Stripe Checkout. */
export function startSignalsSubscription(): Promise<BillingResult> {
  return callBilling("signals-checkout");
}

/** Open the Stripe Billing Portal (update card, cancel the subscription). */
export function openBillingPortal(): Promise<BillingResult> {
  return callBilling("stripe-portal");
}
