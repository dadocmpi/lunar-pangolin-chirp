"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, BarChart3, ArrowRight, CheckCircle2, 
  Layout, Globe, Database, Activity, Layers, Users,
  TrendingUp, ShieldAlert, PieChart, Lock, Eye, Info,
  Server, Scale, Cpu, ChevronRight, Network, ArrowUpRight,
  CreditCard, LayoutDashboard, Wallet
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';
import Differentiators from '@/components/Differentiators';
import FAQ from '@/components/FAQ';
import SupportChatbot from '@/components/SupportChatbot';
import { LogoMetatrader, LogoBinance, LogoVisa, LogoAES, LogoPaypal } from '@/components/LogoVault';

const Index = () => {
  const { t } = useTranslation();
  
  const stats = [
    { value: "500+", label: t('stats.traders') },
    { value: "99.97%", label: t('stats.uptime') },
    { value: "<1.8ms", label: t('stats.latency') },
  ];

  return (
    <div className="min-h-screen bg-black font-sans text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />
      <SupportChatbot />

      {/* Hero Section */}
      <section className="relative mt-[180px] min-h-[80vh] flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="relative z-[2] text-center max-w-[1000px] px-8 animate-fadeInUp">
          <h1 className="font-serif text-[32px] md:text-[54px] font-bold leading-[1.1] mb-8 tracking-[-0.03em] text-white uppercase">
            {t('hero.title1')}
            <span className="block text-[#D4AF37] mt-2">{t('hero.title2')}</span>
          </h1>
          
          <p className="font-sans text-[14px] md:text-[17px] text-slate-400 mb-12 leading-[1.7] max-w-[680px] mx-auto font-medium">
            {t('hero.desc')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/pricing">
              <button className="bg-[#D4AF37] text-black px-12 py-5 rounded-none font-tech text-[11px] font-black tracking-[0.25em] uppercase hover:bg-white hover:-translate-y-[2px] hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)] transition-all duration-500">
                {t('hero.getStarted')}
              </button>
            </Link>
            <Link to="/about">
              <button className="bg-transparent text-white border border-white/10 px-12 py-5 rounded-none font-tech text-[11px] font-black tracking-[0.25em] uppercase hover:bg-white/5 hover:-translate-y-[2px] transition-all duration-500">
                {t('hero.viewStrategies')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Logos Section */}
      <section className="py-12 border-b border-white/5 bg-black/50">
        <div className="container mx-auto px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-40 hover:opacity-70 transition-opacity duration-500">
            <LogoMetatrader />
            <LogoBinance />
            <LogoPaypal />
            <LogoVisa />
            <LogoAES />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black py-24 px-8 border-b border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-16">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="font-serif text-[32px] md:text-[42px] font-bold text-white mb-3 tracking-[-0.02em] group-hover:text-[#D4AF37] transition-colors duration-500">
                {stat.value}
              </div>
              <div className="font-tech text-[9px] font-bold tracking-[0.3em] uppercase text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Differentiators Section */}
      <Differentiators />

      {/* Methodology Section */}
      <section className="py-32 px-8 bg-[#05070A]">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-24 text-center">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('methodology.badge')}</span>
            <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight leading-tight">{t('methodology.title')}</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {[
              {
                title: t('methodology.statArb.title'),
                icon: <Scale size={28} />,
                features: [t('methodology.statArb.f1'), t('methodology.statArb.f2'), t('methodology.statArb.f3')],
                desc: t('methodology.statArb.desc')
              },
              {
                title: t('methodology.meanRev.title'),
                icon: <TrendingUp size={28} />,
                features: [t('methodology.meanRev.f1'), t('methodology.meanRev.f2'), t('methodology.meanRev.f3')],
                desc: t('methodology.meanRev.desc')
              },
              {
                title: t('methodology.hft.title'),
                icon: <Zap size={28} />,
                features: [t('methodology.hft.f1'), t('methodology.hft.f2'), t('methodology.hft.f3')],
                desc: t('methodology.hft.desc')
              }
            ].map((item, i) => (
              <div key={i} className="p-16 bg-[#080B12] flex flex-col hover:bg-white/[0.01] transition-all duration-500 group">
                <div className="text-[#D4AF37] mb-10 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] mb-6 text-white leading-relaxed">{item.title}</h3>
                <p className="text-slate-500 text-[14px] leading-relaxed mb-10 font-medium">{item.desc}</p>
                <ul className="space-y-4 mt-auto">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      <div className="w-1 h-1 bg-[#D4AF37] rounded-full" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency / Infrastructure Section */}
      <section className="py-32 px-8 bg-black border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-24 text-center">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('transparency.badge')}</span>
            <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight leading-tight">{t('transparency.title')}</h2>
            <p className="text-slate-400 text-[14px] mt-6 max-w-[680px] mx-auto leading-relaxed">{t('transparency.desc')}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {[
              {
                title: t('transparency.connectivity.title'),
                icon: <Network size={28} />,
                desc: t('transparency.connectivity.desc')
              },
              {
                title: t('transparency.cloud.title'),
                icon: <Server size={28} />,
                desc: t('transparency.cloud.desc')
              },
              {
                title: t('transparency.security.title'),
                icon: <Shield size={28} />,
                desc: t('transparency.security.desc')
              }
            ].map((item, i) => (
              <div key={i} className="p-16 bg-[#080B12] flex flex-col hover:bg-white/[0.01] transition-all duration-500 group">
                <div className="text-[#D4AF37] mb-10 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] mb-6 text-white leading-relaxed">{item.title}</h3>
                <p className="text-slate-500 text-[14px] leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Process Flow Section */}
      <section className="py-32 px-8 bg-[#05070A] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-24 text-center">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('process_home.badge')}</span>
            <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight">
              {t('process_home.title')} <span className="text-white">{t('process_home.subtitle')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative">
            <div className="hidden md:block absolute top-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent -z-10" />
            
            {[
              { icon: <CreditCard size={24} />, title: t('process_home.step1.title'), desc: t('process_home.step1.desc') },
              { icon: <Zap size={24} />, title: t('process_home.step2.title'), desc: t('process_home.step2.desc') },
              { icon: <Cpu size={24} />, title: t('process_home.step3.title'), desc: t('process_home.step3.desc') },
              { icon: <LayoutDashboard size={24} />, title: t('process_home.step4.title'), desc: t('process_home.step4.desc') },
              { icon: <Wallet size={24} />, title: t('process_home.step5.title'), desc: t('process_home.step5.desc') }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-28 h-28 bg-[#080B12] border border-white/5 flex items-center justify-center text-[#D4AF37] mb-10 group-hover:border-[#D4AF37]/40 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.05)] transition-all duration-700 relative">
                  <span className="absolute -top-4 -right-4 w-10 h-10 bg-black border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-600">0{i+1}</span>
                  {step.icon}
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-white">{step.title}</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed px-2 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA Section */}
      <section className="py-40 px-8 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.05)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.6em] mb-8 block animate-pulse-badge">{t('cta_home.badge')}</span>
          <h2 className="font-serif text-[32px] md:text-[48px] font-bold leading-[1.1] mb-10 tracking-[-0.03em] uppercase">
            {t('cta_home.title')} <br />
            <span className="text-[#D4AF37]">{t('cta_home.subtitle')}</span>
          </h2>
          <p className="font-sans text-[14px] md:text-[17px] text-slate-400 mb-16 leading-[1.7] max-w-[750px] mx-auto font-medium">
            {t('cta_home.desc')}
          </p>
          <div className="flex flex-col items-center gap-8">
            <Link to="/pricing">
              <button className="bg-[#D4AF37] text-black px-16 py-6 rounded-none font-tech text-[12px] font-black tracking-[0.3em] uppercase hover:bg-white hover:-translate-y-[2px] hover:shadow-[0_25px_50px_rgba(212,175,55,0.2)] transition-all duration-500 flex items-center gap-4">
                {t('cta_home.btn')} <ArrowUpRight size={20} />
              </button>
            </Link>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              <Lock size={12} /> {t('cta_home.trust')}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;