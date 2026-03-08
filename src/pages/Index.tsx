"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, ShieldAlert, PieChart, ArrowRight, 
  Activity, Lock, Server, Scale, BarChart3, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#05070A] font-sans text-white selection:bg-[#C5A059]/30">
      <Navbar />
      
      {/* Hero: High-End Minimalist */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Institutional Architecture" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/0 via-[#05070A]/80 to-[#05070A]" />
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-[1px] w-12 bg-[#C5A059]" />
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.5em]">Institutional Grade</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.8] uppercase"
            >
              Quantitative <br />
              <span className="text-[#C5A059]">Excellence.</span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-10"
            >
              <Link to="/register">
                <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-14 h-20 text-[12px] font-bold uppercase tracking-widest transition-all border-none shadow-2xl shadow-[#C5A059]/10">
                  Open Account
                </Button>
              </Link>
              <Link to="/pricing" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-[#C5A059] transition-colors">
                View Strategies <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 space-y-40 pb-32">
        
        {/* Strategy: Concise & Visual */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
          {[
            {
              title: "Momentum",
              icon: <TrendingUp size={24} />,
              desc: "Statistical analysis identifying sustained price movements across global markets."
            },
            {
              title: "Protection",
              icon: <ShieldAlert size={24} />,
              desc: "Adaptive drawdown limits and real-time volatility modeling for capital preservation."
            },
            {
              title: "Risk Control",
              icon: <PieChart size={24} />,
              desc: "Systematic position sizing using Kelly Criterion and Monte Carlo stress testing."
            }
          ].map((item, i) => (
            <div key={i} className="p-16 bg-[#080B12] hover:bg-white/[0.02] transition-colors group">
              <div className="text-[#C5A059] mb-10 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] mb-4">{item.title}</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed uppercase tracking-wider">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* The Dashboard Visual: The "Value" Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em]">Proprietary Terminal</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                Real-Time <br /><span className="text-[#C5A059]">Transparency.</span>
              </h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Our custom-built dashboard provides institutional-level analytics, live equity curves, and millisecond execution logs. Total visibility into every automated operation.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-2xl font-black text-white">99.98%</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">System Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">1.2ms</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Avg. Latency</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-[#C5A059]/10 blur-[100px] rounded-full" />
            <div className="relative bg-[#080B12] border border-white/10 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Live Terminal</span>
                </div>
                <Zap size={16} className="text-[#C5A059]" />
              </div>
              
              <div className="space-y-8">
                <div className="p-6 bg-white/5 border border-white/5">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Performance</span>
                    <span className="text-xl font-black text-[#C5A059]">+12.4%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-full bg-[#C5A059]" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 border border-white/5">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Drawdown</p>
                    <p className="text-sm font-bold text-white">2.1%</p>
                  </div>
                  <div className="p-5 bg-white/5 border border-white/5">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Win Rate</p>
                    <p className="text-sm font-bold text-white">68%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Standards: Liquidity & Compliance */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 border border-white/5">
          <div className="p-16 bg-[#080B12] space-y-8">
            <Server className="text-[#C5A059]" size={32} />
            <h3 className="text-[12px] font-bold uppercase tracking-[0.3em]">Tier-1 Liquidity</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed uppercase tracking-wider">
              Direct market access to global liquidity pools, ensuring deep depth and institutional execution speeds.
            </p>
          </div>
          <div className="p-16 bg-[#080B12] space-y-8">
            <Scale className="text-[#C5A059]" size={32} />
            <h3 className="text-[12px] font-bold uppercase tracking-[0.3em]">Global Compliance</h3>
            <p className="text-slate-500 text-[11px] leading-relaxed uppercase tracking-wider">
              Strict adherence to KYC/AML protocols and enterprise-grade AES-256 data encryption standards.
            </p>
          </div>
        </section>

        {/* Final CTA: Bold & Direct */}
        <section className="relative py-32 border border-white/5 bg-[#080B12] text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/5 blur-[150px] -z-10" />
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-12 uppercase leading-none">
            Secure your <br /><span className="text-[#C5A059]">Financial Future.</span>
          </h2>
          <Link to="/register">
            <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-20 h-24 text-[14px] font-bold uppercase tracking-[0.4em] transition-all border-none">
              Get Started
            </Button>
          </Link>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Index;