"use client";

import React from 'react';
import { Shield, Target, Eye, Users, Award, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />
      
      <section className="relative pt-[140px] pb-16 border-b border-[#333333] bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">{t('about.badge')}</span>
            <h1 className="font-serif text-[36px] md:text-[64px] font-bold leading-[1.1] mb-6 tracking-[-1px] uppercase">
              {t('about.title')} <br />
              <span className="text-[#C5A059]">{t('about.subtitle')}</span>
            </h1>
            <p className="font-sans text-[14px] md:text-[16px] text-[#E0E0E0] max-w-xl leading-relaxed">
              {t('about.desc')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-16 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-10 md:p-12 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-[24px] md:text-[32px] font-serif font-bold tracking-tighter mb-6 uppercase">{t('about.historyTitle')}</h2>
            <p className="text-slate-400 text-[13px] leading-relaxed mb-6">
              {t('about.historyDesc1')}
            </p>
            <p className="text-slate-400 text-[13px] leading-relaxed">
              {t('about.historyDesc2')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10">
            {[
              { label: t('about.stats.founded'), value: "2026" },
              { label: t('about.stats.users'), value: "10k+" },
              { label: t('about.stats.uptime'), value: "99.9%" },
              { label: t('about.stats.support'), value: "24/7" }
            ].map((stat, i) => (
              <div key={i} className="p-8 bg-[#080B12] flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                <p className="text-[24px] font-serif font-bold text-[#C5A059] mb-1">{stat.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {[
            { icon: <Target size={20} />, title: t('about.values.mission'), desc: t('about.values.missionDesc') },
            { icon: <Eye size={20} />, title: t('about.values.vision'), desc: t('about.values.visionDesc') },
            { icon: <Shield size={20} />, title: t('about.values.values'), desc: t('about.values.valuesDesc') }
          ].map((item, i) => (
            <div key={i} className="p-10 bg-[#080B12] flex flex-col items-center text-center hover:bg-white/5 transition-colors">
              <div className="text-[#C5A059] mb-6">{item.icon}</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3">{item.title}</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;