"use client";

import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// Redes de criptomoedas suportadas
const cryptoNetworks = [
  { id: 'TRC20', name: 'TRON (TRC20)', symbol: 'USDT', explorer: 'https://tronscan.org' },
  { id: 'ERC20', name: 'Ethereum (ERC20)', symbol: 'USDT', explorer: 'https://etherscan.io' },
  { id: 'BEP20', name: 'BNB Chain (BEP20)', symbol: 'USDT', explorer: 'https://bscscan.io' },
];

const Checkout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showCard, setShowCard] = useState(false);
  const [showCrypto, setShowCrypto] = useState(false);
  const [processing, setProcessing] = useState(false);
  const plan = location.state?.plan;

  // Dados do cartão
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  // Dados da cripto
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoNetworks[0]);
  const [cryptoAddress, setCryptoAddress] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      setLoading(false);
    };
    if (!plan) { navigate('/pricing'); return; }
    checkUser();
  }, [plan, navigate]);

  const numericPrice = plan.price.replace(/[^0-9.]/g, '');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardSubmit = async () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
      showError(t('checkout.fillAllFields') || "Fill all card fields");
      return;
    }

    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1/card-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          planName: plan.name,
          accountSize: plan.accountSize,
          cardLast4: cardData.number.replace(/\s/g, '').slice(-4),
          cardName: cardData.name,
          amount: numericPrice,
          currency: 'USD'
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        showSuccess(t('checkout.paymentSuccess') || "Payment approved!");
        navigate('/dashboard');
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error: any) {
      showError(error.message || "Payment error.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCryptoSubmit = async () => {
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1/crypto-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          planName: plan.name,
          accountSize: plan.accountSize,
          network: selectedCrypto.id,
          amountUSD: numericPrice,
          userAddress: cryptoAddress
        })
      });

      const result = await response.json();
      
      if (result.status === 'success' || result.status === 'pending') {
        showSuccess(t('checkout.cryptoPending') || "Payment registered!");
      } else {
        throw new Error(result.error || "Error");
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(t('checkout.copied') || "Copied!");
  };

  if (loading || processing) {
    return (
      <div className="min-h-screen bg-[#05070A] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
          {processing ? (t('checkout.processing') || "Processing...") : (t('checkout.loading') || "Loading...")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />
      
      <div className="container mx-auto px-8 pt-[140px] pb-20">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] mb-12 transition-colors">
          <ArrowLeft size={14} /> {t('nav.pricing')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Coluna Esquerda - Resumo */}
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
                  <p className="text-xl font-serif font-bold text-[#C5A059]">{plan.price}</p>
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

          {/* Coluna Direita - Pagamento */}
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

              {!showCard && !showCrypto ? (
                <div className="space-y-8 animate-fadeInUp">
                  <div className="space-y-4">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">{t('checkout.selectPaymentMethod')}</h2>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
                      {t('checkout.choosePayment')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cartão de Crédito */}
                    <button
                      onClick={() => setShowCard(true)}
                      className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#C5A059] transition-all text-left group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#1A1F71]/20 flex items-center justify-center">
                          <CreditCard size={24} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest">{t('checkout.creditCard')}</h3>
                          <p className="text-[9px] text-slate-500">{t('checkout.instantPayment')}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                        {t('checkout.cardDesc')}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                      </div>
                    </button>

                    {/* Criptomoedas */}
                    <button
                      onClick={() => setShowCrypto(true)}
                      className="p-6 bg-white/[0.02] border border-white/10 hover:border-[#C5A059] transition-all text-left group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#F7931A]/20 flex items-center justify-center">
                          <Bitcoin size={24} className="text-[#F7931A]" />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-bold uppercase tracking-widest">{t('checkout.crypto')}</h3>
                          <p className="text-[9px] text-slate-500">{t('checkout.cryptoLabel')}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                        {t('checkout.cryptoDesc')}
                      </p>
                    </button>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <Lock size={12} /> {t('checkout.securePayment')}
                    </div>
                    <p className="text-[8px] text-slate-600 mt-2">{t('checkout.encryptionNote')}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeInUp">
                  <button 
                    onClick={() => { setShowCard(false); setShowCrypto(false); }}
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    ← {t('checkout.back')}
                  </button>

                  {/* CARTÃO DE CRÉDITO */}
                  {showCard && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-blue-400" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">{t('checkout.creditCard')}</span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.cardNumber')}</label>
                        <input
                          type="text"
                          value={cardData.number}
                          onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 tracking-widest focus:border-[#C5A059] outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.cardName')}</label>
                        <input
                          type="text"
                          value={cardData.name}
                          onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                          placeholder="JOAO SILVA"
                          className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 uppercase tracking-widest focus:border-[#C5A059] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.cardExpiry')}</label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 tracking-widest focus:border-[#C5A059] outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">CVC</label>
                          <input
                            type="text"
                            value={cardData.cvc}
                            onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')})}
                            placeholder="123"
                            maxLength={4}
                            className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-medium text-white placeholder:text-slate-700 tracking-widest focus:border-[#C5A059] outline-none"
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleCardSubmit}
                        className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                      >
                        {t('checkout.payNow')} {plan.price}
                      </Button>
                    </div>
                  )}

                  {/* CRIPTOMOEDAS */}
                  {showCrypto && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Bitcoin size={16} className="text-[#F7931A]" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#F7931A]">{t('checkout.crypto')}</span>
                      </div>

                      <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.amountToPay')}</p>
                        <p className="text-2xl font-bold text-[#C5A059]">{numericPrice} USD</p>
                        <p className="text-[9px] text-slate-600 mt-1">≈ {numericPrice} USDT</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.selectNetwork')}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {cryptoNetworks.map((network) => (
                            <button
                              key={network.id}
                              onClick={() => setSelectedCrypto(network)}
                              className={`p-3 border ${selectedCrypto.id === network.id ? 'border-[#C5A059] bg-[#C5A059]/10' : 'border-white/10 bg-white/[0.02]'} text-left transition-all`}
                            >
                              <span className="text-[9px] font-bold uppercase tracking-widest block">{network.symbol}</span>
                              <span className="text-[8px] text-slate-500">{network.id}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.yourAddress')}</label>
                        <input
                          type="text"
                          value={cryptoAddress}
                          onChange={(e) => setCryptoAddress(e.target.value)}
                          placeholder={t('checkout.yourAddressPlaceholder')}
                          className="w-full bg-white/5 border border-white/10 h-12 px-4 text-[11px] font-mono text-white placeholder:text-slate-700 tracking-widest focus:border-[#C5A059] outline-none"
                        />
                      </div>

                      <div className="p-4 bg-[#F7931A]/10 border border-[#F7931A]/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#F7931A]">{t('checkout.important')}</p>
                        <p className="text-[8px] text-slate-500 mt-1">{t('checkout.cryptoNote')}</p>
                      </div>

                      <Button 
                        onClick={handleCryptoSubmit}
                        className="w-full bg-[#F7931A] hover:bg-[#e08613] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                      >
                        <Wallet size={16} className="mr-2" />
                        {t('checkout.confirmCrypto')}
                      </Button>
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

export default Checkout;
