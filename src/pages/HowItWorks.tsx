"use client";

import React from 'react';
import { UserPlus, CreditCard, Key, ArrowDownCircle, Mail, Layout, CheckCircle2, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const HowItWorks = () => {
  const { t } = useTranslation();
  const icons = [<UserPlus size={24} />, <Layout size={24} />, <CreditCard size={24} />, <Key size={24} />, <ArrowDownCircle size={24} />, <Mail size={24} />];
  
  const steps = (t('howItWorks.steps', { returnObjects: true }) as any[]).map((step, i) => ({
    ...step,
    icon: icons[i]
  }));

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />
      
      <section className="relative pt-[160px] pb-20 border-b border-white/5 bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('howItWorks.badge')}</span>
            <h1 className="font-serif text-[42px] md:text-[72px] font-bold leading-[1] mb-6 tracking-[-2px] uppercase">
              {t('howItWorks.title')} <br />
              <span className="text-[#D4AF37]">{t('howItWorks.subtitle')}</span>
            </h1>
            <p className="font-sans text-[15px] md:text-[18px] text-slate-400 max-w-xl leading-relaxed">
              {t('howItWorks.desc')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-24">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {steps.map((step, i) => (
            <div key={i} className="p-12 bg-[#080B12] flex flex-col items-start hover:bg-white/[0.02] transition-all relative group">
              <span className="absolute top-8 right-8 text-[48px] font-serif font-black text-white/[0.03] group-hover:text-[#D4AF37]/10 transition-colors">0{i+1}</span>
              <div className="text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform">{step.icon}</div>
              <h3 className="text-[11px] font-bold uppercase tracking-[3px] mb-4 text-white">{step.title}</h3>
              <p className="text-slate-500 text-[12px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-24 p-16 border border-white/5 bg-[#080B12] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
          <h2 className="text-[28px] md:text-[40px] font-serif font-bold uppercase tracking-tighter mb-10 relative z-10">{t('howItWorks.cta')}</h2>
          <Link to="/register" className="relative z-10">
            <Button className="bg-[#D4AF37] hover:bg-[#C9A227] text-black rounded-none px-16 h-16 text-[12px] font-black uppercase tracking-[2px] transition-all border-none">
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