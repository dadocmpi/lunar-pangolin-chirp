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
 * Polls the payment-status Edge Function for one payment.
 *
 * Correctness contract:
 *   - When `paymentId` is null, the hook is idle (no network).
 *   - When `paymentId` is set, the hook fires an immediate tick and then
 *     polls every `intervalMs` ms.
 *   - The hook is safe across React strict-mode double-invocation and
 *     across re-renders that do not change `paymentId` or `intervalMs`.
 *   - On unmount or when the dependencies change, the previous interval
 *     is cleared and any in-flight tick is short-circuited via a ref.
 *
 * Why a ref for the stopped flag:
 *   - useState would re-run the effect on every state change. That would
 *     re-create the interval on every tick, which leaks a stale interval
 *     per poll and can race with cleanup.
 *   - A ref can be flipped inside the cleanup function without retriggering
 *     the effect.
 */
export function usePaymentStatus(
  paymentId: string | null,
  intervalMs: number = 5000,
): { view: PaymentStatusView | null; error: string | null } {
  const [view, setView] = useState<PaymentStatusView | null>(null);
  const [error, setError] = useState<string | null>(null);

  // One ref per render. The ref is never reassigned, only mutated, so the
  // effect does not list it as a dependency.
  const stoppedRef = useRef<boolean>(false);

  useEffect(() => {
    // New paymentId or new interval — restart cleanly.
    stoppedRef.current = false;
    setView(null);
    setError(null);

    if (!paymentId) {
      return undefined;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const tick = async () => {
      // Skip if the effect has been torn down.
      if (stoppedRef.current) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          if (!stoppedRef.current) setError("unauthorized");
          return;
        }

        const url =
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payment-status?paymentId=${encodeURIComponent(paymentId)}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (stoppedRef.current) return;

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
        if (!stoppedRef.current) setError(String(e));
      }
    };

    // Fire one immediate tick, then schedule.
    tick();
    intervalId = setInterval(tick, intervalMs);

    return () => {
      // Order matters: flip the flag first so any in-flight tick resolves
      // to a no-op, then clear the interval.
      stoppedRef.current = true;
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [paymentId, intervalMs]);

  return { view, error };
}

export default usePaymentStatus;