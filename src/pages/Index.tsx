"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, BarChart3, ArrowRight, CheckCircle2, 
  Layout, Globe, Database, Activity, Layers, Users,
  TrendingUp, ShieldAlert, PieChart, Lock, Eye, Info,
  Server, Scale, Cpu, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const Index = () => {
  const stats = [
    { value: "$2.4B+", label: "VOLUME TRADED" },
    { value: "12,400+", label: "ACTIVE TRADERS" },
    { value: "99.97%", label: "UPTIME SLA" },
    { value: "<1.8ms", label: "AVG LATENCY" },
  ];

  return (
    <div className="min-h-screen bg-black font-sans text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />

      {/* HERO SECTION */}
      <section className="relative mt-[110px] min-h-[550px] flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        {/* Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),rgba(0,0,0,0),rgba(0,0,0,0))] pointer-events-none z-[1]" />
        
        <div className="relative z-[2] text-center max-w-[800px] px-8 animate-fadeInUp">
          <div className="inline-block bg-black/50 border border-[#D4AF37] text-white px-4 py-[8px] rounded-[25px] font-tech text-[10px] font-semibold tracking-[1px] uppercase mb-6 animate-pulse-badge">
            ● INSTITUTIONAL ACCESS NOW OPEN
          </div>
          
          <h1 className="font-serif text-[36px] md:text-[64px] font-bold leading-[1.1] mb-5 tracking-[-1px] text-white">
            THE FUTURE OF
            <span className="block text-[#D4AF37]">QUANT TRADING.</span>
          </h1>
          
          <p className="font-sans text-[14px] md:text-[16px] text-[#E0E0E0] mb-8 leading-[1.6] max-w-[600px] mx-auto">
            Proprietary algorithms engineered for the modern market. Experience 
            institutional-grade execution with millisecond precision.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <button className="bg-white text-black px-8 py-3.5 rounded-[50px] font-tech text-[12px] font-bold tracking-[1px] uppercase hover:bg-[#E0E0E0] hover:-translate-y-[2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.15)] transition-all duration-300">
                GET STARTED NOW
              </button>
            </Link>
            <Link to="/pricing">
              <button className="bg-transparent text-white border-2 border-white px-8 py-[12px] rounded-[50px] font-tech text-[12px] font-bold tracking-[1px] uppercase hover:bg-white hover:text-black hover:-translate-y-[2px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.15)] transition-all duration-300">
                VIEW STRATEGIES
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
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

      <div className="container mx-auto px-4 md:px-8 py-16 space-y-20">
        
        {/* Section: Investment Strategy */}
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
          <div className="mt-6 flex items-start gap-3 p-5 bg-white/5 border border-white/10">
            <Info size={14} className="text-[#D4AF37] shrink-0 mt-0.5" />
            <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-relaxed">
              Important: Past performance does not guarantee future results. All investments carry risk. Braxel Markets is a technology company and does not provide financial advice.
            </p>
          </div>
        </section>

        {/* Technological Dashboard Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-10 md:p-14 bg-[#080B12] flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-7 h-7 bg-white/5 flex items-center justify-center text-[#D4AF37] border border-white/10">
                <Layout size={14} />
              </div>
              <span className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.3em]">Proprietary Interface</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-5 uppercase">
              Technological <br /><span className="text-[#D4AF37]">Dashboard</span>
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-8">
              Our dashboard is not just visual; it's a real-time data terminal. Developed to offer total transparency over every algorithm in execution.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              {[
                { label: "Metrics", val: "Win Rate / Drawdown" },
                { label: "Logs", val: "Millisecond Execution" },
                { label: "Management", val: "Dynamic Allocation" },
                { label: "Reports", val: "Institutional Export" }
              ].map((item, i) => (
                <div key={i} className="border-l border-[#D4AF37]/30 pl-4">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                  <p className="text-[9px] font-bold text-white uppercase tracking-wider">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-10 md:p-14 bg-[#05070A] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[#D4AF37]/5 blur-[120px]" />
            <div className="relative z-10 space-y-6">
              <div className="p-6 bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Weekly Performance</p>
                    <p className="text-xl font-black text-[#D4AF37]">+4.82%</p>
                  </div>
                  <BarChart3 className="text-[#D4AF37]" size={20} />
                </div>
                <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "75%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-[#D4AF37]" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-5 bg-white/5 border border-white/10">
                  <p className="text-[7px] font-bold uppercase tracking-widest text-slate-500 mb-1">Uptime</p>
                  <p className="text-base font-bold text-white">99.98%</p>
                </div>
                <div className="p-5 bg-white/5 border border-white/10">
                  <p className="text-[7px] font-bold uppercase tracking-widest text-slate-500 mb-1">Latency</p>
                  <p className="text-base font-bold text-white">1.2ms</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Global Liquidity Access */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-12 bg-[#05070A] flex flex-col justify-center relative">
            <div className="absolute inset-0 bg-[#D4AF37]/5 blur-[120px]" />
            <Server className="text-[#D4AF37] mb-6" size={32} />
            <span className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.4em] mb-3 block">Connectivity</span>
            <h2 className="text-3xl font-black tracking-tighter mb-6 uppercase">Tier-1 Global <br /><span className="text-[#D4AF37]">Liquidity Access</span></h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Our infrastructure is directly connected to major Tier-1 liquidity providers, ensuring deep market depth and ultra-low latency execution for every automated operation.
            </p>
            <div className="flex gap-10">
              <div>
                <p className="text-xl font-black text-white">1.2ms</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Avg. Latency</p>
              </div>
              <div>
                <p className="text-xl font-black text-white">20+</p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Liquidity Pools</p>
              </div>
            </div>
          </div>
          <div className="p-12 bg-[#080B12] flex flex-col justify-center">
            <ul className="space-y-6">
              {[
                { title: "Direct Market Access", desc: "Bypassing traditional retail delays for institutional speed." },
                { title: "Smart Order Routing", desc: "Optimizing execution across multiple venues for best pricing." },
                { title: "Redundant Infrastructure", desc: "Fail-safe server clusters located in major financial hubs." }
              ].map((item, i) => (
                <li key={i} className="flex gap-5">
                  <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-[9px] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: Institutional Compliance */}
        <section className="border border-white/10 bg-[#080B12]">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            <div className="p-12 lg:col-span-1 flex flex-col justify-center">
              <Scale className="text-[#D4AF37] mb-5" size={28} />
              <span className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.4em] mb-3 block">Standards</span>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-5">Institutional <br />Compliance</h2>
              <p className="text-slate-500 text-[9px] leading-relaxed">
                We adhere to the highest global standards of data protection and financial transparency, ensuring a secure environment for your capital.
              </p>
            </div>
            <div className="p-12 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { title: "KYC/AML Protocols", desc: "Rigorous identity verification and anti-money laundering procedures.", icon: <Users size={18} /> },
                { title: "Data Encryption", desc: "Enterprise-grade AES-256 encryption for all sensitive information.", icon: <Lock size={18} /> },
                { title: "GDPR Compliant", desc: "Strict adherence to European data privacy and protection regulations.", icon: <Shield size={18} /> },
                { title: "Audit Trails", desc: "Comprehensive logging of all system activities for full accountability.", icon: <Database size={18} /> }
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="text-[#D4AF37]">{item.icon}</div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">{item.title}</h4>
                  <p className="text-slate-500 text-[9px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Why Choose Us / Transparency */}
        <section className="border border-white/10 bg-[#080B12]">
          <div className="p-12 border-b border-white/10 text-center">
            <span className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.4em] mb-3 block">Differentiator</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Trust and Transparency</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {[
              { 
                title: "No Hidden Fees", 
                icon: <CheckCircle2 size={18} />, 
                desc: "Clear and straightforward pricing with no surprises. What you see is what you pay." 
              },
              { 
                title: "Full Transparency", 
                icon: <Eye size={18} />, 
                desc: "Access detailed reports, trade history, and performance metrics anytime." 
              },
              { 
                title: "Secure Infrastructure", 
                icon: <Shield size={18} />, 
                desc: "Enterprise-grade security protecting your data and ensuring platform reliability." 
              }
            ].map((item, i) => (
              <div key={i} className="p-10 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
                <div className="text-[#D4AF37] mb-6">{item.icon}</div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3">{item.title}</h3>
                <p className="text-slate-500 text-[9px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative p-16 md:p-24 border border-white/10 bg-[#080B12] text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 blur-[120px] -z-10" />
          <span className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.4em] mb-5 block">Ready to start?</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-10 uppercase">
            Start your investment <br /><span className="text-[#D4AF37]">journey today.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/register">
              <button className="bg-[#D4AF37] hover:bg-[#B08D48] text-white rounded-none px-12 h-16 text-[11px] font-bold uppercase tracking-widest transition-all border-none">
                Create My Account
              </button>
            </Link>
            <Link to="/pricing" className="text-slate-400 font-bold uppercase tracking-widest text-[9px] hover:text-white transition-colors border-b border-white/10 pb-1">
              View Plans & Pricing
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Index;