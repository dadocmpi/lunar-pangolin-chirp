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

const Index = () => {
  const { t } = useTranslation();
  
  const stats = [
    { value: "$2.4B+", label: t('stats.volume') },
    { value: "12,400+", label: t('stats.traders') },
    { value: "99.97%", label: t('stats.uptime') },
    { value: "<1.8ms", label: t('stats.latency') },
  ];

  return (
    <div className="min-h-screen bg-black font-sans text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />

      {/* Hero Section */}
      <section className="relative mt-[110px] min-h-[600px] flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="relative z-[2] text-center max-w-[900px] px-8 animate-fadeInUp">
          <div className="inline-block bg-black/50 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-[8px] rounded-[25px] font-tech text-[10px] font-bold tracking-[2px] uppercase mb-8 animate-pulse-badge">
            ● {t('hero.badge')}
          </div>
          
          <h1 className="font-serif text-[42px] md:text-[72px] font-bold leading-[1] mb-6 tracking-[-2px] text-white uppercase">
            {t('hero.title1')}
            <span className="block text-[#D4AF37]">{t('hero.title2')}</span>
          </h1>
          
          <p className="font-sans text-[15px] md:text-[18px] text-slate-400 mb-10 leading-[1.6] max-w-[650px] mx-auto">
            {t('hero.desc')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-5">
            <Link to="/pricing">
              <button className="bg-[#D4AF37] text-black px-10 py-4 rounded-[2px] font-tech text-[12px] font-black tracking-[2px] uppercase hover:bg-[#C9A227] hover:-translate-y-[2px] hover:shadow-[0_15px_30px_rgba(212,175,55,0.2)] transition-all duration-300">
                {t('hero.getStarted')}
              </button>
            </Link>
            <Link to="/about">
              <button className="bg-transparent text-white border border-white/20 px-10 py-4 rounded-[2px] font-tech text-[12px] font-black tracking-[2px] uppercase hover:bg-white hover:text-black hover:-translate-y-[2px] transition-all duration-300">
                {t('hero.viewStrategies')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black py-[60px] px-8 border-y border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="font-serif text-[36px] md:text-[48px] font-bold text-white mb-2 tracking-[-1px] group-hover:text-[#D4AF37] transition-colors">
                {stat.value}
              </div>
              <div className="font-tech text-[10px] font-bold tracking-[2px] uppercase text-slate-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-24 px-8 bg-[#05070A]">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16 text-center">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('methodology.badge')}</span>
            <h2 className="text-[32px] md:text-[48px] font-serif font-bold uppercase tracking-tighter">{t('methodology.title')}</h2>
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
              <div key={i} className="p-12 bg-[#080B12] flex flex-col hover:bg-white/[0.02] transition-all group">
                <div className="text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-[12px] font-bold uppercase tracking-[2px] mb-4 text-white">{item.title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed mb-8">{item.desc}</p>
                <ul className="space-y-3 mt-auto">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="py-24 px-8 bg-[#05070A] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-20 text-center">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('process_home.badge')}</span>
            <h2 className="text-[32px] md:text-[48px] font-serif font-bold uppercase tracking-tighter">
              {t('process_home.title')} <span className="text-[#D4AF37]">{t('process_home.subtitle')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent -z-10" />
            
            {[
              { icon: <CreditCard size={24} />, title: t('process_home.step1.title'), desc: t('process_home.step1.desc') },
              { icon: <Zap size={24} />, title: t('process_home.step2.title'), desc: t('process_home.step2.desc') },
              { icon: <Cpu size={24} />, title: t('process_home.step3.title'), desc: t('process_home.step3.desc') },
              { icon: <LayoutDashboard size={24} />, title: t('process_home.step4.title'), desc: t('process_home.step4.desc') },
              { icon: <Wallet size={24} />, title: t('process_home.step5.title'), desc: t('process_home.step5.desc') }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-[#080B12] border border-white/10 flex items-center justify-center text-[#D4AF37] mb-8 group-hover:border-[#D4AF37] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-500 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-black border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500">0{i+1}</span>
                  {step.icon}
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[2px] mb-4 text-white">{step.title}</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-8 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.08)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-[1000px] mx-auto text-center relative z-10">
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.6em] mb-6 block animate-pulse-badge">{t('cta_home.badge')}</span>
          <h2 className="font-serif text-[42px] md:text-[64px] font-bold leading-[1] mb-8 tracking-[-2px] uppercase">
            {t('cta_home.title')} <br />
            <span className="text-[#D4AF37]">{t('cta_home.subtitle')}</span>
          </h2>
          <p className="font-sans text-[15px] md:text-[18px] text-slate-400 mb-12 leading-[1.6] max-w-[700px] mx-auto">
            {t('cta_home.desc')}
          </p>
          <div className="flex flex-col items-center gap-6">
            <Link to="/pricing">
              <button className="bg-[#D4AF37] text-black px-16 py-5 rounded-[2px] font-tech text-[13px] font-black tracking-[2px] uppercase hover:bg-[#C9A227] hover:-translate-y-[2px] hover:shadow-[0_20px_40px_rgba(212,175,55,0.25)] transition-all duration-300 flex items-center gap-3">
                {t('cta_home.btn')} <ArrowUpRight size={20} />
              </button>
            </Link>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
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