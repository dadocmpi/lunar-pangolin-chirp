"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Activity,
  CreditCard,
  User,
  Bitcoin,
  Wallet,
  Lock,
  ExternalLink,
  Building2,
  Globe,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { CheckoutStatusBadge } from '@/components/CheckoutStatusBadge';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';

interface WiseDetails {
  holderName: string;
  bankName: string;
  address: string;
  accountNumber: string;
  routingNumber: string;
  swift: string;
  reference: string;
}

interface CheckoutResponse {
  ok: boolean;
  mode: 'test';
  message: string;
  payment: { id: string; status: string; planId: string; amountCents: number; currency: string };
  bankDetails?: WiseDetails;
  depositAddress?: string;
  warnings: string[];
}

const CRYPTO_NETWORKS = [
  { id: 'BTC', name: 'Bitcoin (BTC)', symbol: 'BTC' },
  { id: 'TRC20', name: 'TRON (TRC20)', symbol: 'USDT' },
  { id: 'ETH', name: 'Ethereum (ERC20)', symbol: 'ETH' },
  { id: 'BNB', name: 'BNB Chain (BEP20)', symbol: 'BNB' },
  { id: 'POLYGON', name: 'Polygon (MATIC)', symbol: 'MATIC' },
  { id: 'SOL', name: 'Solana (SOL)', symbol: 'SOL' },
] as const;

const TEST_MODE = true; // Hard-coded while production is paused. Flip when
// the business owner explicitly enables real payments.

function newIdempotencyKey() {
  // 24 hex chars (96 bits) is plenty for a click id and small enough to log.
  const buf = new Uint8Array(12);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

const Checkout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showCrypto, setShowCrypto] = useState(false);
  const [showWise, setShowWise] = useState(false);
  const [wiseConfirmed, setWiseConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Server-driven state
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [wiseResponse, setWiseResponse] = useState<CheckoutResponse | null>(null);
  const [cryptoResponse, setCryptoResponse] = useState<CheckoutResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const plan = location.state?.plan;
  const selectedCryptoIdRef = useRef<string>('BTC');
  const wiseKeyRef = useRef<string | null>(null);
  const cryptoKeyRef = useRef<string | null>(null);

  // Poll the server for the real status. The front end NEVER decides
  // "confirmed" by itself.
  const { view: serverStatus } = usePaymentStatus(paymentId, 4000);
  const userCanSeeConfirmed = serverStatus?.status === 'confirmed';

  useEffect(() => {
    if (!plan) {
      navigate('/pricing');
      return;
    }
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      setLoading(false);
    };
    checkUser();
  }, [plan, navigate]);

  const numericPrice = useMemo(() => {
    if (!plan) return '0';
    return String(plan.priceUSD ?? 0);
  }, [plan]);

  const handleBackToPaymentMethods = () => {
    setShowCrypto(false);
    setShowWise(false);
    setWiseConfirmed(false);
    setWiseResponse(null);
    setCryptoResponse(null);
    setPaymentId(null);
  };

  async function callEdgeFunction(
    functionName: 'wise-checkout' | 'crypto-checkout',
    body: Record<string, unknown>,
  ): Promise<CheckoutResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('unauthorized');
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      },
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error ?? `http_${res.status}`);
    }
    return json as CheckoutResponse;
  }

  const handleWiseSubmit = async () => {
    if (!wiseConfirmed) {
      showError(t('checkout.wiseConfirmRequired'));
      return;
    }
    if (!plan) return;
    setProcessing(true);
    setSubmitError(null);
    try {
      if (!wiseKeyRef.current) wiseKeyRef.current = newIdempotencyKey();
      const res = await callEdgeFunction('wise-checkout', {
        planId: plan.id ?? 'starter',
        idempotencyKey: wiseKeyRef.current,
        currency: 'USD',            // server overrides, but we send it
        amountCents: 1,             // server overrides, we send a lie to test
        network: null,
      });
      setWiseResponse(res);
      setPaymentId(res.payment.id);
    } catch (e: any) {
      setSubmitError(String(e?.message ?? e));
    } finally {
      setProcessing(false);
    }
  };

  const handleCryptoSubmit = async () => {
    if (!plan) return;
    setProcessing(true);
    setSubmitError(null);
    try {
      if (!cryptoKeyRef.current) cryptoKeyRef.current = newIdempotencyKey();
      const res = await callEdgeFunction('crypto-checkout', {
        planId: plan.id ?? 'starter',
        network: selectedCryptoIdRef.current,
        idempotencyKey: cryptoKeyRef.current,
        currency: 'USD',
        amountCents: 1,
      });
      setCryptoResponse(res);
      setPaymentId(res.payment.id);
    } catch (e: any) {
      setSubmitError(String(e?.message ?? e));
    } finally {
      setProcessing(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
          Redirecting...
        </p>
      </div>
    );
  }

  if (loading || processing) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
          {processing ? t('checkout.processing') : t('checkout.loading')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] mb-12 transition-colors">
          <ArrowLeft size={14} /> {t('nav.pricing')}
        </Link>

        {/* TEST MODE banner */}
        <div
          data-test-mode="true"
          className="mb-8 p-4 border border-yellow-700/50 bg-yellow-950/20 text-yellow-300 text-[10px] font-bold uppercase tracking-widest"
        >
          ⚠ Test mode / coming soon — payment details below are safe placeholders.
          No real money will be moved and no service will be activated.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Summary */}
          <div className="lg:col-span-5 space-y-8">
            <div className="animate-fadeInUp">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('checkout.summary')}</span>
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                {t('checkout.allocationTitle')} <span className="text-[#C5A059]">{t('checkout.allocationSubtitle')}</span>
              </h1>
            </div>

            <div className="bg-[#080B12] border border-white/10 p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck size={160} />
              </div>

              <div className="flex justify-between items-center pb-8 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-2xl uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{t('checkout.tierLabel')}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif font-bold text-[#C5A059]">${plan.priceUSD?.toLocaleString()}</span>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">{t('checkout.billedMonthly')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-2 border-[#C5A059] pl-3">{t('checkout.detailsTitle')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{t('checkout.managedCapital')}</span>
                      <span className="text-[22px] font-serif font-bold text-[#C5A059]">
                        ${plan.accountSizeUsd?.toLocaleString() ?? '0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{t('checkout.setupFee')}</span>
                      <span className="text-green-500">{t('checkout.waived')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-2 border-[#C5A059] pl-3">{t('checkout.infrastructureTitle')}</h4>
                  <ul className="space-y-2">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                {t('checkout.riskDisclosure')}
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#080B12] border border-white/10 p-8 space-y-8">
              {user && (
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
                      <User size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate max-w-[200px]">
                      {user.email}
                    </span>
                  </div>
                  <ShieldCheck size={16} className="text-green-500" />
                </div>
              )}

              {/* Live status (server-driven) */}
              {paymentId && serverStatus && (
                <div className="p-4 border border-white/10 bg-white/[0.02] space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Payment Status</p>
                  <CheckoutStatusBadge status={serverStatus.status as any} />
                  <p className="text-[9px] text-slate-500">
                    ID: {paymentId}
                  </p>
                </div>
              )}

              {submitError && (
                <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-300 text-[10px] font-bold uppercase tracking-widest">
                  {submitError}
                </div>
              )}

              {!showWise && !showCrypto ? (
                <div className="space-y-8 animate-fadeInUp">
                  <div className="space-y-4">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">{t('checkout.selectPaymentMethod')}</h2>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
                      {t('checkout.choosePayment')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <button
                      onClick={() => setShowWise(true)}
                      className="relative p-8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-emerald-500 transition-all text-left group"
                      data-test-mode="true"
                    >
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-white/10 mb-4">
                          <Building2 size={28} className="text-emerald-500" />
                        </div>
                        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">
                          {t('checkout.wiseTransfer')} <span className="text-yellow-400 text-[9px] ml-2">TEST</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {t('checkout.wiseDesc')}
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setShowCrypto(true)}
                      className="relative p-8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-orange-500 transition-all text-left group"
                      data-test-mode="true"
                    >
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center border border-white/10 mb-4">
                          <Bitcoin size={28} className="text-orange-500" />
                        </div>
                        <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">
                          {t('checkout.crypto')} <span className="text-yellow-400 text-[9px] ml-2">TEST</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {t('checkout.cryptoDesc')}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeInUp">
                  <button
                    onClick={handleBackToPaymentMethods}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#C5A059]/10 border border-[#C5A059]/30 hover:bg-[#C5A059]/20 text-[#C5A059]"
                  >
                    <ArrowLeft size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{t('checkout.back')}</span>
                  </button>

                  {showCrypto && !cryptoResponse && (
                    <div className="space-y-6">
                      <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.amountToPay')}</p>
                        <p className="text-2xl font-bold text-[#C5A059]">${numericPrice} USD</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.selectNetwork')}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {CRYPTO_NETWORKS.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => { selectedCryptoIdRef.current = n.id; }}
                              className="p-3 border border-white/10 bg-white/[0.02] text-left transition-all hover:border-[#C5A059]"
                            >
                              <span className="text-[9px] font-bold uppercase tracking-widest block">{n.symbol}</span>
                              <span className="text-[8px] text-slate-500">{n.id}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={handleCryptoSubmit}
                        data-test-mode="true"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                      >
                        <Wallet size={16} className="mr-2" />
                        {t('checkout.confirmCrypto')} (TEST)
                      </Button>
                    </div>
                  )}

                  {showCrypto && cryptoResponse && (
                    <CryptoAwaitingView
                      response={cryptoResponse}
                      serverStatus={serverStatus}
                      userCanSeeConfirmed={userCanSeeConfirmed}
                    />
                  )}

                  {showWise && !wiseResponse && (
                    <div className="space-y-6">
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        We do not have an automated Wise integration. The bank
                        details below are a safe test placeholder. A real
                        deployment requires a Wise API key and webhook secret
                        configured by the business owner.
                      </p>

                      <label className="flex items-start gap-3 cursor-pointer p-4 bg-white/[0.02] border border-white/10">
                        <input
                          type="checkbox"
                          checked={wiseConfirmed}
                          onChange={(e) => setWiseConfirmed(e.target.checked)}
                          className="mt-1 w-4 h-4 accent-emerald-500"
                        />
                        <span className="text-[9px] text-slate-400 leading-relaxed">
                          {t('checkout.wiseConfirmText')}
                        </span>
                      </label>

                      <Button
                        onClick={handleWiseSubmit}
                        disabled={!wiseConfirmed}
                        data-test-mode="true"
                        className={`w-full rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] ${
                          wiseConfirmed
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Building2 size={16} className="mr-2" />
                        {t('checkout.confirmWise')} (TEST)
                      </Button>
                    </div>
                  )}

                  {showWise && wiseResponse && (
                    <WiseAwaitingView
                      response={wiseResponse}
                      serverStatus={serverStatus}
                      userCanSeeConfirmed={userCanSeeConfirmed}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Server-driven "we are waiting" views. These NEVER claim "Confirmed" unless
// the server has actually returned status=confirmed.
// ---------------------------------------------------------------------------

function WiseAwaitingView({
  response,
  serverStatus,
  userCanSeeConfirmed,
}: {
  response: CheckoutResponse;
  serverStatus: ReturnType<typeof usePaymentStatus>['view'];
  userCanSeeConfirmed: boolean;
}) {
  if (userCanSeeConfirmed) {
    return (
      <div className="p-6 border border-emerald-500/30 bg-emerald-500/10 space-y-2">
        <CheckoutStatusBadge status="confirmed" />
        <p className="text-[10px] text-emerald-200">
          Server returned status <strong>confirmed</strong>. An admin must still
          have manually approved this payment — Wise has no automated
          reconciliation yet.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <CheckoutStatusBadge status={(serverStatus?.status ?? 'pending_manual') as any} />
      <p className="text-[10px] text-slate-400 leading-relaxed">{response.message}</p>
      {response.bankDetails && (
        <div className="p-4 bg-white/[0.02] border border-white/10 text-[10px] text-slate-300 space-y-1 font-mono">
          <p>Holder: {response.bankDetails.holderName}</p>
          <p>Bank: {response.bankDetails.bankName}</p>
          <p>Account: {response.bankDetails.accountNumber}</p>
          <p>Routing: {response.bankDetails.routingNumber}</p>
          <p>SWIFT: {response.bankDetails.swift}</p>
          <p>Reference: {response.bankDetails.reference}</p>
        </div>
      )}
      <ul className="text-[10px] text-yellow-300 list-disc list-inside space-y-1">
        {response.warnings.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
    </div>
  );
}

function CryptoAwaitingView({
  response,
  serverStatus,
  userCanSeeConfirmed,
}: {
  response: CheckoutResponse;
  serverStatus: ReturnType<typeof usePaymentStatus>['view'];
  userCanSeeConfirmed: boolean;
}) {
  if (userCanSeeConfirmed) {
    return (
      <div className="p-6 border border-emerald-500/30 bg-emerald-500/10 space-y-2">
        <CheckoutStatusBadge status="confirmed" />
        <p className="text-[10px] text-emerald-200">
          Server returned status <strong>confirmed</strong> after on-chain
          verification of asset, network, destination wallet, amount, and
          confirmations.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <CheckoutStatusBadge status={(serverStatus?.status ?? 'pending') as any} />
      <p className="text-[10px] text-slate-400 leading-relaxed">{response.message}</p>
      {response.depositAddress && (
        <div className="p-4 bg-white/[0.02] border border-white/10 text-[10px] text-slate-300 font-mono break-all">
          {response.depositAddress}
        </div>
      )}
      <ul className="text-[10px] text-yellow-300 list-disc list-inside space-y-1">
        {response.warnings.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
    </div>
  );
}

export default Checkout;