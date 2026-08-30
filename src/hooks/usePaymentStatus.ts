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
 * Polls the payment-status Edge Function. This is the ONLY way the front end
 * ever knows whether a payment is confirmed. It never decides confirmation
 * from local state.
 */
export function usePaymentStatus(paymentId: string | null, intervalMs = 5000) {
  const [view, setView] = useState<PaymentStatusView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stopped = useRef(false);

  useEffect(() => {
    stopped.current = false;
    if (!paymentId) {
      setView(null);
      return;
    }
    const tick = async () => {
      if (stopped.current) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setError("unauthorized");
          return;
        }
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-status?paymentId=${encodeURIComponent(paymentId)}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) {
          setError(`http_${res.status}`);
          return;
        }
        const data = await res.json();
        if (data?.payment) setView(data.payment as PaymentStatusView);
      } catch (e) {
        setError(String(e));
      }
    };
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      stopped.current = true;
      clearInterval(id);
    };
  }, [paymentId, intervalMs]);

  return { view, error };
}