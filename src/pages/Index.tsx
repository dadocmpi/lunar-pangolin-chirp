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
      <section className="relative mt-[130px] min-h-[700px] flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        {/* Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),rgba(0,0,0,0),rgba(0,0,0,0))] pointer-events-none z-[1]" />
        
        <div className="relative z-[2] text-center max-w-[900px] px-8 animate-fadeInUp">
          <div className="inline-block bg-black/50 border border-[#D4AF37] text-white px-5 py-[10px] rounded-[25px] font-tech text-[12px] font-semibold tracking-[1px] uppercase mb-8 animate-pulse-badge">
            ● INSTITUTIONAL ACCESS NOW OPEN
          </div>
          
          <h1 className="font-serif text-[40px] md:text-[80px] font-bold leading-[1.1] mb-6 tracking-[-1px] text-white">
            THE FUTURE OF
            <span className="block text-[#D4AF37]">QUANT TRADING.</span>
          </h1>
          
          <p className="font-sans text-[16px] md:text-[18px] text-[#E0E0E0] mb-10 leading-[1.8] max-w-[700px] mx-auto">
            Proprietary algorithms engineered for the modern market. Experience 
            institutional-grade execution with millisecond precision.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/register">
              <button className="bg-white text-black px-10 py-4 rounded-[50px] font-tech text-[14px] font-bold tracking-[1px] uppercase hover:bg-[#E0E0E0] hover:-translate-y-[3px] hover:shadow-[0_12px_24px_rgba(255,255,255,0.2)] transition-all duration-300">
                GET STARTED NOW
              </button>
            </Link>
            <Link to="/pricing">
              <button className="bg-transparent text-white border-2 border-white px-10 py-[14px] rounded-[50px] font-tech text-[14px] font-bold tracking-[1px] uppercase hover:bg-white hover:text-black hover:-translate-y-[3px] hover:shadow-[0_12px_24px_rgba(255,255,255,0.2)] transition-all duration-300">
                VIEW STRATEGIES
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-black py-[60px] px-8 border-y border-[#333333]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="text-center px-4 border-b lg:border-b-0 lg:border-r border-[#333333] last:border-none pb-8 lg:pb-0 hover:-translate-y-[5px] transition-transform duration-300"
            >
              <div className="font-serif text-[36px] md:text-[48px] font-bold text-[#D4AF37] mb-2 tracking-[-0.5px]">
                {stat.value}
              </div>
              <div className="font-tech text-[10px] md:text-[12px] font-semibold tracking-[1px] uppercase text-[#999999]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-24 space-y-32">
        
        {/* Section: Investment Strategy */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
            <div className="lg:col-span-3 p-12 bg-[#080B12] border-b border-white/10">
              <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Methodology</span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Institutional-Grade Strategy</h2>
            </div>
            {[
              {
                title: "Momentum Strategy",
                icon: <TrendingUp size={20} />,
                features: ["Multi-timeframe analysis", "Correlation detection", "Dynamic scaling"],
                desc: "We identify sustained price movements across multiple asset classes using advanced statistical analysis."
              },
              {
                title: "Volatility Protection",
                icon: <ShieldAlert size={20} />,
                features: ["Real-time VIX integration", "Adaptive drawdown limits", "De-risking protocols"],
                desc: "Advanced modeling that protects capital during market turbulence by dynamically adjusting exposure."
              },
              {
                title: "Risk Management",
                icon: <PieChart size={20} />,
                features: ["Kelly Criterion sizing", "Monte Carlo stress tests", "Daily VaR monitoring"],
                desc: "Rigorous controls ensuring capital preservation through systematic portfolio optimization."
              }
            ].map((item, i) => (
              <div key={i} className="p-12 bg-[#080B12] flex flex-col hover:bg-white/5 transition-colors">
                <div className="text-[#D4AF37] mb-8">{item.icon}</div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">{item.title}</h3>
                <p className="text-slate-500 text-[10px] leading-relaxed mb-8">{item.desc}</p>
                <ul className="space-y-3 mt-auto">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="w-1 h-1 bg-[#D4AF37]" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 p-6 bg-white/5 border border-white/10">
            <Info size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
            <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
              Important: Past performance does not guarantee future results. All investments carry risk. Braxel Markets is a technology company and does not provide financial advice.
            </p>
          </div>
        </section>

        {/* Technological Dashboard Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/5 flex items-center justify-center text-[#D4AF37] border border-white/10">
                <Layout size={16} />
              </div>
              <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em]">Proprietary Interface</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 uppercase">
              Technological <br /><span className="text-[#D4AF37]">Dashboard</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              Our dashboard is not just visual; it's a real-time data terminal. Developed to offer total transparency over every algorithm in execution.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {[
                { label: "Metrics", val: "Win Rate / Drawdown" },
                { label: "Logs", val: "Millisecond Execution" },
                { label: "Management", val: "Dynamic Allocation" },
                { label: "Reports", val: "Institutional Export" }
              ].map((item, i) => (
                <div key={i} className="border-l border-[#D4AF37]/30 pl-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-12 md:p-16 bg-[#05070A] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[#D4AF37]/5 blur-[120px]" />
            <div className="relative z-10 space-y-8">
              <div className="p-8 bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Weekly Performance</p>
                    <p className="text-2xl font-black text-[#D4AF37]">+4.82%</p>
                  </div>
                  <BarChart3 className="text-[#D4AF37]" size={24} />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 border border-white/10">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Uptime</p>
                  <p className="text-lg font-bold text-white">99.98%</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Latency</p>
                  <p className="text-lg font-bold text-white">1.2ms</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Global Liquidity Access */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-16 bg-[#05070A] flex flex-col justify-center relative">
            <div className="absolute inset-0 bg-[#D4AF37]/5 blur-[120px]" />
            <Server className="text-[#D4AF37] mb-8" size={40} />
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Connectivity</span>
            <h2 className="text-4xl font-black tracking-tighter mb-8 uppercase">Tier-1 Global <br /><span className="text-[#D4AF37]">Liquidity Access</span></h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Our infrastructure is directly connected to major Tier-1 liquidity providers, ensuring deep market depth and ultra-low latency execution for every automated operation.
            </p>
            <div className="flex gap-12">
              <div>
                <p className="text-2xl font-black text-white">1.2ms</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Avg. Latency</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">20+</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Liquidity Pools</p>
              </div>
            </div>
          </div>
          <div className="p-16 bg-[#080B12] flex flex-col justify-center">
            <ul className="space-y-8">
              {[
                { title: "Direct Market Access", desc: "Bypassing traditional retail delays for institutional speed." },
                { title: "Smart Order Routing", desc: "Optimizing execution across multiple venues for best pricing." },
                { title: "Redundant Infrastructure", desc: "Fail-safe server clusters located in major financial hubs." }
              ].map((item, i) => (
                <li key={i} className="flex gap-6">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-2">{item.title}</h4>
                    <p className="text-slate-500 text-[10px] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: Institutional Compliance */}
        <section className="border border-white/10 bg-[#080B12]">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            <div className="p-16 lg:col-span-1 flex flex-col justify-center">
              <Scale className="text-[#D4AF37] mb-6" size={32} />
              <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Standards</span>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">Institutional <br />Compliance</h2>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                We adhere to the highest global standards of data protection and financial transparency, ensuring a secure environment for your capital.
              </p>
            </div>
            <div className="p-16 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { title: "KYC/AML Protocols", desc: "Rigorous identity verification and anti-money laundering procedures.", icon: <Users size={20} /> },
                { title: "Data Encryption", desc: "Enterprise-grade AES-256 encryption for all sensitive information.", icon: <Lock size={20} /> },
                { title: "GDPR Compliant", desc: "Strict adherence to European data privacy and protection regulations.", icon: <Shield size={20} /> },
                { title: "Audit Trails", desc: "Comprehensive logging of all system activities for full accountability.", icon: <Database size={20} /> }
              ].map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="text-[#D4AF37]">{item.icon}</div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-white">{item.title}</h4>
                  <p className="text-slate-500 text-[10px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Why Choose Us / Transparency */}
        <section className="border border-white/10 bg-[#080B12]">
          <div className="p-16 border-b border-white/10 text-center">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Differentiator</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Trust and Transparency</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {[
              { 
                title: "No Hidden Fees", 
                icon: <CheckCircle2 size={20} />, 
                desc: "Clear and straightforward pricing with no surprises. What you see is what you pay." 
              },
              { 
                title: "Full Transparency", 
                icon: <Eye size={20} />, 
                desc: "Access detailed reports, trade history, and performance metrics anytime." 
              },
              { 
                title: "Secure Infrastructure", 
                icon: <Shield size={20} />, 
                desc: "Enterprise-grade security protecting your data and ensuring platform reliability." 
              }
            ].map((item, i) => (
              <div key={i} className="p-12 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
                <div className="text-[#D4AF37] mb-8">{item.icon}</div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">{item.title}</h3>
                <p className="text-slate-500 text-[10px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative p-20 md:p-32 border border-white/10 bg-[#080B12] text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 blur-[120px] -z-10" />
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block">Ready to start?</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 uppercase">
            Start your investment <br /><span className="text-[#D4AF37]">journey today.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link to="/register">
              <button className="bg-[#D4AF37] hover:bg-[#B08D48] text-white rounded-none px-16 h-20 text-[12px] font-bold uppercase tracking-widest transition-all border-none">
                Create My Account
              </button>
            </Link>
            <Link to="/pricing" className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors border-b border-white/10 pb-1">
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