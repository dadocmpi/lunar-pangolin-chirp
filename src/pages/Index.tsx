"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, BarChart3, ArrowRight, CheckCircle2, 
  Layout, Globe, Database, Activity, Layers, Users,
  TrendingUp, ShieldAlert, PieChart, Lock, Eye, Info,
  Server, Scale, Cpu, ChevronRight, Network, ArrowUpRight,
  CreditCard, LayoutDashboard, Wallet, Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';
import ResultsSection from '@/components/ResultsSection';
import FAQSection from '@/components/FAQSection';

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
            <a href="#results">
              <button className="bg-transparent text-white border border-white/10 px-12 py-5 rounded-none font-tech text-[11px] font-black tracking-[0.25em] uppercase hover:bg-white/5 hover:-translate-y-[2px] transition-all duration-500">
                {t('hero.viewStrategies')}
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black py-24 px-8 border-y border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
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

      {/* Results Section */}
      <ResultsSection />

      {/* Process Flow Section - Simplified to 3 Steps */}
      <section id="how-it-works" className="py-32 px-8 bg-[#05070A]">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-24 text-center">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('process_home.badge')}</span>
            <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight">
              {t('process_home.title')} <span className="text-white">{t('process_home.subtitle')}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent -z-10" />
            
            {[
              { icon: <Network size={32} />, title: t('process_home.step1.title'), desc: t('process_home.step1.desc') },
              { icon: <Zap size={32} />, title: t('process_home.step2.title'), desc: t('process_home.step2.desc') },
              { icon: <Cpu size={32} />, title: t('process_home.step3.title'), desc: t('process_home.step3.desc') }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-28 h-28 bg-[#080B12] border border-white/5 flex items-center justify-center text-[#D4AF37] mb-10 group-hover:border-[#D4AF37]/40 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.05)] transition-all duration-700 relative">
                  <span className="absolute -top-4 -right-4 w-10 h-10 bg-black border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-600">0{i+1}</span>
                  {step.icon}
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5 text-white">{step.title}</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed px-6 font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-32 px-8 bg-[#05070A] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-24 text-center">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('methodology.badge')}</span>
            <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight leading-tight">{t('methodology.title')}</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {[
              {
                title: t('methodology.momentum.title'),
                icon: <TrendingUp size={32} />,
                features: [t('methodology.momentum.f1'), t('methodology.momentum.f2'), t('methodology.momentum.f3')],
                desc: t('methodology.momentum.desc')
              },
              {
                title: t('methodology.volatility.title'),
                icon: <ShieldAlert size={32} />,
                features: [t('methodology.volatility.f1'), t('methodology.volatility.f2'), t('methodology.volatility.f3')],
                desc: t('methodology.volatility.desc')
              },
              {
                title: t('methodology.risk.title'),
                icon: <PieChart size={32} />,
                features: [t('methodology.risk.f1'), t('methodology.risk.f2'), t('methodology.risk.f3')],
                desc: t('methodology.risk.desc')
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

      {/* FAQ Section */}
      <FAQSection />

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
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                <Lock size={12} /> {t('cta_home.trust')}
              </div>
              <p className="text-[9px] text-slate-700 uppercase tracking-widest max-w-md leading-relaxed">
                {t('legal.riskWarning')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;