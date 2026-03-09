"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, BarChart3, ArrowRight, CheckCircle2, 
  Layout, Globe, Database, Activity, Layers, Users,
  TrendingUp, ShieldAlert, PieChart, Lock, Eye, Info,
  Server, Scale, Cpu, ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const Index = () => {
  const { t } = useTranslation();
  
  const stats = [
    { value: "$2.4B+", label: t('stats.volume') || "Trading Volume" },
    { value: "12,400+", label: t('stats.traders') || "Active Traders" },
    { value: "99.97%", label: t('stats.uptime') || "System Uptime" },
    { value: "<1.8ms", label: t('stats.latency') || "Execution Latency" },
  ];

  return (
    <div className="min-h-screen bg-black font-sans text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />

      {/* Hero Section */}
      <section className="relative mt-[110px] min-h-[550px] flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),rgba(0,0,0,0),rgba(0,0,0,0))] pointer-events-none z-[1]" />
        
        <div className="relative z-[2] text-center max-w-[800px] px-8 animate-fadeInUp">
          <div className="inline-block bg-black/50 border border-[#D4AF37] text-white px-4 py-[8px] rounded-[25px] font-tech text-[10px] font-semibold tracking-[1px] uppercase mb-6 animate-pulse-badge">
            ● {t('hero.badge')}
          </div>
          
          <h1 className="font-serif text-[36px] md:text-[64px] font-bold leading-[1.1] mb-5 tracking-[-1px] text-white">
            {t('hero.title1')}
            <span className="block text-[#D4AF37]">{t('hero.title2')}</span>
          </h1>
          
          <p className="font-sans text-[14px] md:text-[16px] text-[#E0E0E0] mb-8 leading-[1.6] max-w-[600px] mx-auto">
            {t('hero.desc')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <button className="bg-white text-black px-8 py-3.5 rounded-[50px] font-tech text-[12px] font-bold tracking-[1px] uppercase hover:bg-[#E0E0E0] hover:-translate-y-[2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.15)] transition-all duration-300">
                {t('hero.getStarted')}
              </button>
            </Link>
            <Link to="/pricing">
              <button className="bg-transparent text-white border-2 border-white px-8 py-[12px] rounded-[50px] font-tech text-[12px] font-bold tracking-[1px] uppercase hover:bg-white hover:text-black hover:-translate-y-[2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.15)] transition-all duration-300">
                {t('hero.viewStrategies')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black py-[40px] px-8 border-y border-[#333333]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="text-center px-4 border-b lg:border-b-0 lg:border-r border-[#333333] last:border-none pb-6 lg:pb-0 hover:-translate-y-[3px] transition-transform duration-300"
            >
              <div className="font-serif text-[32px] md:text-[40px] font-bold text-[#D4AF37] mb-1 tracking-[-0.5px]">
                {stat.value}
              </div>
              <div className="font-tech text-[9px] md:text-[11px] font-semibold tracking-[1px] uppercase text-[#999999]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Methodology Section */}
      <div className="container mx-auto px-4 md:px-8 py-16 space-y-20">
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
            <div className="lg:col-span-3 p-10 bg-[#080B12] border-b border-white/10">
              <span className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.4em] mb-3 block">Methodology</span>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Institutional-Grade Strategy</h2>
            </div>
            {[
              {
                title: "Momentum Strategy",
                icon: <TrendingUp size={18} />,
                features: ["Multi-timeframe analysis", "Correlation detection", "Dynamic scaling"],
                desc: "We identify sustained price movements across multiple asset classes using advanced statistical analysis."
              },
              {
                title: "Volatility Protection",
                icon: <ShieldAlert size={18} />,
                features: ["Real-time VIX integration", "Adaptive drawdown limits", "De-risking protocols"],
                desc: "Advanced modeling that protects capital during market turbulence by dynamically adjusting exposure."
              },
              {
                title: "Risk Management",
                icon: <PieChart size={18} />,
                features: ["Kelly Criterion sizing", "Monte Carlo stress tests", "Daily VaR monitoring"],
                desc: "Rigorous controls ensuring capital preservation through systematic portfolio optimization."
              }
            ].map((item, i) => (
              <div key={i} className="p-10 bg-[#080B12] flex flex-col hover:bg-white/5 transition-colors">
                <div className="text-[#D4AF37] mb-6">{item.icon}</div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3">{item.title}</h3>
                <p className="text-slate-500 text-[9px] leading-relaxed mb-6">{item.desc}</p>
                <ul className="space-y-2 mt-auto">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="w-1 h-1 bg-[#D4AF37]" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Index;