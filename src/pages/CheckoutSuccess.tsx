"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, ShieldCheck, CheckCircle2, ShieldAlert, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { PaymentsDisabledNotice } from "@/components/PaymentsDisabledNotice";

/**
 * Post-Stripe-checkout success page.
 *
 * IMPORTANT: A redirect to this URL is NOT proof of payment.
 * We only show "Payment completed" after the server confirms via webhook.
 * Before that we show "Payment received. We are verifying the payment."
 *
 * The Stripe success URL is configured server-side as
 * `${STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`.
 * We use session_id to look up the pending payment.
 */
const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // The page polls the server-side payment status. We never trust the URL alone.
  const { view: serverStatus } = usePaymentStatus(pendingPaymentId, 3000);

  // Track if we already redirected to login so we don't loop.
  const redirectedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        if (!redirectedRef.current) {
          redirectedRef.current = true;
          navigate("/login", {
            state: { from: { pathname: "/checkout/success", search: window.location.search } },
          });
        }
        return;
      }
      setUser(authUser);

      if (!sessionId) {
        setLookupError("Missing Stripe session id in the success URL.");
        setLoading(false);
        return;
      }

      // We can't read Stripe Checkout Session metadata from the browser securely.
      // Instead, the edge function already wrote a pending_payments row with
      // metadata.stripe_session_id via the stripe-checkout flow. We look that up
      // and only return rows owned by the current user.
      const { data: rows, error: lookupErr } = await supabase
        .from("pending_payments")
        .select("id, metadata, status, status_enum")
        .eq("user_id", authUser.id)
        .eq("method", "stripe")
        .order("created_at", { ascending: false })
        .limit(10);

      if (lookupErr) {
        setLookupError(lookupErr.message);
        setLoading(false);
        return;
      }

      // Prefer an exact match on session_id in metadata; fall back to the most
      // recent stripe pending payment for this user. We never trust the URL.
      type PendingPaymentRow = {
        id: string;
        metadata: Record<string, unknown> | null;
        status?: string | null;
        status_enum?: string | null;
      };
      const matched = (rows ?? [] as PendingPaymentRow[]).find((r) => {
        const meta = r?.metadata ?? {};
        return meta.stripe_session_id === sessionId;
      });
      const chosen = matched ?? (rows ?? [])[0] ?? null;

      if (!chosen) {
        setLookupError("We could not find a pending payment for this session.");
        setLoading(false);
        return;
      }

      setPendingPaymentId(chosen.id);
      const meta = chosen.metadata ?? {};
      setApplicationId(typeof meta.application_id === "string" ? meta.application_id : null);
      setLoading(false);
    };

    init();
  }, [sessionId, navigate]);

  const testMode = import.meta.env.VITE_TEST_PAYMENT_MODE === "true";
  const prodMode = import.meta.env.VITE_PAYMENTS_ENABLED === "true";

  if (!testMode && !prodMode) {
    return (
      <div className="min-h-screen bg-[#05070A] text-white">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
          <PaymentsDisabledNotice />
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center gap-6 text-white">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
          Verifying payment…
        </p>
      </div>
    );
  }

  if (lookupError || !pendingPaymentId) {
    return (
      <div className="min-h-screen bg-[#05070A] text-white">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] mb-12 transition-colors"
          >
            <ArrowLeft size={14} /> Back to pricing
          </Link>
          <div className="bg-[#080B12] border border-white/10 p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-4 text-yellow-300">
              <ShieldAlert size={20} />
              <h1 className="text-lg font-bold uppercase tracking-widest">
                We could not verify your payment yet
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lookupError ??
                "If you completed checkout, do not worry — your payment is being processed and your account will be activated shortly. Please refresh this page in a moment."}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // The server is the source of truth. We never mark "completed" on URL alone.

 // The webhook writes the canonical "confirmed" status. In test mode the
 // payment-status function returns "confirmed" once the server verified the
 // Stripe event; "payment_confirmed" was a legacy value and is not emitted.
  const isServerConfirmed = serverStatus?.status === "confirmed";

  if (isServerConfirmed) {
    return (
      <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
          <div className="max-w-2xl mx-auto bg-[#080B12] border border-white/10 p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400 block">
                  Verified
                </span>
                <h1 className="text-3xl font-black uppercase tracking-tighter">
                  Payment completed
                </h1>
              </div>
            </div>

            <p className="text-[12px] text-slate-300 leading-relaxed">
              Your account will be activated within a few minutes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="p-4 bg-white/[0.02] border border-white/10">
                <p className="text-slate-500">Payment ID</p>
                <p className="text-slate-200 break-all mt-1">{pendingPaymentId}</p>
              </div>
              {applicationId && (
                <div className="p-4 bg-white/[0.02] border border-white/10">
                  <p className="text-slate-500">Application ID</p>
                  <p className="text-slate-200 break-all mt-1">{applicationId}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 flex items-start gap-3">
              <ShieldCheck size={18} className="text-[#C5A059] shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                For your security, accounts are activated manually by an operator after payment verification. You will receive access as soon as the review is complete.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-[#C5A059] hover:bg-[#C5A059]/80 text-white rounded-none h-12 px-6 text-[11px] font-black uppercase tracking-[0.2em]">
                <a href="/dashboard">Go to dashboard</a>
              </Button>
              <Button asChild variant="outline" className="rounded-none h-12 px-6 text-[11px] font-black uppercase tracking-[0.2em] border-white/10 text-white hover:bg-white/5">
                <a href="/contact">Contact support</a>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not yet confirmed by the server. We MUST NOT call this "completed".
  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
        <div className="max-w-2xl mx-auto bg-[#080B12] border border-white/10 p-10 space-y-8">
          <div className="flex items-center gap-4">
            <Loader2 className="animate-spin text-[#C5A059]" size={32} />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C5A059] block">
                Verifying
              </span>
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                Payment received. We are verifying the payment.
              </h1>
            </div>
          </div>

          <p className="text-[12px] text-slate-300 leading-relaxed">
            Your payment is being verified. This page will update automatically once your payment is confirmed.
            Do not close this window.
          </p>

          {serverStatus?.status && (
            <div className="p-4 bg-white/[0.02] border border-white/10 text-[10px] font-bold uppercase tracking-widest">
              <p className="text-slate-500">Current status</p>
              <p className="text-slate-200 mt-1">{String(serverStatus.status)}</p>
            </div>
          )}

          <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 flex items-start gap-3">
            <ShieldCheck size={18} className="text-[#C5A059] shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
              For your security, this page does not mark a payment as completed based on the URL alone. We wait for server-side confirmation.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
