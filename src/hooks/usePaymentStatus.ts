"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { functionsUrl, supabase } from "@/integrations/supabase/client";

export type CheckoutPaymentStatus =
  | "created"
  | "pending"
  | "processing"
  | "confirmed"
  | "failed"
  | "rejected"
  | "refunded"
  | "disputed"
  | "canceled"
  | "past_due"
  | "pending_manual";

export type PaymentLifecycleState =
  | "created"
  | "pending"
  | "processing"
  | "manual_review"
  | "confirmed"
  | "activation_pending"
  | "active"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded"
  | "disputed"
  | "past_due"
  | "suspended"
  | "disconnected";

export type PaymentNextAction =
  | "complete_payment"
  | "await_confirmation"
  | "await_manual_review"
  | "await_activation"
  | "connect_provider"
  | "update_payment_method"
  | "restart_checkout"
  | "contact_support"
  | "none";

export interface PaymentStatusView {
  id: string;
  status: CheckoutPaymentStatus;
  status_raw: string;
  plan_id: string | null;
  plan_name: string | null;
  amount_cents: number;
  currency: string;
  network: string | null;
  method: "wise" | "crypto" | "card" | "stripe" | null;
  reference: string | null;
  expires_at: string | null;
  is_test: boolean;
  created_at: string | null;
  updated_at: string | null;
  confirmed_at: string | null;
}

export interface PaymentActivationView {
  id: string;
  status: "activation_pending" | "active" | "suspended" | "disconnected";
  account_id: string;
  plan_key: string;
  plan_name: string;
  activated_at: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
  disconnected_at: string | null;
  disconnected_reason: string | null;
  activation_email_sent_at: string | null;
  updated_at: string | null;
}

export interface PaymentStatusResponse {
  ok: boolean;
  mode?: string;
  lifecycle: PaymentLifecycleState;
  next_action: PaymentNextAction;
  processing: boolean;
  activation: PaymentActivationView | null;
  payment: PaymentStatusView | null;
}

/**
 * Fetch the server-authoritative payment status.
 *
 * `paymentId` null => the latest payment for the signed-in user.
 * Returns null on any network/auth failure; the UI keeps its previous state.
 */
export async function fetchPaymentStatus(
  paymentId: string | null,
): Promise<PaymentStatusResponse | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;
  const suffix = paymentId ? `?paymentId=${encodeURIComponent(paymentId)}` : "";
  try {
    const res = await fetch(`${functionsUrl("payment-status")}${suffix}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (!json || typeof json !== "object") return null;
    return json as PaymentStatusResponse;
  } catch {
    return null;
  }
}

function usePolling(
  paymentId: string | null,
  enabled: boolean,
  intervalMs: number,
) {
  const [response, setResponse] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stoppedRef = useRef<boolean>(false);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    stoppedRef.current = false;
    setResponse(null);
    setError(null);
    if (!enabled) return undefined;

    const tick = async () => {
      if (stoppedRef.current) return;
      const next = await fetchPaymentStatus(paymentId);
      if (stoppedRef.current) return;
      if (next) {
        setResponse(next);
        setError(null);
      } else {
        setError("unavailable");
      }
    };

    tick();
    const intervalId = setInterval(tick, intervalMs);
    return () => {
      stoppedRef.current = true;
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [paymentId, enabled, intervalMs, nonce]);

  return { response, error, reload };
}

/**
 * Polls one payment. `paymentId` null keeps the hook idle.
 *
 * The returned `view` is the payment object for backward compatibility with
 * the existing checkout screens; `response` carries the activation + lifecycle.
 */
export function usePaymentStatus(
  paymentId: string | null,
  intervalMs: number = 5000,
): { view: PaymentStatusView | null; error: string | null; response: PaymentStatusResponse | null } {
  const { response, error } = usePolling(paymentId, Boolean(paymentId), intervalMs);
  return { view: response?.payment ?? null, error, response };
}

/** Polls the latest payment for the signed-in user (dashboard card). */
export function useLatestPaymentStatus(
  intervalMs: number = 15000,
): {
  response: PaymentStatusResponse | null;
  error: string | null;
  reload: () => void;
} {
  return usePolling(null, true, intervalMs);
}

export default usePaymentStatus;
