"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { LogoVisa, LogoMastercard } from '@/components/LogoVault';
import { getCurrencyByCountry, convertFromUSD, formatCurrency, countryCurrencyMap } from '@/services/currencyService';
import { useCurrency } from '@/hooks/useCurrency';

// Lista completa de países do mundo com DDI e traduções
const countries = [
  { code: 'BR', name: 'Brazil', name_pt: 'Brasil', ddi: '+55', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', name_pt: 'Argentina', ddi: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', name_pt: 'Chile', ddi: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', name_pt: 'Colômbia', ddi: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', name_pt: 'Peru', ddi: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', name_pt: 'Venezuela', ddi: '+58', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', name_pt: 'Equador', ddi: '+593', flag: '🇪🇨' },
  { code: 'UY', name: 'Uruguay', name_pt: 'Uruguai', ddi: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', name_pt: 'Paraguai', ddi: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', name_pt: 'Bolívia', ddi: '+591', flag: '🇧🇴' },
  { code: 'US', name: 'United States', name_pt: 'Estados Unidos', ddi: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', name_pt: 'Canadá', ddi: '+1', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', name_pt: 'México', ddi: '+52', flag: '🇲🇽' },
  { code: 'GB', name: 'United Kingdom', name_pt: 'Reino Unido', ddi: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', name_pt: 'Alemanha', ddi: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', name_pt: 'França', ddi: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', name_pt: 'Itália', ddi: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', name_pt: 'Espanha', ddi: '+34', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', name_pt: 'Portugal', ddi: '+351', flag: '🇵🇹' },
  { code: 'NL', name: 'Netherlands', name_pt: 'Países Baixos', ddi: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', name_pt: 'Bélgica', ddi: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', name_pt: 'Suíça', ddi: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', name_pt: 'Áustria', ddi: '+43', flag: '🇦🇹' },
  { code: 'PL', name: 'Poland', name_pt: 'Polônia', ddi: '+48', flag: '🇵🇱' },
  { code: 'SE', name: 'Sweden', name_pt: 'Suécia', ddi: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', name_pt: 'Noruega', ddi: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', name_pt: 'Dinamarca', ddi: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', name_pt: 'Finlândia', ddi: '+358', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', name_pt: 'Irlanda', ddi: '+353', flag: '🇮🇪' },
  { code: 'GR', name: 'Greece', name_pt: 'Grécia', ddi: '+30', flag: '🇬🇷' },
  { code: 'RU', name: 'Russia', name_pt: 'Rússia', ddi: '+7', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', name_pt: 'Ucrânia', ddi: '+380', flag: '🇺🇦' },
  { code: 'TR', name: 'Turkey', name_pt: 'Turquia', ddi: '+90', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', name_pt: 'Israel', ddi: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'United Arab Emirates', name_pt: 'Emirados Árabes', ddi: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', name_pt: 'Arábia Saudita', ddi: '+966', flag: '🇸🇦' },
  { code: 'IN', name: 'India', name_pt: 'Índia', ddi: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'China', name_pt: 'China', ddi: '+86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', name_pt: 'Japão', ddi: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', name_pt: 'Coreia do Sul', ddi: '+82', flag: '🇰🇷' },
  { code: 'AU', name: 'Australia', name_pt: 'Austrália', ddi: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', name_pt: 'Nova Zelândia', ddi: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', name_pt: 'África do Sul', ddi: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', name_pt: 'Egito', ddi: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', name_pt: 'Nigéria', ddi: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', name_pt: 'Quênia', ddi: '+254', flag: '🇰🇪' },
];

// Redes de criptomoedas suportadas com suas carteiras
const cryptoNetworks = [
  { id: 'TRC20', name: 'TRON (TRC20)', symbol: 'USDT', address: 'TJZARrDbBjTjjUvEb7BwqD3AoFsVNyShtm', explorer: 'https://tronscan.org' },
  { id: 'BTC', name: 'Bitcoin (BTC)', symbol: 'BTC', address: 'bc1qfhkwc02k58h0q8yq9tqcyvja7cnrq57hwygm76', explorer: 'https://blockstream.info' },
  { id: 'ETH', name: 'Ethereum (ERC20)', symbol: 'ETH', address: '0x46252C57F22A5e3f2d5638bD21C892c9876D6e68', explorer: 'https://etherscan.io' },
  { id: 'BNB', name: 'BNB Chain (BEP20)', symbol: 'BNB', address: '0x46252C57F22A5e3f2d5638bD21C892c9876D6e68', explorer: 'https://bscscan.io' },
  { id: 'POLYGON', name: 'Polygon (MATIC)', symbol: 'MATIC', address: '0x46252C57F22A5e3f2d5638bD21C892c9876D6e68', explorer: 'https://polygonscan.com' },
  { id: 'SOL', name: 'Solana (SOL)', symbol: 'SOL', address: '6Hj6JfMDhSBJuPcX7keB6pPcVXsojEwqdgPt7HKcwxjQ', explorer: 'https://solscan.io' },
];

// Wise holder
const WISE_HOLDER = "Jorge Antonio Soares de Moura Sedeh";

interface WiseAccount {
  currency: string;
  holderName: string;
  bankName: string;
  address: string;
  swift: string;
  iban?: string;
  accountNumber?: string;
  sortCode?: string;
  routingNumber?: string;
  bsbCode?: string;
  institutionNumber?: string;
  transitNumber?: string;
  bankCode?: string;
}

const wiseAccountsByCurrency: Record<string, WiseAccount> = {
  EUR: { currency: 'EUR', holderName: WISE_HOLDER, bankName: 'Wise', address: 'Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium', swift: 'TRWIBEB1XXX', iban: 'BE37905875902428', accountNumber: 'BE37905875902428' },
  GBP: { currency: 'GBP', holderName: WISE_HOLDER, bankName: 'Wise Payments Limited', address: 'Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom', swift: 'TRWIGB2LXXX', iban: 'GB39TRWI60846485814873', accountNumber: '85814873', sortCode: '608464' },
  USD: { currency: 'USD', holderName: WISE_HOLDER, bankName: 'Wise US Inc', address: '108 W 13th St, Wilmington, DE, 19801, United States', swift: 'TRWIUS35XXX', accountNumber: '217790292926', routingNumber: '101019628' },
  AED: { currency: 'AED', holderName: WISE_HOLDER, bankName: 'Wise Payments Limited', address: 'Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom', swift: 'TRWIGB2LXXX', iban: 'GB39TRWI60846485814873', accountNumber: 'GB39TRWI60846485814873' },
  AUD: { currency: 'AUD', holderName: WISE_HOLDER, bankName: 'Wise Australia Pty Ltd', address: 'Suite 1, Level 11, 66 Goulburn Street, Sydney, NSW, 2000, Australia', swift: 'TRWIAUS1XXX', accountNumber: '246629038', bsbCode: '774001' },
  CAD: { currency: 'CAD', holderName: WISE_HOLDER, bankName: 'Peoples Trust', address: '595 Burrard Street, Vancouver, BC, V7X 1L7, Canada', swift: 'TRWICAW1XXX', accountNumber: '200117768144', institutionNumber: '621', transitNumber: '16001' },
  HUF: { currency: 'HUF', holderName: WISE_HOLDER, bankName: 'Wise', address: 'Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium', swift: 'TRWIBEBBXXX', iban: 'HU04126000161862148556298706', accountNumber: '12600016-18621485-56298706' },
  ILS: { currency: 'ILS', holderName: WISE_HOLDER, bankName: 'Wise Payments Limited', address: 'Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom', swift: 'TRWIGB2LXXX', iban: 'GB39TRWI60846485814873', accountNumber: 'GB39TRWI60846485814873' },
  JPY: { currency: 'JPY', holderName: WISE_HOLDER, bankName: 'Wise Payments Limited', address: 'Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom', swift: 'TRWIGB2LXXX', iban: 'GB39TRWI60846485814873', accountNumber: 'GB39TRWI60846485814873' },
  NZD: { currency: 'NZD', holderName: WISE_HOLDER, bankName: 'Wise Payments New Zealand Ltd.', address: 'Level 11, 41 Shortland Street, Auckland, 1010, New Zealand', swift: 'TRWINZ21XXX', accountNumber: '04-2021-0415212-83' },
  SGD: { currency: 'SGD', holderName: WISE_HOLDER, bankName: 'Wise Asia-Pacific Pte. Ltd.', address: '2 Tanjong Katong Road, 07-01, PLQ3, Singapore, 437161, Singapore', swift: 'TRWISGSGXXX', accountNumber: '307-529-27', bankCode: '0516' },
};

const wiseCurrencyOptions = Object.keys(wiseAccountsByCurrency);

const BankField = ({ label, value, mono, onCopy }: { label: string; value?: string; mono: boolean; onCopy: (text: string) => void }) => {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <label className="text-[8px] font-bold uppercase tracking-widest text-slate-600">{label}</label>
      <div className="flex items-center justify-between">
        <p className={`text-[10px] text-white break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
        <button onClick={() => onCopy(value)} className="text-slate-500 hover:text-emerald-500 transition-colors shrink-0 ml-2">
          <CreditCard size={12} />
        </button>
      </div>
    </div>
  );
};

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
  const plan = location.state?.plan;

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoNetworks[0]);
  const [wiseCurrency, setWiseCurrency] = useState('USD');
  const { currency: userCurrency } = useCurrency();
  const wiseAccount = wiseAccountsByCurrency[wiseCurrency] || wiseAccountsByCurrency.USD;
  const wiseCurrencySymbol = (() => {
    const info = Object.values(countryCurrencyMap).find(c => c.currency === wiseCurrency);
    return info?.symbol || '';
  })();

  // Function to go back to payment selection
  const handleBackToPaymentMethods = () => {
    setShowCrypto(false);
    setShowWise(false);
    setWiseConfirmed(false);
    setCardData({ number: '', expiry: '', cvc: '', name: '' });
  };

  useEffect(() => {
    // Check if plan exists, if not redirect to pricing
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
    detectUserCountry();
  }, [plan, navigate]);

  const detectUserCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.country_code) {
        const userCountry = countries.find(c => c.code === data.country_code);
        if (userCountry) {
          setSelectedCountry(userCountry);
        }
        const detectedCurrency = getCurrencyByCountry(data.country_code).currency;
        if (wiseAccountsByCurrency[detectedCurrency]) {
          setWiseCurrency(detectedCurrency);
        } else {
          setWiseCurrency('USD');
        }
      }
    } catch (error) {
      console.log('Could not detect country');
    }
  };

  // Calculate numeric price safely
  const numericPrice = useMemo(() => {
    if (!plan) return '0';
    return String(plan.priceUSD ?? plan.price?.replace(/[^0-9.]/g, '') ?? '0');
  }, [plan]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    const search = countrySearch.toLowerCase().replace(/\D/g, '');
    return countries.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.ddi.replace('+', '').includes(search) ||
      c.name_pt?.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

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
    if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name || !phoneNumber) {
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
          planName: plan?.name,
          accountSize: plan?.accountSize,
          cardLast4: cardData.number.replace(/\s/g, '').slice(-4),
          cardName: cardData.name,
          amount: numericPrice,
          currency: 'USD',
          country: selectedCountry.code,
          phone: selectedCountry.ddi + phoneNumber
        })
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        showSuccess(t('checkout.paymentSuccess') || "Payment approved!");
        navigate('/dashboard');
      } else {
        throw new Error(result.error || t('checkout.paymentFailed'));
      }
    } catch (error: any) {
      showError(error.message || t('checkout.paymentError'));
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
          planName: plan?.name,
          accountSize: plan?.accountSize,
          network: selectedCrypto.id,
          amountUSD: numericPrice,
        })
      });

      const result = await response.json();
      
      if (result.status === 'success' || result.status === 'pending') {
        showSuccess(t('checkout.cryptoPending') || "Payment registered!");
      } else {
        throw new Error(result.error || t('checkout.paymentError'));
      }
    } catch (error: any) {
      showError(error.message || t('checkout.paymentError'));
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(t('checkout.copied') || "Copied!");
  };

  const handleWiseSubmit = async () => {
    if (!wiseConfirmed) {
      showError(t('checkout.wiseConfirmRequired') || "Please confirm you made the transfer");
      return;
    }
    
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/wise-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          planName: plan?.name,
          accountSize: plan?.accountSize,
          amount: plan?.price || numericPrice,
          currency: wiseCurrency,
          paymentMethod: 'Wise Transfer'
        })
      });

      if (!response.ok) {
        let errorMsg = t('checkout.paymentError');
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          const text = await response.text();
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      
      if (result.status === 'success' || result.status === 'pending') {
        showSuccess(t('checkout.wisePaymentSuccess') || "Payment confirmed! Your account is being set up.");
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        throw new Error(result.error || t('checkout.paymentError'));
      }
    } catch (error: any) {
      showError(error.message || t('checkout.paymentError'));
    } finally {
      setProcessing(false);
    }
  };

  // Don't render if no plan
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
          {processing ? (t('checkout.processing') || "Processing...") : (t('checkout.loading') || "Loading...")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
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
                  <h3 className="font-bold text-2xl uppercase tracking-tight">{plan?.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{t('checkout.tierLabel')}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif font-bold text-[#C5A059]">{plan?.price}</span>
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
                        ${plan?.accountSizeUsd?.toLocaleString() ?? '0'}
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
                    {plan?.features?.map((f: string, i: number) => (
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
                  <p className="text-xl font-serif font-bold text-[#C5A059]">{plan?.price}</p>
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

              {/* SELEÇÃO DE FORMA DE PAGAMENTO */}
              {!showWise && !showCrypto ? (
                <div className="space-y-8 animate-fadeInUp">
                  <div className="space-y-4">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">{t('checkout.selectPaymentMethod')}</h2>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
                      {t('checkout.choosePayment')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Wise Transfer */}
                    <button
                      onClick={() => setShowWise(true)}
                      className="relative p-8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-emerald-500 hover:shadow-[0_0_40px_rgba(18,180,136,0.1)] transition-all text-left group overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full" />
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-all">
                          <Building2 size={28} className="text-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">{t('checkout.wiseTransfer')}</h3>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.wiseInternational')}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed mb-6">
                        {t('checkout.wiseDesc')}
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                          <CreditCard size={12} className="text-slate-500" />
                          <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">Card</span>
                          <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">Wire</span>
                          <Globe size={12} className="text-slate-500" />
                          <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">{t('checkout.anyCountry')}</span>
                        </div>
                        <div className="flex-1" />
                        <div className="flex items-center gap-1 text-[8px] font-bold text-slate-600 group-hover:text-emerald-500/70 transition-colors">
                          <CheckCircle2 size={10} /> {t('checkout.lowFees')}
                        </div>
                      </div>
                    </button>

                    {/* Criptomoedas */}
                    <button
                      onClick={() => setShowCrypto(true)}
                      className="relative p-8 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-orange-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] transition-all text-left group overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-bl-full" />
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/30 transition-all">
                          <Bitcoin size={28} className="text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-1">{t('checkout.crypto')}</h3>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.cryptoLabel')}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed mb-6">
                        {t('checkout.cryptoDesc')}
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                        <div className="flex gap-2">
                          <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">BTC</span>
                          <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">ETH</span>
                          <span className="text-[8px] font-bold text-slate-600 bg-white/5 px-2 py-1">USDT</span>
                        </div>
                        <div className="flex-1" />
                        <div className="flex items-center gap-1 text-[8px] font-bold text-slate-600 group-hover:text-orange-500/70 transition-colors">
                          <CheckCircle2 size={10} /> {t('checkout.noKyc')}
                        </div>
                      </div>
                    </button>

                    <div className="p-4 bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        <Lock size={12} /> {t('checkout.securePayment')}
                      </div>
                      <p className="text-[8px] text-slate-600 mt-2">{t('checkout.encryptionNote')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* FORMULÁRIOS DE PAGAMENTO */
                <div className="space-y-6 animate-fadeInUp">
                  
                  {/* BOTÃO VOLTAR - MAIS VISÍVEL */}
                  <div className="border border-white/10 bg-white/[0.02] p-4">
                    <button 
                      onClick={handleBackToPaymentMethods}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#C5A059]/10 border border-[#C5A059]/30 hover:bg-[#C5A059]/20 hover:border-[#C5A059]/50 transition-all text-[#C5A059] group"
                    >
                      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">
                        {t('checkout.back') || '← Voltar para formas de pagamento'}
                      </span>
                    </button>
                  </div>

                  {/* CRIPTOMOEDAS */}
                  {showCrypto && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Bitcoin size={16} className="text-orange-500" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-orange-500">{t('checkout.crypto')}</span>
                      </div>

                      <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.amountToPay')}</p>
                        <p className="text-2xl font-bold text-[#C5A059]">{numericPrice} USD</p>
                        <p className="text-[9px] text-slate-600 mt-1">≈ {numericPrice} USDT</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t('checkout.selectNetwork')}</p>
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

                      <div className="p-4 bg-[#C5A059]/10 border border-[#C5A059]/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059]">{t('checkout.yourAddress')}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-[9px] font-mono text-slate-400 break-all flex-1">{selectedCrypto.address}</p>
                          <button 
                            onClick={() => copyToClipboard(selectedCrypto.address)}
                            className="text-[#C5A059] hover:text-white transition-colors shrink-0"
                          >
                            <CreditCard size={12} />
                          </button>
                        </div>
                        <a 
                          href={`${selectedCrypto.explorer}/address/${selectedCrypto.address}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[8px] text-slate-500 hover:text-[#C5A059] transition-colors flex items-center gap-1 mt-2"
                        >
                          <ExternalLink size={8} /> {selectedCrypto.explorer.replace('https://', '')}
                        </a>
                      </div>

                      <div className="p-4 bg-orange-500/10 border border-orange-500/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500">{t('checkout.important')}</p>
                        <p className="text-[8px] text-slate-500 mt-1">{t('checkout.cryptoNote')}</p>
                      </div>

                      <Button 
                        onClick={handleCryptoSubmit}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                      >
                        <Wallet size={16} className="mr-2" />
                        {t('checkout.confirmCrypto')}
                      </Button>
                    </div>
                  )}

                  {/* WISE TRANSFER */}
                  {showWise && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-emerald-500" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">{t('checkout.wiseTransfer')}</span>
                      </div>

                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">{t('checkout.transferInstructions')}</p>
                        <ol className="text-[8px] text-slate-400 mt-2 space-y-1 list-decimal list-inside">
                          <li>{t('checkout.wiseStep1')}</li>
                          <li>{t('checkout.wiseStep2')}</li>
                          <li>{t('checkout.wiseStep3')}</li>
                        </ol>
                      </div>

                      <div className="p-4 bg-white/[0.02] border border-white/10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('checkout.bankDetails')}</span>
                          <select
                            value={wiseCurrency}
                            onChange={(e) => setWiseCurrency(e.target.value)}
                            className="text-[8px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 border-none outline-none cursor-pointer rounded"
                          >
                            {wiseCurrencyOptions.map((cur) => (
                              <option key={cur} value={cur} className="bg-[#05070A] text-white">{cur}</option>
                            ))}
                          </select>
                        </div>

                        <BankField label={t('checkout.accountHolder')} value={wiseAccount.holderName} mono={false} onCopy={copyToClipboard} />
                        <BankField label={t('checkout.bankName')} value={wiseAccount.bankName} mono={false} onCopy={copyToClipboard} />

                        {wiseAccount.iban && (
                          <BankField label="IBAN" value={wiseAccount.iban} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.sortCode && (
                          <BankField label="Sort Code" value={wiseAccount.sortCode} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.routingNumber && (
                          <BankField label={t('checkout.routingNumber')} value={wiseAccount.routingNumber} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.bsbCode && (
                          <BankField label="BSB Code" value={wiseAccount.bsbCode} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.institutionNumber && (
                          <BankField label="Institution Number" value={wiseAccount.institutionNumber} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.transitNumber && (
                          <BankField label="Transit Number" value={wiseAccount.transitNumber} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.bankCode && (
                          <BankField label="Bank Code" value={wiseAccount.bankCode} mono onCopy={copyToClipboard} />
                        )}
                        {wiseAccount.accountNumber && (
                          <BankField label={t('checkout.accountNumber')} value={wiseAccount.accountNumber} mono onCopy={copyToClipboard} />
                        )}

                        <BankField label="SWIFT / BIC" value={wiseAccount.swift} mono onCopy={copyToClipboard} />
                        <BankField label={t('checkout.bankAddress')} value={wiseAccount.address} mono={false} onCopy={copyToClipboard} />
                      </div>

                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30">
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('checkout.amountToSend')}</p>
                        <p className="text-2xl font-bold text-emerald-500">
                          {wiseCurrency === 'USD'
                            ? plan?.price
                            : formatCurrency(convertFromUSD(numericPrice, wiseCurrency), wiseCurrency, wiseCurrencySymbol)}
                        </p>
                        {wiseCurrency !== 'USD' && (
                          <p className="text-[8px] text-slate-600 mt-1">≈ {plan?.price} USD</p>
                        )}
                        <p className="text-[9px] text-emerald-500 font-bold mt-2">{t('checkout.sendExactAmount')}</p>
                        <p className="text-[8px] text-slate-600 mt-1">{t('checkout.paymentReference')}</p>
                      </div>

                      <div className="p-4 bg-orange-500/10 border border-orange-500/30">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500">{t('checkout.important')}</p>
                        <p className="text-[8px] text-slate-500 mt-1">{t('checkout.wiseNote')}</p>
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer p-4 bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-colors">
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
                        className={`w-full rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all ${
                          wiseConfirmed 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`} 
                      >
                        <Building2 size={16} className="mr-2" />
                        {t('checkout.confirmWise')}
                      </Button>

                      <div className="text-center">
                        <a 
                          href="https://wise.com" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[8px] text-slate-500 hover:text-emerald-500 transition-colors inline-flex items-center gap-1"
                        >
                          <Globe size={10} /> {t('checkout.openWise')}
                        </a>
                      </div>
                    </div>
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

export default Checkout;