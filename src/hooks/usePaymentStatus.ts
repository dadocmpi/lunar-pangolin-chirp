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
  planId: string;
  amountCents: number;
  currency: string;
  network: string | null;
  method: "wise" | "crypto" | "card";
}

/**
 * Polls the payment-status Edge Function.
 * This is the ONLY way the front end ever learns whether a payment is confirmed.
 * It never decides confirmation from local state.
 *
 * When VITE_PAYMENTS_ENABLED is not "true", the hook returns null and the
 * parent component renders the PaymentsDisabledNotice.
 */
export function usePaymentStatus(paymentId: string | null, intervalMs = 5000) {
  const [view, setView] = useState<PaymentStatusView | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The "stopped" flag is a ref so flipping it does not retrigger the effect.
  // A useState would cause the effect to re-run on every state change, which
  // would clear and re-create the interval, which would stop polling after
  // the first tick.
  const stoppedRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset the ref on each new paymentId / intervalMs.
    stoppedRef.current = false;
    setView(null);
    setError(null);

    if (!paymentId) {
      return;
    }

    let intervalId: number | undefined;

    const tick = async () => {
      if (stoppedRef.current) return;

      // Check the real gate first
      const gate = import.meta.env.VITE_PAYMENTS_ENABLED;
      if (gate !== "true") {
        setView(null);
        setError("payments_disabled");
        return;
      }

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
    intervalId = setInterval(tick, intervalMs) as unknown as number;

    return () => {
      stoppedRef.current = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [paymentId, intervalMs]);

  return { view, error };
}