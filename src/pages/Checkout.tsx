"use client";

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  UserPlus, 
  LogIn,
  ChevronRight,
  ShieldAlert,
  Globe,
  Zap,
  Server,
  Activity,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const plan = location.state?.plan;

  const getPayPalLocale = (lng: string) => {
    const map: Record<string, string> = {
      'en': 'en_US', 'pt': 'pt_BR', 'es': 'es_ES', 'it': 'it_IT',
      'fr': 'fr_FR', 'de': 'de_DE', 'ru': 'ru_RU', 'zh': 'zh_CN',
      'ja': 'ja_JP', 'ar': 'ar_EG', 'he': 'he_IL'
    };
    return map[lng] || 'en_US';
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      setLoading(false);
    };
    if (!plan) { navigate('/pricing'); return; }
    checkUser();
  }, [plan, navigate]);

  const handlePaymentCapture = async (orderId: string) => {
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1/paypal-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          orderId,
          planName: plan.name,
          accountSize: plan.accountSize
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        showSuccess(t('checkout.successMessage') || "Payment verified! Your infrastructure is being deployed.");
        navigate('/dashboard');
      } else {
        throw new Error(result.error || "Verification failed");
      }
    } catch (error: any) {
      showError(error.message || "Error verifying payment. Please contact support.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || processing) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
          {processing ? "Verifying Institutional Transaction..." : "Loading Terminal..."}
        </p>
      </div>
    );
  }

  const numericPrice = plan.price.replace(/[^0-9.]/g, '');

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />
      
      <div className="container mx-auto px-8 pt-[140px] pb-20">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] mb-12 transition-colors">
          <ArrowLeft size={14} /> {t('nav.pricing')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
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
                  <span className="text-3xl font-serif font-bold text-[#C5A059]">{plan.price}</span>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">{t('checkout.billedMonthly')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-2 border-[#C5A059] pl-3">{t('checkout.detailsTitle')}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{t('checkout.managedCapital')}</span>
                      <span className="text-white">{plan.accountSize} USD</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{t('checkout.setupFee')}</span>
                      <span className="text-green-500">{t('checkout.waived')}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500">{t('checkout.latency')}</span>
                      <span className="text-white">{"< 1.8ms"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-2 border-[#C5A059] pl-3">{t('checkout.infrastructureTitle')}</h4>
                  <ul className="space-y-2">
                    {plan.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <CheckCircle2 size={12} className="text-[#C5A059]" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-[#C5A059]">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white">{t('checkout.realTimeMonitoring')}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.activeUponDeployment')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('checkout.totalDue')}</span>
                  <p className="text-4xl font-serif font-bold text-white">{plan.price}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-[#080B12] border border-white/10 text-center space-y-3">
                <Server size={20} className="mx-auto text-[#C5A059]" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-white">{t('checkout.dedicatedNode')}</p>
              </div>
              <div className="p-6 bg-[#080B12] border border-white/10 text-center space-y-3">
                <Globe size={20} className="mx-auto text-[#C5A059]" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-white">{t('checkout.globalMarkets')}</p>
              </div>
              <div className="p-6 bg-[#080B12] border border-white/10 text-center space-y-3">
                <Zap size={20} className="mx-auto text-[#C5A059]" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-white">{t('checkout.instantSetup')}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pt-[92px]">
            <div className="bg-[#080B12] border border-white/10 p-10 space-y-8">
              {!user ? (
                <div className="space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
                      <Lock size={24} />
                    </div>
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">{t('checkout.authRequired')}</h2>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                      {t('checkout.authDesc')}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <Button 
                      onClick={() => navigate('/login', { state: { from: location.pathname, plan } })}
                      className="bg-white text-black hover:bg-slate-200 rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                    >
                      <LogIn size={16} className="mr-2" /> {t('checkout.btnLogin')}
                    </Button>
                    <Button 
                      onClick={() => navigate('/register', { state: { from: location.pathname, plan } })}
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                    >
                      <UserPlus size={16} className="mr-2" /> {t('checkout.btnRegister')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate max-w-[200px]">
                        {user.email}
                      </span>
                    </div>
                    <ShieldCheck size={16} className="text-green-500" />
                  </div>

                  {!showPayPal ? (
                    <div className="space-y-6 animate-fadeInUp">
                      <div className="space-y-4">
                        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">{t('checkout.confirmDeployment')}</h2>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
                          {t('checkout.deploymentDesc', { plan: plan.name })}
                        </p>
                      </div>

                      <Button 
                        onClick={() => setShowPayPal(true)}
                        className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-16 font-black text-[12px] uppercase tracking-[0.3em] transition-all group"
                      >
                        {t('checkout.proceedPayment')} <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                        </div>
                        <p className="text-[8px] text-center text-slate-600 uppercase tracking-widest">{t('checkout.encryptionNote')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-fadeInUp">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">{t('checkout.secureGateway')}</h2>
                        <button 
                          onClick={() => setShowPayPal(false)}
                          className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                          {t('checkout.back')}
                        </button>
                      </div>

                      <div className="relative z-0">
                        <PayPalScriptProvider options={{ 
                          clientId: "AVu8P_UbVKDXdzWpP65YV2ZCSSzG4SexNA4ZacE-pNiRgwM2iLwUEzCJi6CNaZlHzk3FfLq-DhBrjVZz",
                          locale: getPayPalLocale(i18n.language),
                          currency: "EUR",
                          components: "buttons",
                          "disable-funding": "credit,card" // Removido para permitir cartões
                        }}> 
                          <PayPalButtons 
                            style={{ 
                              layout: "vertical", 
                              color: "gold", 
                              shape: "rect", 
                              label: "pay",
                              height: 50
                            }}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                intent: "CAPTURE",
                                purchase_units: [
                                  {
                                    amount: {
                                      value: numericPrice,
                                      currency_code: "EUR"
                                    },
                                    description: `Braxel Markets - ${plan.name} Investment Plan`
                                  },
                                ],
                              });
                            }}
                            onApprove={async (data, actions) => {
                              if (data.orderID) {
                                await handlePaymentCapture(data.orderID);
                              }
                            }}
                          />
                        </PayPalScriptProvider>
                      </div>

                      <div className="p-4 bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          <CreditCard size={12} /> {t('checkout.secureTransaction')}
                        </div>
                        <p className="text-[8px] text-slate-600 leading-relaxed uppercase tracking-tighter">
                          {t('checkout.paypalNote')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 flex gap-4">
              <ShieldAlert className="text-[#C5A059] shrink-0" size={20} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                {t('checkout.riskDisclosure')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;