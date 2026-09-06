"use client";

import React from 'react';
import { Check, Zap, Award, ShieldCheck, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/hooks/useCurrency';

const PRICES_USD = {
  starter: { monthly: 200, account: 25000 },
  professional: { monthly: 350, account: 50000 },
  business: { monthly: 600, account: 100000 },
  enterprise: { monthly: 820, account: 150000 },
};

const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { convertPrice, currency, isLoading } = useCurrency();

  const plans = [
    {
      id: "starter",
      name: t('plans.starter'),
      price: convertPrice(PRICES_USD.starter.monthly),
      priceUSD: PRICES_USD.starter.monthly,
      accountSize: convertPrice(PRICES_USD.starter.account),
      accountSizeUsd: PRICES_USD.starter.account,
      iconType: "zap",
      features: [
        t('plans.features.automation'),
        t('plans.features.accountManagement'),
        t('plans.features.emailSupport'),
        t('plans.features.controlledRisk'),
      ],
    },
    {
      id: "professional",
      name: t('plans.professional'),
      price: convertPrice(PRICES_USD.professional.monthly),
      priceUSD: PRICES_USD.professional.monthly,
      accountSize: convertPrice(PRICES_USD.professional.account),
      accountSizeUsd: PRICES_USD.professional.account,
      iconType: "award",
      features: [
        t('plans.features.starterFeatures'),
        t('plans.features.prioritySupport'),
        t('plans.features.detailedLogs'),
      ],
      popular: true
    },
    {
      id: "business",
      name: t('plans.business'),
      price: convertPrice(PRICES_USD.business.monthly),
      priceUSD: PRICES_USD.business.monthly,
      accountSize: convertPrice(PRICES_USD.business.account),
      accountSizeUsd: PRICES_USD.business.account,
      iconType: "shield",
      features: [
        t('plans.features.proFeatures'),
        t('plans.features.multiAccount'),
        t('plans.features.weeklyReports'),
      ],
    },
    {
      id: "enterprise",
      name: t('plans.enterprise'),
      price: convertPrice(PRICES_USD.enterprise.monthly),
      priceUSD: PRICES_USD.enterprise.monthly,
      accountSize: convertPrice(PRICES_USD.enterprise.account),
      accountSizeUsd: PRICES_USD.enterprise.account,
      iconType: "crown",
      features: [
        t('plans.features.advancedFeatures'),
        t('plans.features.support247'),
        t('plans.features.dedicatedManager'),
      ],
    }
  ];

  const renderIcon = (type: string) => {
    switch (type) {
      case 'zap': return <Zap size={28} />;
      case 'award': return <Award size={28} />;
      case 'shield': return <ShieldCheck size={28} />;
      case 'crown': return <Crown size={28} />;
      default: return <Zap size={28} />;
    }
  };

  const handleSelectPlan = (plan: any) => {
    navigate('/checkout', { state: { plan } });
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />

      <section className="relative pt-[200px] pb-20 border-b border-white/5 bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className=\"text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block\">{t('pricing.badge')}</span>
            <h1 className=\"font-serif text-[28px] md:text-[48px] font-bold leading-[1.1] mb-6 tracking-[-0.03em] uppercase\">\n              {t('pricing.title')} <br />\n              <span className=\"text-white\">{t('pricing.subtitle')}</span>\n            </h1>\n            <p className=\"font-sans text-[14px] md:text-[17px] text-slate-400 max-w-xl leading-relaxed\">\n              {t('pricing.desc')}\n            </p>\n          </div>\n        </div>\n      </section>\n\n      <section className=\"py-24\">\n        <div className=\"container mx-auto px-8\">\n          {!isLoading && (\n            <div className=\"text-center mb-8 text-xs text-slate-500\">\n              {t('pricing.detectedCurrency', 'Prices shown in your local currency ({{currency}}) based on your location', { currency: currency })}\n            </div>\n          )}\n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5\">\n            {plans.map((plan, i) => (\n              <div key={i} className=\"p-12 bg-[#080B12] flex flex-col h-full relative hover:bg-white/[0.02] transition-all group\">\n                {plan.popular && (\n                  <div className=\"absolute top-0 left-0 right-0 h-[3px] bg-[#D4AF37]\" />\n                )}\n                <div className=\"text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform\">\n                  {renderIcon(plan.iconType)}\n                </div>\n                <h3 className=\"text-[11px] font-bold uppercase tracking-[3px] text-slate-500 mb-8\">{plan.name}</h3>\n                <div className=\"mb-10\">\n                  <span className=\"text-[32px] font-serif font-bold text-white\">{plan.price}</span>\n                  <span className=\"text-slate-600 text-[10px] uppercase tracking-widest ml-2\">/ {t('pricing.month')}</span>\n                </div>\n                <div className=\"p-6 bg-white/[0.03] border border-white/5 mb-10\">\n                  <p className=\"text-[9px] text-slate-500 uppercase tracking-widest mb-2\">{t('plans.managedCapital')}</p>\n                  <p className=\"text-[22px] font-serif font-bold text-[#D4AF37]\">{plan.accountSize}</p>\n                </div>\n                <ul className=\"space-y-5 mb-12 flex-grow\">\n                  {plan.features.map((f, j) => (\n                    <li key={j} className=\"flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400\">\n                      <Check className=\"text-[#D4AF37]\" size={14} />\n                      {f}\n                    </li>\n                  ))}\n                </ul>\n                <Button\n                  onClick={() => handleSelectPlan(plan)}\n                  className={cn(\n                    \"w-full rounded-none h-14 text-[11px] font-black uppercase tracking-[2px] transition-all\",\n                    plan.popular ? \"bg-[#D4AF37] text-black hover:bg-[#C9A227]\" : \"bg-white/5 text-white hover:bg-white/10 border border-white/10\"\n                  )}\n                >\n                  {t('pricing.select')}\n                </Button>\n              </div>\n            ))}\n          </div>\n        </div>\n      </section>\n\n      <Footer />\n    </div>\n  );
};

export default Pricing;