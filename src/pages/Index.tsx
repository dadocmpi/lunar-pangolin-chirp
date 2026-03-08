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
import { cn } from '@/lib/utils';

const Index = () => {
  const plans = [
    { name: "Starter 2K", price: "€69.99", size: "$2,000" },
    { name: "Pro 5K", price: "€159.99", size: "$5,000", popular: true },
    { name: "Advanced 10K", price: "€319.99", size: "$10,000" },
    { name: "Elite 20K", price: "€629.99", size: "$20,000" }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] font-sans text-white selection:bg-[#C5A059]/30">
      <Navbar />
      
      {/* Hero Section - Exclusive Invite Style */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(197,160,89,0.05),transparent_70%)]" />
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
            alt="Data Terminal" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A] via-transparent to-[#05070A]" />
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              <span className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em]">Institutional Access Only</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.8] uppercase"
            >
              The Future of <br />
              <span className="text-[#C5A059]">Capital.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl"
            >
              Proprietary quantitative infrastructure designed for high-net-worth individuals and institutional partners.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center items-center gap-6"
            >
              <Link to="/register">
                <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-12 h-16 text-[11px] font-bold uppercase tracking-widest transition-all border-none shadow-[0_0_30px_rgba(197,160,89,0.2)]">
                  Request Access
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white rounded-none px-12 h-16 text-[11px] font-bold uppercase tracking-widest transition-all">
                  View Allocations
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Pricing Grid - "Up There" */}
      <section className="py-24 border-y border-white/5 bg-[#080B12]/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
            {plans.map((plan, i) => (
              <div key={i} className="p-10 bg-[#05070A] group hover:bg-[#080B12] transition-colors relative">
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C5A059]" />
                )}
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-6">{plan.name}</p>
                <div className="mb-6">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-600 text-[10px] uppercase tracking-widest ml-2">/ mo</span>
                </div>
                <div className="py-3 px-4 bg-white/5 border border-white/5 mb-8">
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-1">Allocation</p>
                  <p className="text-lg font-bold text-[#C5A059]">{plan.size} USD</p>
                </div>
                <Link to="/register" className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-white group-hover:text-[#C5A059] transition-colors">
                  Select Plan <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-32 space-y-40">
        
        {/* Enhanced Terminal Dashboard Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden rounded-sm">
          <div className="p-16 bg-[#080B12] flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-[#C5A059] border border-white/10">
                <Cpu size={20} />
              </div>
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em]">Proprietary Terminal</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 uppercase leading-tight">
              Institutional <br /><span className="text-[#C5A059]">Command Center</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-md">
              Our proprietary dashboard provides millisecond-level transparency. Monitor every algorithmic execution, risk parameter, and equity curve in real-time.
            </p>
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: "Execution", val: "1.2ms Latency" },
                { label: "Security", val: "AES-256 Encrypted" },
                { label: "Uptime", val: "99.98% SLA" },
                { label: "Support", val: "24/7 Dedicated" }
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-[#C5A059]/20 pl-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-12 bg-[#05070A] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(197,160,89,0.1),transparent_70%)]" />
            
            {/* Terminal UI Mockup */}
            <div className="w-full max-w-md bg-[#080B12] border border-white/10 rounded-lg overflow-hidden shadow-2xl relative z-10">
              <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Braxel_Terminal_v4.0</span>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Equity</p>
                    <p className="text-2xl font-black text-white">$124,502.84</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-green-500 mb-1">Daily P/L</p>
                    <p className="text-sm font-bold text-green-500">+$1,402.12</p>
                  </div>
                </div>
                
                <div className="h-32 w-full bg-white/5 relative overflow-hidden rounded-sm">
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      d="M0 100 L50 80 L100 90 L150 60 L200 70 L250 40 L300 50 L350 20 L400 30 L450 10"
                      fill="none"
                      stroke="#C5A059"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: "Drawdown", v: "2.4%" },
                    { l: "Win Rate", v: "68%" },
                    { l: "Trades", v: "142" }
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-sm border border-white/5">
                      <p className="text-[7px] font-bold uppercase tracking-widest text-slate-500 mb-1">{s.l}</p>
                      <p className="text-[10px] font-bold text-white">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Global Liquidity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#C5A059]/10 blur-[100px] -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
              alt="Global Connectivity" 
              className="w-full aspect-square object-cover grayscale border border-white/10"
            />
            <div className="absolute bottom-8 right-8 bg-[#080B12] border border-white/10 p-8 max-w-xs">
              <p className="text-3xl font-black text-[#C5A059] mb-2">20+</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white">Tier-1 Liquidity Providers</p>
            </div>
          </div>
          <div className="space-y-8">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block">Connectivity</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight">Global <br />Market Depth</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Direct Market Access (DMA) to the world's largest financial hubs. Our infrastructure bypasses traditional retail delays, providing institutional-grade execution speed and pricing.
            </p>
            <ul className="space-y-6 pt-4">
              {[
                "Ultra-low latency fiber-optic cross-connects",
                "Smart Order Routing (SOR) technology",
                "Redundant server clusters in LD4, NY4, and TY3"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white">
                  <div className="w-1.5 h-1.5 bg-[#C5A059]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 border border-white/10 bg-[#080B12] text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(197,160,89,0.05),transparent_70%)]" />
          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-8 block">Limited Availability</span>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-12 uppercase leading-none">
              Secure Your <br /><span className="text-[#C5A059]">Allocation.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/register">
                <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-16 h-20 text-[12px] font-bold uppercase tracking-widest transition-all border-none shadow-2xl">
                  Open Account
                </Button>
              </Link>
              <Link to="/contact" className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors border-b border-white/10 pb-1">
                Speak with a Specialist
              </Link>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Index;