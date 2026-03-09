"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, BarChart3, ArrowRight, CheckCircle2, 
  Layout, Globe, Database, Activity, Layers, Users,
  TrendingUp, ShieldAlert, PieChart, Lock, Eye, Info,
  Server, Scale, Cpu, ChevronRight, Network
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
            <Link to="/register">
              <button className="bg-[#D4AF37] text-black px-10 py-4 rounded-[2px] font-tech text-[12px] font-black tracking-[2px] uppercase hover:bg-[#C9A227] hover:-translate-y-[2px] hover:shadow-[0_15px_30px_rgba(212,175,55,0.2)] transition-all duration-300">
                {t('hero.getStarted')}
              </button>
            </Link>
            <Link to="/pricing">
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

      {/* Infrastructure Section */}
      <section className="py-24 px-8 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('infrastructure.badge')}</span>
            <h2 className="text-[32px] md:text-[48px] font-serif font-bold uppercase tracking-tighter mb-6">{t('infrastructure.title')}</h2>
            <p className="text-slate-400 text-[15px] leading-relaxed mb-10 max-w-md">
              {t('infrastructure.desc')}
            </p>
            <div className="space-y-6">
              {[
                { city: t('infrastructure.london'), latency: "0.4ms" },
                { city: t('infrastructure.newyork'), latency: "0.6ms" },
                { city: t('infrastructure.tokyo'), latency: "1.2ms" }
              ].map((loc, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <Network size={16} className="text-[#D4AF37]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">{loc.city}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#44FF44]">{loc.latency}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] absolute inset-0 -z-10" />
            <div className="border border-white/10 p-2 bg-black">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="Data Center" 
                className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;