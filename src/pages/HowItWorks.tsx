"use client";

import React from 'react';
import { UserPlus, CreditCard, Key, ArrowDownCircle, Mail, Layout, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const HowItWorks = () => {
  const { t } = useTranslation();
  const icons = [<UserPlus size={20} />, <Layout size={20} />, <CreditCard size={20} />, <Key size={20} />, <ArrowDownCircle size={20} />, <Mail size={20} />];
  
  const steps = (t('howItWorks.steps', { returnObjects: true }) as any[]).map((step, i) => ({
    ...step,
    icon: icons[i]
  }));

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />
      
      <section className="relative pt-[140px] pb-16 border-b border-[#333333] bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">{t('howItWorks.badge')}</span>
            <h1 className="font-serif text-[36px] md:text-[64px] font-bold leading-[1.1] mb-6 tracking-[-1px] uppercase">
              {t('howItWorks.title')} <br />
              <span className="text-[#C5A059]">{t('howItWorks.subtitle')}</span>
            </h1>
            <p className="font-sans text-[14px] md:text-[16px] text-[#E0E0E0] max-w-xl leading-relaxed">
              {t('howItWorks.desc')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-16">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {steps.map((step, i) => (
            <div key={i} className="p-10 bg-[#080B12] flex flex-col items-start hover:bg-white/5 transition-colors relative group">
              <span className="absolute top-6 right-6 text-[32px] font-serif font-black text-white/5 group-hover:text-[#C5A059]/10 transition-colors">0{i+1}</span>
              <div className="text-[#C5A059] mb-6">{step.icon}</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3">{step.title}</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 p-12 border border-white/10 bg-[#080B12] text-center">
          <h2 className="text-[24px] font-serif font-bold uppercase tracking-tighter mb-8">{t('howItWorks.cta')}</h2>
          <Link to="/register">
            <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-black rounded-none px-12 h-14 text-[11px] font-bold uppercase tracking-widest transition-all border-none">
              {t('howItWorks.ctaBtn')}
            </Button>
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;