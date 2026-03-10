"use client";

import React, { useState } from 'react';
import { Check, Loader2, ShieldCheck, Zap, Award, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const Pricing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter 2K",
      price: "€70.00",
      accountSize: "$2,000",
      icon: <Zap size={20} />,
      features: ["Automation", "Account Management", "Email Support", "Controlled Risk"],
    },
    {
      name: "Pro 5K",
      price: "€160.00",
      accountSize: "$5,000",
      icon: <Award size={20} />,
      features: ["Starter Features", "Priority Support", "Detailed Logs"],
      popular: true
    },
    {
      name: "Advanced 10K",
      price: "€320.00",
      accountSize: "$10,000",
      icon: <ShieldCheck size={20} />,
      features: ["Pro Features", "Multi-Account", "Weekly Reports"],
    },
    {
      name: "Elite 20K",
      price: "€630.00",
      accountSize: "$20,000",
      icon: <Crown size={20} />,
      features: ["Advanced Features", "24/7 Support", "Dedicated Manager"],
    }
  ];

  const handleSelectPlan = (plan: any) => {
    // Redireciona para o checkout passando os dados do plano
    navigate('/checkout', { state: { plan } });
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />
      
      <section className="relative pt-[160px] pb-20 border-b border-white/5 bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('pricing.badge')}</span>
            <h1 className="font-serif text-[42px] md:text-[72px] font-bold leading-[1] mb-6 tracking-[-2px] uppercase">
              {t('pricing.title')} <br />
              <span className="text-[#D4AF37]">{t('pricing.subtitle')}</span>
            </h1>
            <p className="font-sans text-[15px] md:text-[18px] text-slate-400 max-w-xl leading-relaxed">
              {t('pricing.desc')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
            {plans.map((plan, i) => (
              <div key={i} className="p-12 bg-[#080B12] flex flex-col h-full relative hover:bg-white/[0.02] transition-all group">
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#D4AF37]" />
                )}
                <div className="text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform">{plan.icon}</div>
                <h3 className="text-[11px] font-bold uppercase tracking-[3px] text-slate-500 mb-8">{plan.name}</h3>
                <div className="mb-10">
                  <span className="text-[36px] font-serif font-bold text-white">{plan.price}</span>
                  <span className="text-slate-600 text-[10px] uppercase tracking-widest ml-2">/ {t('pricing.month')}</span>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/5 mb-10">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">{t('pricing.allocation')}</p>
                  <p className="text-[24px] font-serif font-bold text-[#D4AF37]">{plan.accountSize} USD</p>
                </div>
                <ul className="space-y-5 mb-12 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <Check className="text-[#D4AF37]" size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleSelectPlan(plan)}
                  className={cn(
                    "w-full rounded-none h-14 text-[11px] font-black uppercase tracking-[2px] transition-all",
                    plan.popular ? "bg-[#D4AF37] text-black hover:bg-[#C9A227]" : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  )}
                >
                  {t('pricing.select')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;