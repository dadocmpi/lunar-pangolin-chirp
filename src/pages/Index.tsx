"use client";

import React from 'react';
import { 
  Shield, Zap, BarChart3, ArrowRight, CheckCircle2, 
  TrendingUp, ShieldAlert, PieChart, Lock, Eye,
  Server, Cpu, ArrowUpRight, CreditCard, LayoutDashboard, Wallet
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const Index = () => {
  const { t } = useTranslation();
  
  const stats = [
    { value: "$2.4B+", label: t('stats.volume') },
    { value: "12,400+", label: t('stats.traders') },
    { value: "99.99%", label: t('stats.uptime') },
    { value: "<1.8ms", label: t('stats.latency') },
  ];

  return (
    <div className="min-h-screen bg-[#0A0C10] font-sans text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />
      <MarketTicker />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="institutional-grid absolute inset-0 z-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.03)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-4xl animate-subtle">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C5A059]">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.95] mb-8 tracking-tighter uppercase">
              {t('hero.title1')} <br />
              <span className="text-[#C5A059] italic font-normal">{t('hero.title2')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl">
              {t('hero.desc')}
            </p>
            
            <div className="flex flex-wrap gap-6">
              <Link to="/pricing">
                <button className="bg-white text-black px-10 py-5 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#C5A059] transition-all duration-500">
                  {t('hero.getStarted')}
                </button>
              </Link>
              <Link to="/about">
                <button className="bg-transparent text-white border border-white/10 px-10 py-5 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-white/5 transition-all duration-500">
                  {t('hero.viewStrategies')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-white/5 bg-[#0D1016]">
        <div className="container mx-auto px-8 py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                  {stat.value}
                </div>
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-32 px-8">
        <div className="container mx-auto">
          <div className="mb-20">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('methodology.badge')}</span>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">{t('methodology.title')}</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {[
              {
                title: t('methodology.momentum.title'),
                icon: <TrendingUp size={24} />,
                features: [t('methodology.momentum.f1'), t('methodology.momentum.f2'), t('methodology.momentum.f3')],
                desc: t('methodology.momentum.desc')
              },
              {
                title: t('methodology.volatility.title'),
                icon: <ShieldAlert size={24} />,
                features: [t('methodology.volatility.f1'), t('methodology.volatility.f2'), t('methodology.volatility.f3')],
                desc: t('methodology.volatility.desc')
              },
              {
                title: t('methodology.risk.title'),
                icon: <PieChart size={24} />,
                features: [t('methodology.risk.f1'), t('methodology.risk.f2'), t('methodology.risk.f3')],
                desc: t('methodology.risk.desc')
              }
            ].map((item, i) => (
              <div key={i} className="p-16 bg-[#0D1016] flex flex-col hover:bg-[#11141A] transition-all group">
                <div className="text-[#C5A059] mb-10 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] mb-6 text-white">{item.title}</h3>
                <p className="text-slate-500 text-[14px] leading-relaxed mb-10">{item.desc}</p>
                <ul className="space-y-4 mt-auto">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="w-1 h-1 bg-[#C5A059]" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="py-32 px-8 bg-[#0D1016] border-t border-white/5">
        <div className="container mx-auto">
          <div className="mb-24 text-center">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('process_home.badge')}</span>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">
              {t('process_home.title')} <span className="text-[#C5A059] italic font-normal">{t('process_home.subtitle')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 relative">
            {[
              { icon: <CreditCard size={24} />, title: t('process_home.step1.title'), desc: t('process_home.step1.desc') },
              { icon: <Zap size={24} />, title: t('process_home.step2.title'), desc: t('process_home.step2.desc') },
              { icon: <Cpu size={24} />, title: t('process_home.step3.title'), desc: t('process_home.step3.desc') },
              { icon: <LayoutDashboard size={24} />, title: t('process_home.step4.title'), desc: t('process_home.step4.desc') },
              { icon: <Wallet size={24} />, title: t('process_home.step5.title'), desc: t('process_home.step5.desc') }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-[#11141A] border border-white/5 flex items-center justify-center text-[#C5A059] mb-8 group-hover:border-[#C5A059] transition-all duration-700 relative">
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-slate-600">0{i+1}</span>
                  {step.icon}
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-white">{step.title}</h3>
                <p className="text-slate-500 text-[12px] leading-relaxed px-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-40 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(197,160,89,0.05)_0%,transparent_60%)] pointer-events-none" />
        <div className="container mx-auto text-center relative z-10">
          <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.6em] mb-8 block">{t('cta_home.badge')}</span>
          <h2 className="text-5xl md:text-7xl font-bold leading-[1] mb-10 tracking-tighter uppercase">
            {t('cta_home.title')} <br />
            <span className="text-[#C5A059] italic font-normal">{t('cta_home.subtitle')}</span>
          </h2>
          <p className="text-slate-400 mb-16 max-w-2xl mx-auto text-lg">
            {t('cta_home.desc')}
          </p>
          <div className="flex flex-col items-center gap-8">
            <Link to="/pricing">
              <button className="bg-white text-black px-16 py-6 text-[12px] font-bold tracking-[0.2em] uppercase hover:bg-[#C5A059] transition-all duration-500 flex items-center gap-4">
                {t('cta_home.btn')} <ArrowUpRight size={18} />
              </button>
            </Link>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">
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