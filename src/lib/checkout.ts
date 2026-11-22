// ============================================================================
// Browser checkout helpers.
//
// The pure rules live in `supabase/functions/_shared/checkout/logic.ts` so the
// browser and the Deno tests exercise the exact same code. This module only
// adds the browser-only network call.
// ============================================================================

import { functionsUrl, supabase } from "@/integrations/supabase/client";
import type { CheckoutConfig } from "../../supabase/functions/_shared/checkout/logic.ts";

export * from "../../supabase/functions/_shared/checkout/logic.ts";

export interface CheckoutPaymentSummary {
  id: string;
  status: string;
  plan_id: string;
  plan_name: string;
  amount_cents: number;
  currency: string | null;
  network?: string | null;
  created?: boolean;
  is_test?: boolean;
}

export interface CheckoutBankDetails {
  holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  swift: string;
  reference: string;
}

/**
 * Normalised response from crypto-checkout / wise-checkout. Every field is
 * optional because the server only returns what the configured provider
 * actually supports — the UI never invents an address, expiry or link.
 */
export interface CheckoutResponse {
  ok: boolean;
  mode?: string;
  test_mode?: boolean;
  payment: CheckoutPaymentSummary | null;
  bank_details?: CheckoutBankDetails | null;
  deposit_address?: string | null;
  warnings?: string[];
  url?: string;
  pending_payment_id?: string;
  expires_at?: string | null;
}

/**
 * Read the server-side checkout configuration (which methods/assets are usable).
 *
 * Returns null when the endpoint is unreachable. The caller then falls back to
 * offering every method: the payment Edge Functions still enforce the real
 * destination and fail closed, so a config outage can never enable an
 * unsupported payment — it only keeps the form usable.
 */
export async function fetchCheckoutConfig(): Promise<CheckoutConfig | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;
  try {
    const res = await fetch(functionsUrl("checkout-config"), {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (!json?.enabled || !json?.config) return null;
    return json.config as CheckoutConfig;
  } catch {
    return null;
  }
}
