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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <MarketTicker />
      
      <section className="relative pt-40 pb-20 border-b border-[#333333]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">{t('about.badge')}</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">{t('about.title')} <br /><span className="text-[#C5A059]">{t('about.subtitle')}</span></h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              {t('about.desc')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-10 md:p-14 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-6 uppercase">{t('about.historyTitle')}</h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              {t('about.historyDesc1')}
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
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
              <div key={i} className="p-8 bg-[#080B12] flex flex-col items-center justify-center text-center">
                <p className="text-xl font-black text-[#C5A059] mb-1">{stat.value}</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
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
              <p className="text-slate-500 text-[9px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;