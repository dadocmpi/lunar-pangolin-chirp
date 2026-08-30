"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  | "pending_manual";

export interface PaymentStatusView {
  id: string;
  status: CheckoutPaymentStatus;
  plan_id: string | null;
  plan_name: string | null;
  amount_cents: number;
  currency: string;
  network: string | null;
  method: "wise" | "crypto" | "card" | null;
  is_test: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Polls the payment-status Edge Function.
 *
 * Fix vs. previous version:
 *   - `stopped` is a useRef, not useState. Setting state inside the effect
 *     would re-run the effect, which would re-create the interval, which
 *     would leak a stale interval after the paymentId changes.
 *   - The effect re-runs only when paymentId or intervalMs changes. The
 *     previous interval is cleared, the previous ref is set to true, and a
 *     new ref is captured by the new closure.
 */
export function usePaymentStatus(paymentId: string | null, intervalMs = 5000) {
  const [view, setView] = useState<PaymentStatusView | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use a ref so the cleanup function can flip it without re-running the effect.
  const stoppedRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset on each new paymentId / intervalMs.
    stoppedRef.current = false;
    setView(null);
    setError(null);

    if (!paymentId) {
      return undefined;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tick = async () => {
      if (stoppedRef.current) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setError("unauthorized");
          return;
        }
        const url =
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-status?paymentId=${encodeURIComponent(paymentId)}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) {
          setError(`http_${res.status}`);
          return;
        }
        const data = await res.json();
        if (data?.payment) {
          setView(data.payment as PaymentStatusView);
          setError(null);
        }
      } catch (e) {
        setError(String(e));
      }
    };

    // Fire one tick immediately, then schedule.
    tick();
    intervalId = setInterval(tick, intervalMs);

    return () => {
      stoppedRef.current = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [paymentId, intervalMs]);

  return { view, error };
}

export default usePaymentStatus;