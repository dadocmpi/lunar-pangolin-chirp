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
  CreditCard,
  QrCode,
  Smartphone,
  Globe2,
  Building2,
  User,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// Lista de países com moedas
const countries = [
  { code: 'BR', name: 'Brazil', currency: 'BRL', flag: '🇧🇷' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
  { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', currency: 'EUR', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', currency: 'EUR', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', currency: 'EUR', flag: '🇵🇹' },
  { code: 'MX', name: 'Mexico', currency: 'MXN', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', currency: 'ARS', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', currency: 'CLP', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', currency: 'COP', flag: '🇨🇴' },
  { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
  { code: 'CN', name: 'China', currency: 'CNY', flag: '🇨🇳' },
  { code: 'KR', name: 'South Korea', currency: 'KRW', flag: '🇰🇷' },
  { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
  { code: 'RU', name: 'Russia', currency: 'USD', flag: '🇷🇺' },
  { code: 'AE', name: 'UAE', currency: 'AED', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', flag: '🇸🇦' },
  { code: 'OTHER', name: 'Other Country', currency: 'USD', flag: '🌍' },
];

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [showWise, setShowWise] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'wise' | null>(null);
  const plan = location.state?.plan;

  // Dados do cliente para Wise
  const [clientData, setClientData] = useState({
    country: '',
    fullName: '',
    document: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [step, setStep] = useState<'method' | 'data' | 'payment'>('method');

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
          {processing ? t('checkout.verifying') : t('checkout.loading')}
        </p>
      </div>
    );
  }

  const numericPrice = plan.price.replace(/[^0-9.]/g, '');
  
  const handleSelectPaymentMethod = (method: 'paypal' | 'wise') => {
    setPaymentMethod(method);
    if (method === 'wise') {
      setShowWise(true);
      setShowPayPal(false);
      // Preencher com dados do usuário se disponíveis
      if (user) {
        setClientData(prev => ({
          ...prev,
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        }));
      }
    } else {
      setShowPayPal(true);
      setShowWise(false);
    }
    setStep('payment');
  };

  const handleWiseSubmit = async () => {
    // Validar dados
    if (!clientData.country || !clientData.fullName || !clientData.document) {
      showError(t('checkout.fillAllFields') || "Please fill all required fields");
      return;
    }
    
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Aqui você integraria com a API do Wise
      // Por enquanto, simulamos a criação de uma conta Wise
      const response = await fetch('https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1/wise-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          planName: plan.name,
          accountSize: plan.accountSize,
          clientData: clientData,
          amount: numericPrice
        })
      });

      const result = await response.json();
      
      if (result.status === 'success' || result.status === 'pending') {
        // Redirecionar para o Wise ou mostrar instruções
        if (result.wiseUrl) {
          window.open(result.wiseUrl, '_blank');
        }
        showSuccess(t('checkout.wiseInstructions') || "Wise payment instructions sent. Complete your payment and return here.");
        navigate('/dashboard');
      } else {
        throw new Error(result.error || "Error processing Wise payment");
      }
    } catch (error: any) {
      showError(error.message || "Error processing payment. Please contact support.");
    } finally {
      setProcessing(false);
    }
  };

  const handleBackToMethod = () => {
    setStep('method');
    setPaymentMethod(null);
    setShowPayPal(false);
    setShowWise(false);
  };

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

                  {!showPayPal && !showWise ? (
                    <div className="space-y-8 animate-fadeInUp">
                      <div className="space-y-4">
                        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">{t('checkout.selectPaymentMethod')}</h2>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
                          {t('checkout.choosePayment')}
                        </p>
                      </div>

                      {/* Seleção de Método de Pagamento */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* PayPal */}
                        <button
                          onClick={() => handleSelectPaymentMethod('paypal')}
                          className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#C5A059] transition-all text-left group"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-[#003087]/20 flex items-center justify-center">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                            </div>
                            <div>
                              <h3 className="text-[11px] font-bold uppercase tracking-widest">PayPal</h3>
                              <p className="text-[9px] text-slate-500">Credit/Debit Cards</p>
                            </div>
                          </div>
                          <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                            {t('checkout.paypalDesc') || "Fast and secure payment with PayPal protection"}
                          </p>
                        </button>

                        {/* Wise */}
                        <button
                          onClick={() => handleSelectPaymentMethod('wise')}
                          className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#C5A059] transition-all text-left group"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-[#00B9E6]/20 flex items-center justify-center">
                              <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#00B9E6]" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-6h-2v6zm0-8h2V7h-2v2z"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-[11px] font-bold uppercase tracking-widest">Wise</h3>
                              <p className="text-[9px] text-slate-500">{t('checkout.wiseLabel') || "International Transfers"}</p>
                            </div>
                          </div>
                          <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                            {t('checkout.wiseDesc') || "Low cost international bank transfers"}
                          </p>
                        </button>
                      </div>

                      {/* Wise Form */}
                      {showWise && (
                        <div className="p-6 bg-white/[0.02] border border-[#00B9E6]/30 space-y-6 animate-fadeInUp">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Globe2 size={16} className="text-[#00B9E6]" />
                              <span className="text-[11px] font-bold uppercase tracking-widest text-[#00B9E6]">{t('checkout.wiseForm')}</span>
                            </div>
                            <button 
                              onClick={handleBackToMethod}
                              className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            >
                              {t('checkout.back')}
                            </button>
                          </div>

                          {/* Seleção de País */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.selectCountry')} *</label>
                            <select
                              value={clientData.country}
                              onChange={(e) => setClientData({...clientData, country: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white uppercase tracking-widest focus:border-[#00B9E6] outline-none"
                            >
                              <option value="">{t('checkout.selectCountry')}</option>
                              {countries.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.currency})</option>
                              ))}
                            </select>
                          </div>

                          {/* Nome Completo */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.fullName')} *</label>
                            <div className="relative">
                              <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                              <input
                                type="text"
                                value={clientData.fullName}
                                onChange={(e) => setClientData({...clientData, fullName: e.target.value})}
                                placeholder={t('checkout.fullNamePlaceholder') || "John Doe"}
                                className="w-full bg-white/5 border border-white/10 h-12 pl-12 pr-4 text-[11px] font-medium text-white placeholder:text-slate-700 uppercase tracking-widest focus:border-[#00B9E6] outline-none"
                              />
                            </div>
                          </div>

                          {/* Documento (CPF/CNPJ/Passport) */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              {clientData.country === 'BR' ? 'CPF/CNPJ' : 'ID/Passport'} *
                            </label>
                            <div className="relative">
                              <FileText size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                              <input
                                type="text"
                                value={clientData.document}
                                onChange={(e) => setClientData({...clientData, document: e.target.value})}
                                placeholder={clientData.country === 'BR' ? '000.000.000-00' : 'AB123456'}
                                className="w-full bg-white/5 border border-white/10 h-12 pl-12 pr-4 text-[11px] font-medium text-white placeholder:text-slate-700 uppercase tracking-widest focus:border-[#00B9E6] outline-none"
                              />
                            </div>
                          </div>

                          {/* Endereço */}
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.address')} *</label>
                            <div className="relative">
                              <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                              <input
                                type="text"
                                value={clientData.address}
                                onChange={(e) => setClientData({...clientData, address: e.target.value})}
                                placeholder={t('checkout.addressPlaceholder') || "123 Main St, Apt 4"}
                                className="w-full bg-white/5 border border-white/10 h-12 pl-12 pr-4 text-[11px] font-medium text-white placeholder:text-slate-700 uppercase tracking-widest focus:border-[#00B9E6] outline-none"
                              />
                            </div>
                          </div>

                          {/* Cidade e CEP */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.city')} *</label>
                              <input
                                type="text"
                                value={clientData.city}
                                onChange={(e) => setClientData({...clientData, city: e.target.value})}
                                placeholder={t('checkout.cityPlaceholder') || "São Paulo"}
                                className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 uppercase tracking-widest focus:border-[#00B9E6] outline-none"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.postalCode')} *</label>
                              <input
                                type="text"
                                value={clientData.postalCode}
                                onChange={(e) => setClientData({...clientData, postalCode: e.target.value})}
                                placeholder={t('checkout.postalCodePlaceholder') || "01310-100"}
                                className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 uppercase tracking-widest focus:border-[#00B9E6] outline-none"
                              />
                            </div>
                          </div>

                          <Button 
                            onClick={handleWiseSubmit}
                            disabled={processing}
                            className="w-full bg-[#00B9E6] hover:bg-[#00a3c9] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                          >
                            {processing ? <Loader2 className="animate-spin" /> : t('checkout.proceedWise')}
                          </Button>

                          <p className="text-[8px] text-center text-slate-600 uppercase tracking-widest">
                            {t('checkout.wiseNote') || "You will be redirected to Wise to complete your international transfer"}
                          </p>
                        </div>
                      )}

                      {!showWise && (
                        <div className="p-6 bg-white/[0.02] border border-white/10 space-y-6">
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center">{t('checkout.globalInfra')}</p>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-[#C5A059]">
                                <QrCode size={18} />
                              </div>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600">{t('checkout.qrCode')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-[#C5A059]">
                                <CreditCard size={18} />
                              </div>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600">{t('checkout.allCards')}</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-[#C5A059]">
                                <Smartphone size={18} />
                              </div>
                              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600">{t('checkout.localPay')}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {showPayPal && !showWise && (
                        <Button 
                          onClick={() => setShowPayPal(false)}
                          className="w-full bg-white/5 hover:bg-white/10 text-white rounded-none h-12 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                        >
                          {t('checkout.back')}
                        </Button>
                      )}

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                          <svg viewBox="0 0 24 24" className="h-5 text-[#00B9E6]" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                          </svg>
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
                          onClick={() => { setShowPayPal(false); setShowWise(false); setStep('method'); }}
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
                          "disable-funding": "credit,paylater",
                          "enable-funding": "card"
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
                                application_context: {
                                  shipping_preference: "NO_SHIPPING",
                                  user_action: "PAY_NOW"
                                }
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
                          <Globe size={12} /> International Cards & Local Methods Accepted
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