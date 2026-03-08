"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, BarChart3, ArrowRight, CheckCircle2, 
  Layout, Globe, Database, Activity, Layers, Users,
  TrendingUp, ShieldAlert, PieChart, Lock, Eye, Info,
  Server, Scale, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#05070A] font-sans text-white selection:bg-[#C5A059] selection:text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
            alt="Global Network" 
            className="w-full h-full object-cover opacity-30 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070A] via-[#05070A]/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.05)_0%,transparent_70%)]" />
        </div>

        <div className="container mx-auto px-4 md:px-8 pt-20">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-[1px] w-12 bg-[#C5A059]" />
              <span className="text-[#C5A059] text-[11px] font-bold uppercase tracking-[0.5em]">Institutional Grade Infrastructure</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-[110px] font-black tracking-tighter mb-10 leading-[0.8] uppercase"
            >
              Quantitative <br />
              <span className="text-[#C5A059]">Intelligence.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 mb-14 leading-relaxed max-w-2xl font-medium"
            >
              Proprietary algorithms combining proven quantitative strategies with advanced risk management for consistent, risk-adjusted returns in global markets.
            </motion.p>
            
            <div className="flex flex-wrap items-center gap-10">
              <Link to="/register">
                <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-16 h-20 text-[12px] font-bold uppercase tracking-[0.2em] transition-all border-none shadow-[0_0_40px_rgba(197,160,89,0.15)]">
                  Start Journey
                </Button>
              </Link>
              <Link to="/pricing" className="text-white font-bold uppercase tracking-[0.2em] text-[11px] hover:text-[#C5A059] transition-colors flex items-center gap-3 group">
                View Plans <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-32 space-y-40">
        
        {/* Section: Methodology Grid */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
            <div className="lg:col-span-3 p-16 bg-[#080B12] border-b border-white/10">
              <span className="text-[#C5A059] text-[11px] font-bold uppercase tracking-[0.5em] mb-6 block">Methodology</span>
              <h2 className="text-4xl font-black uppercase tracking-tighter">Institutional-Grade Strategy</h2>
            </div>
            {[
              {
                title: "Momentum Strategy",
                icon: <TrendingUp size={24} />,
                features: ["Multi-timeframe analysis", "Correlation detection", "Dynamic scaling"],
                desc: "We identify sustained price movements across multiple asset classes using advanced statistical analysis."
              },
              {
                title: "Volatility Protection",
                icon: <ShieldAlert size={24} />,
                features: ["Real-time VIX integration", "Adaptive drawdown limits", "De-risking protocols"],
                desc: "Advanced modeling that protects capital during market turbulence by dynamically adjusting exposure."
              },
              {
                title: "Risk Management",
                icon: <PieChart size={24} />,
                features: ["Kelly Criterion sizing", "Monte Carlo stress tests", "Daily VaR monitoring"],
                desc: "Rigorous controls ensuring capital preservation through systematic portfolio optimization."
              }
            ].map((item, i) => (
              <div key={i} className="p-16 bg-[#080B12] flex flex-col hover:bg-white/[0.03] transition-all group">
                <div className="text-[#C5A059] mb-10 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
                <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6">{item.title}</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed mb-10 font-medium">{item.desc}</p>
                <ul className="space-y-4 mt-auto">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      <div className="w-1.5 h-1.5 bg-[#C5A059]" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-start gap-4 p-8 bg-white/[0.02] border border-white/10">
            <Info size={20} className="text-[#C5A059] shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] leading-relaxed font-medium">
              Important: Past performance does not guarantee future results. All investments carry risk. Braxel Markets is a technology company and does not provide financial advice.
            </p>
          </div>
        </section>

        {/* Section: Technological Dashboard */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-16 md:p-24 bg-[#080B12] flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-[#C5A059] border border-white/10">
                <Layout size={20} />
              </div>
              <span className="text-[#C5A059] text-[11px] font-bold uppercase tracking-[0.4em]">Proprietary Interface</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 uppercase leading-tight">
              Technological <br /><span className="text-[#C5A059]">Dashboard</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-12 font-medium">
              Our dashboard is not just visual; it's a real-time data terminal. Developed to offer total transparency over every algorithm in execution.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              {[
                { label: "Metrics", val: "Win Rate / Drawdown" },
                { label: "Logs", val: "Millisecond Execution" },
                { label: "Management", val: "Dynamic Allocation" },
                { label: "Reports", val: "Institutional Export" }
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-[#C5A059]/40 pl-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{item.label}</p>
                  <p className="text-[11px] font-bold text-white uppercase tracking-[0.1em]">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-16 md:p-24 bg-[#05070A] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[#C5A059]/5 blur-[120px]" />
            <div className="relative z-10 space-y-10">
              <div className="p-10 bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">Weekly Performance</p>
                    <p className="text-4xl font-black text-[#C5A059]">+4.82%</p>
                  </div>
                  <BarChart3 className="text-[#C5A059]" size={32} />
                </div>
                <div className="h-[3px] w-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "75%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.5)]" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">Uptime</p>
                  <p className="text-2xl font-black text-white">99.98%</p>
                </div>
                <div className="p-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">Latency</p>
                  <p className="text-2xl font-black text-white">1.2ms</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Global Liquidity Access */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-20 bg-[#05070A] flex flex-col justify-center relative">
            <div className="absolute inset-0 bg-[#C5A059]/5 blur-[120px]" />
            <Server className="text-[#C5A059] mb-10" size={48} />
            <span className="text-[#C5A059] text-[11px] font-bold uppercase tracking-[0.5em] mb-6 block">Connectivity</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-10 uppercase leading-tight">Tier-1 Global <br /><span className="text-[#C5A059]">Liquidity Access</span></h2>
            <p className="text-slate-400 text-base leading-relaxed mb-12 font-medium">
              Our infrastructure is directly connected to major Tier-1 liquidity providers, ensuring deep market depth and ultra-low latency execution for every automated operation.
            </p>
            <div className="flex gap-16">
              <div>
                <p className="text-3xl font-black text-white">1.2ms</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Avg. Latency</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">20+</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Liquidity Pools</p>
              </div>
            </div>
          </div>
          <div className="p-20 bg-[#080B12] flex flex-col justify-center">
            <ul className="space-y-10">
              {[
                { title: "Direct Market Access", desc: "Bypassing traditional retail delays for institutional speed." },
                { title: "Smart Order Routing", desc: "Optimizing execution across multiple venues for best pricing." },
                { title: "Redundant Infrastructure", desc: "Fail-safe server clusters located in major financial hubs." }
              ].map((item, i) => (
                <li key={i} className="flex gap-8 group">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-[#C5A059] shrink-0 group-hover:bg-[#C5A059] group-hover:text-white transition-all duration-500">
                    <Activity size={22} />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white mb-3">{item.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section: Institutional Compliance */}
        <section className="border border-white/10 bg-[#080B12]">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            <div className="p-20 lg:col-span-1 flex flex-col justify-center">
              <Scale className="text-[#C5A059] mb-8" size={40} />
              <span className="text-[#C5A059] text-[11px] font-bold uppercase tracking-[0.5em] mb-6 block">Standards</span>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 leading-tight">Institutional <br />Compliance</h2>
              <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                We adhere to the highest global standards of data protection and financial transparency, ensuring a secure environment for your capital.
              </p>
            </div>
            <div className="p-20 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-16">
              {[
                { title: "KYC/AML Protocols", desc: "Rigorous identity verification and anti-money laundering procedures.", icon: <Users size={24} /> },
                { title: "Data Encryption", desc: "Enterprise-grade AES-256 encryption for all sensitive information.", icon: <Lock size={24} /> },
                { title: "GDPR Compliant", desc: "Strict adherence to European data privacy and protection regulations.", icon: <Shield size={24} /> },
                { title: "Audit Trails", desc: "Comprehensive logging of all system activities for full accountability.", icon: <Database size={24} /> }
              ].map((item, i) => (
                <div key={i} className="space-y-5">
                  <div className="text-[#C5A059]">{item.icon}</div>
                  <h4 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white">{item.title}</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative p-24 md:p-40 border border-white/10 bg-[#080B12] text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A059]/5 blur-[150px] -z-10" />
          <span className="text-[#C5A059] text-[11px] font-bold uppercase tracking-[0.5em] mb-8 block">Ready to start?</span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-16 uppercase leading-tight">
            Start your investment <br /><span className="text-[#C5A059]">journey today.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            <Link to="/register">
              <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-20 h-24 text-[13px] font-bold uppercase tracking-[0.3em] transition-all border-none shadow-[0_0_50px_rgba(197,160,89,0.2)]">
                Create My Account
              </Button>
            </Link>
            <Link to="/pricing" className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px] hover:text-white transition-colors border-b-2 border-white/10 pb-2">
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