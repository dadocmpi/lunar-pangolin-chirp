"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Building2,
  Bitcoin,
  Lock,
  CreditCard,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { CheckoutStatusBadge } from "@/components/CheckoutStatusBadge";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { PaymentsDisabledNotice } from "@/components/PaymentsDisabledNotice";

interface CheckoutResponse {
  ok: boolean;
  mode?: string;
  reason?: string;
  test_mode?: boolean;
  payment: {
    id: string;
    status: string;
    plan_id: string;
    plan_name: string;
    amount_cents: number;
    currency: string | null;
    network?: string | null;
    created?: boolean;
    is_test?: boolean;
  } | null;
  bank_details?: {
    holder_name: string;
    bank_name: string;
    account_number: string;
    routing_number: string;
    swift: string;
    reference: string;
  } | null;
  deposit_address?: string;
  warnings?: string[];
  url?: string; // For Stripe checkout
  pending_payment_id?: string; // For Stripe checkout
}

const CRYPTO_NETWORKS = [
  { id: "BTC",     symbol: "BTC",  name: "Bitcoin (BTC)" },
  { id: "TRC20",   symbol: "USDT", name: "TRON (TRC20)" },
  { id: "ETH",     symbol: "ETH",  name: "Ethereum (ERC20)" },
  { id: "BNB",     symbol: "BNB",  name: "BNB Chain (BEP20)" },
  { id: "POLYGON", symbol: "MATIC",name: "Polygon (MATIC)" },
  { id: "SOL",     symbol: "SOL",  name: "Solana (SOL)" },
] as const;

function newIdempotencyKey(): string {
  const buf = new Uint8Array(12);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

const Checkout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showCrypto, setShowCrypto] = useState(false);
  const [showWise, setShowWise] = useState(false);
  const [showStripe, setShowStripe] = useState(false);
  const [wiseConfirmed, setWiseConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [wiseResponse, setWiseResponse] = useState<CheckoutResponse | null>(null);
  const [cryptoResponse, setCryptoResponse] = useState<CheckoutResponse | null>(null);
  const [stripeResponse, setStripeResponse] = useState<CheckoutResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [application, setApplication] = useState<any>(null); // Application data

  const selectedCryptoIdRef = useRef<string>("BTC");
  const wiseKeyRef = useRef<string | null>(null);
  const cryptoKeyRef = useRef<string | null>(null);
  const stripeKeyRef = useRef<string | null>(null);

  // Get applicationId from location.state (set by RegisterApplication page)
  const applicationId = location.state?.applicationId;

  // Production gate. When neither is on, render PaymentsDisabledNotice.
  const testMode = import.meta.env.VITE_TEST_PAYMENT_MODE === "true";
  const prodMode = import.meta.env.VITE_PAYMENTS_ENABLED === "true";

  const { view: serverStatus } = usePaymentStatus(
    (testMode || prodMode) ? paymentId : null,
    4000,
  );

  useEffect(() => {
    if (!applicationId) {
      // If no applicationId, redirect to pre-registration page
      navigate("/register-application", { state: { plan: location.state?.plan } });
      return;
    }
    const checkUserAndApplication = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      
      // Fetch the application data to verify ownership and get plan details
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select("*, plan_key")
        .eq("id", applicationId)
        .eq("user_id", authUser?.id)
        .single();

      if (appError || !appData) {
        // If application not found or not owned by user, redirect to pre-registration
        navigate("/register-application");
        return;
      }
      
      setApplication(appData);
      setLoading(false);
    };
    checkUserAndApplication();
  }, [applicationId, navigate]);

  // Official monthly prices in EUR
  const OFFICIAL_PRICES_EUR: Record<string, number> = {
    Starter: 80.04,
    Professional: 120.52,
    Business: 431.48,
    Enterprise: 852.84,
  };

  // Get the plan key from the application data
  const planKey = application?.plan_key;
  
  // Override plan data with official EUR prices based on plan key
  const enhancedPlan = planKey
    ? {
        // We'll create a plan-like object from the application data and official prices
        id: planKey, // Using plan_key as the plan ID for consistency
        name: planKey.charAt(0).toUpperCase() + planKey.slice(1), // e.g., 'starter' -> 'Starter'
        priceEUR: OFFICIAL_PRICES_EUR[planKey as keyof typeof OFFICIAL_PRICES_EUR] ?? 0,
        priceUSD: 0, // We won't show USD
        accountSizeEUR: OFFICIAL_PRICES_EUR[planKey as keyof typeof OFFICIAL_PRICES_EUR] ?? 0,
        accountSizeUSD: 0,
        features: [], // We don't have features in the application, but we can fetch from a plans table if needed
        // For now, we'll leave features empty and rely on the plan description in the UI
      }
    : null;

  const numericPriceEUR = useMemo(() => {
    if (!enhancedPlan) return "0";
    return String(enhancedPlan.priceEUR ?? 0);
  }, [enhancedPlan]);

  const handleBack = () => {
    setShowCrypto(false);
    setShowWise(false);
    setShowStripe(false);
    setWiseConfirmed(false);
    setWiseResponse(null);
    setCryptoResponse(null);
    setStripeResponse(null);
    setPaymentId(null);
  };

  async function callEdgeFunction(
    fn: "wise-checkout" | "crypto-checkout" | "stripe-checkout",
    body: Record<string, unknown>,
  ): Promise<CheckoutResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("unauthorized");
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error ?? `http_${res.status}`);
    }
    return json as CheckoutResponse;
  }

  const handleWiseSubmit = async () => {
    if (!wiseConfirmed) {
      showError(t("checkout.wiseConfirmRequired"));
      return;
    }
    if (!application) return;
    setProcessing(true);
    setSubmitError(null);
    try {
      if (!wiseKeyRef.current) wiseKeyRef.current = newIdempotencyKey();
      const res = await callEdgeFunction("wise-checkout", {
        planId: application.plan_key, // Use the plan_key from the application
        idempotencyKey: wiseKeyRef.current,
        isTest: testMode,
      });
      setWiseResponse(res);
      if (res.payment?.id) setPaymentId(res.payment.id);
    } catch (e: any) {
      setSubmitError(String(e?.message ?? e));
    } finally {
      setProcessing(false);
    }
  };

  const handleCryptoSubmit = async () => {
    if (!application) return;
    setProcessing(true);
    setSubmitError(null);
    try {
      if (!cryptoKeyRef.current) cryptoKeyRef.current = newIdempotencyKey();
      const res = await callEdgeFunction("crypto-checkout", {
        planId: application.plan_key,
        network: selectedCryptoIdRef.current,
        idempotencyKey: cryptoKeyRef.current,
        isTest: testMode,
      });
      setCryptoResponse(res);
      if (res.payment?.id) setPaymentId(res.payment.id);
    } catch (e: any) {
      setSubmitError(String(e?.message ?? e));
    } finally {
      setProcessing(false);
    }
  };

  const handleStripeSubmit = async () => {
    if (!application) return;
    setProcessing(true);
    setSubmitError(null);
    try {
      if (!stripeKeyRef.current) stripeKeyRef.current = newIdempotencyKey();
      const res = await callEdgeFunction("stripe-checkout", {
        planId: application.plan_key,
        idempotencyKey: stripeKeyRef.current,
        isTest: testMode,
      });
      setStripeResponse(res);
      if (res.pending_payment_id) {
        setPaymentId(res.pending_payment_id);
      }
      // Redirect to Stripe Checkout
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (e: any) {
      setSubmitError(String(e?.message ?? e));
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
      </div>
    );
  }

  if (loading || processing) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
          {processing ? t("checkout.processing") : t("checkout.loading")}
        </p>
      </div>
    );
  }

  // Fail-closed gate
  if (!testMode && !prodMode) {
    return (
      <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] mb-12 transition-colors"
          >
            <ArrowLeft size={14} /> {t("nav.pricing")}
          </Link>
          <PaymentsDisabledNotice />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] mb-12 transition-colors"
        >
          <ArrowLeft size={14} /> {t("nav.pricing")}
        </Link>

        {testMode && (
          <div className="mb-8 p-4 border-2 border-yellow-500/60 bg-yellow-500/10 text-yellow-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
            <ShieldAlert size={18} />
            TEST MODE — No real money. No real bank. No real wallet. No real activation.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Summary */}
          <div className="lg:col-span-5 space-y-8">
            <div className="animate-fadeInUp">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">
                {t("checkout.summary")}
              </span>
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                {t("checkout.subscriptionTitle")} <span className="text-[#C5A059]">{t("checkout.subscriptionSubtitle")}</span>
              </h1>
            </div>

            <div className="bg-[#080B12] border border-white/10 p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck size={160} />
              </div>

              <div className="flex justify-between items-center pb-8 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-2xl uppercase tracking-tight">
                    {enhancedPlan.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                    {t("checkout.tierLabel")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif font-bold text-[#C5A059]">
                    {'€' + enhancedPlan.priceEUR?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                    {t("checkout.billedMonthly")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-2 border-[#C5A059] pl-3">
                    {t("checkout.detailsTitle")}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{t("checkout.serviceAccess")}</span>
                      <span className="text-[22px] font-serif font-bold text-[#C5A059]">
                        {'€' + enhancedPlan.priceEUR?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{t("checkout.setupFee")}</span>
                      <span className="text-green-500">{t("checkout.waived")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-2 border-[#C5A059] pl-3">
                    {t("checkout.infrastructureTitle")}
                  </h4>
                  <ul className="space-y-2">
                    {enhancedPlan.features?.map((f: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400"
                      >
                        <CheckCircle2 size={12} className="text-[#C5A059]" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 flex gap-4">
              <ShieldAlert className="text-[#C5A059] shrink-0" size={20} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                {t("checkout.riskDisclosure")}
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#080B12] border border-white/10 p-8 space-y-8">
              {user && (
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate max-w-[200px]">
                    {user.email}
                  </span>
                  <ShieldCheck size={16} className="text-green-500 shrink-0" />
                </div>
              )}

              {paymentId && serverStatus && (
                <div className="p-4 border border-white/10 bg-white/[0.02] space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    Payment Status
                  </p>
                  <CheckoutStatusBadge status={serverStatus.status as any} />
                  <p className="text-[9px] text-slate-500">ID: {paymentId}</p>
                </div>
              )}

              {submitError && (
                <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-300 text-[10px] font-bold uppercase tracking-widest">
                  {submitError}
                </div>
              )}

              {!showWise && !showCrypto && !showStripe ? (
                <div className="space-y-8 animate-fadeInUp">
                  <div className="space-y-4">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">
                      {t("checkout.selectPaymentMethod")}
                    </h2>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
                      {t("checkout.choosePayment")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <button
                      onClick={() => setShowWise(true)}
                      className="relative p-8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-emerald-500 transition-all text-left group"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-white/10 mb-4">
                        <Building2 size={28} className="text-emerald-500" />
                      </div>
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">
                        {t("checkout.wiseTransfer")}
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {t("checkout.wiseDesc")}
                      </p>
                    </button>

                    <button
                      onClick={() => setShowCrypto(true)}
                      className="relative p-8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-orange-500 transition-all text-left group"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center border border-white/10 mb-4">
                        <Bitcoin size={28} className="text-orange-500" />
                      </div>
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">
                        {t("checkout.crypto")}
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {t("checkout.cryptoDesc")}
                      </p>
                    </button>

                    <button
                      onClick={() => setShowStripe(true)}
                      className="relative p-8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-[#C5A059] transition-all text-left group"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-[#C5A059]/20 to-[#C5A059]/5 flex items-center justify-center border border-white/10 mb-4">
                        <CreditCard size={28} className="text-[#C5A059]" />
                      </div>
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">
                        {t("checkout.card")}
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {t("checkout.cardDesc")}
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeInUp">
                  <button
                    onClick={handleBack}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#C5A059]/10 border border-[#C5A059]/30 hover:bg-[#C5A059]/20 text-[#C5A059]"
                  >
                    <ArrowLeft size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                      {t("checkout.back")}
                    </span>
                  </button>

                  {showCrypto && !cryptoResponse && (
                    <div className="space-y-6">
                      <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                          {t("checkout.amountToPay")}
                        </p>
                        <p className="text-2xl font-bold text-[#C5A059]">
                          {'€' + numericPriceEUR}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          {t("checkout.selectNetwork")}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {CRYPTO_NETWORKS.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                selectedCryptoIdRef.current = n.id;
                              }}
                              className="p-3 border border-white/10 bg-white/[0.02] text-left transition-all hover:border-[#C5A059]"
                            >
                              <span className="text-[9px] font-bold uppercase tracking-widest block">
                                {n.symbol}
                              </span>
                              <span className="text-[8px] text-slate-500">{n.id}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleCryptoSubmit}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                      >
                        {t("checkout.confirmCrypto")}
                      </Button>
                    </div>
                  )}

                  {showCrypto && cryptoResponse && (
                    <CryptoAwaitingView response={cryptoResponse} />
                  )}

                  {showWise && !wiseResponse && (
                    <div className="space-y-6">
                      <label className="flex items-start gap-3 cursor-pointer p-4 bg-white/[0.02] border border-white/10">
                        <input
                          type="checkbox"
                          checked={wiseConfirmed}
                          onChange={(e) => setWiseConfirmed(e.target.checked)}
                          className="mt-1 w-4 h-4 accent-emerald-500"
                        />
                        <span className="text-[9px] text-slate-400 leading-relaxed">
                          {t("checkout.wiseConfirmText")}
                        </span>
                      </label>

                      <Button
                        onClick={handleWiseSubmit}
                        disabled={!wiseConfirmed}
                        className={`w-full rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] ${
                          wiseConfirmed
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : "bg-slate-700 text-slate-500 cursor-not-allowed"`
                        }`}
                      >
                        {t("checkout.confirmWise")}
                      </Button>
                    </div>
                  )}

                  {showWise && wiseResponse && (
                    <WiseAwaitingView response={wiseResponse} />
                  )}

                  {showStripe && !stripeResponse && (
                    <div className="space-y-6">
                      <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                          {t("checkout.amountToPay")}
                        </p>
                        <p className="text-2xl font-bold text-[#C5A059]">
                          {'€' + numericPriceEUR}
                        </p>
                      </div>

                      <Button
                        onClick={handleStripeSubmit}
                        className="w-full bg-[#C5A059] hover:bg-[#C5A059]/80 text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                      >
                        {t("checkout.confirmCard")}
                      </Button>
                    </div>
                  )}

                  {showStripe && stripeResponse && (
                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-500">
                        {t("checkout.redirecting")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

function WiseAwaitingView({ response }: { response: CheckoutResponse }) {
  return (
    <div className="space-y-4">
      {response.payment && (
        <CheckoutStatusBadge
          status={(response.payment.status as any) ?? "pending_manual"}
        />
      )}
      {response.warnings?.map((w, i) => (
        <p key={i} className="text-[10px] text-yellow-300">
          ⚠️ {w}
        </p>
      ))}
      {response.bank_details && (
        <div className="p-4 bg-white/[0.02] border border-white/10 text-[10px] text-slate-300 font-mono space-y-1">
          <p>Holder: {response.bank_details.holder_name}</p>
          <p>Bank: {response.bank_details.bank_name}</p>
          <p>Account: {response.bank_details.account_number}</p>
          <p>Routing: {response.bank_details.routing_number}</p>
          <p>SWIFT: {response.bank_details.swift}</p>
          <p>Reference: {response.bank_details.reference}</p>
        </div>
      )}
    </div>
  );
}

function CryptoAwaitingView({ response }: { response: CheckoutResponse }) {
  return (
    <div className="space-y-4">
      {response.payment && (
        <CheckoutStatusBadge status={(response.payment.status as any) ?? "pending"} />
      )}
      {response.warnings?.map((w, i) => (
        <p key={i} className="text-[10px] text-yellow-300">
          ⚠️ {w}
        </p>
      ))}
      {response.deposit_address && (
        <div className="p-4 bg-white/[0.02] border border-white/10 text-[10px] text-slate-300 font-mono break-all">
          {response.deposit_address}
        </div>
      )}
    </div>
  );
}

export default Checkout;