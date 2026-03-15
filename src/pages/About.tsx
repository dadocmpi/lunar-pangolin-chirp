"use client";

import React from 'react';
import { Shield, Target, Eye, Users, Award, Globe, Landmark, Zap } from 'lucide-react';
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
      
      <section className="relative pt-[200px] pb-20 border-b border-white/5 bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('about.badge')}</span>
            <h1 className="font-serif text-[28px] md:text-[48px] font-bold leading-[1.1] mb-6 tracking-[-0.03em] uppercase">
              {t('about.title')} <br />
              <span className="text-[#D4AF37]">{t('about.subtitle')}</span>
            </h1>
            <p className="font-sans text-[14px] md:text-[17px] text-slate-400 max-w-xl leading-relaxed">
              {t('about.desc')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-24 space-y-24">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 border border-white/5 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-[20px] md:text-[28px] font-serif font-bold tracking-tighter mb-8 uppercase">{t('about.historyTitle')}</h2>
            <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
              {t('about.historyDesc1')}
            </p>
            <p className="text-slate-400 text-[14px] leading-relaxed">
              {t('about.historyDesc2')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/5">
            {[
              { label: t('about.stats.founded'), value: "2026", icon: <Landmark size={16} /> },
              { label: t('about.stats.users'), value: "10k+", icon: <Users size={16} /> },
              { label: t('about.stats.uptime'), value: "99.9%", icon: <Zap size={16} /> },
              { label: t('about.stats.support'), value: "24/7", icon: <Globe size={16} /> }
            ].map((stat, i) => (
              <div key={i} className="p-10 bg-[#080B12] flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-all group">
                <div className="text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <p className="text-[24px] font-serif font-bold text-white mb-1">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {[
            { icon: <Target size={24} />, title: t('about.values.mission'), desc: t('about.values.missionDesc') },
            { icon: <Eye size={24} />, title: t('about.values.vision'), desc: t('about.values.visionDesc') },
            { icon: <Shield size={24} />, title: t('about.values.values'), desc: t('about.values.valuesDesc') }
          ].map((item, i) => (
            <div key={i} className="p-12 bg-[#080B12] flex flex-col items-center text-center hover:bg-white/[0.02] transition-all group">
              <div className="text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-[11px] font-bold uppercase tracking-[3px] mb-4 text-white">{item.title}</h3>
              <p className="text-slate-500 text-[12px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;