"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, BarChart3, ArrowRight, CheckCircle2, Cpu, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#05070A] font-sans text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1611974714024-4607ad03d639?q=80&w=2070&auto=format&fit=crop" 
            alt="Trading Professional" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/70 via-[#05070A]/90 to-[#05070A]" />
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-10 bg-[#C5A059]" />
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.3em]">Tecnologia Braxel Markets</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-7xl font-black tracking-tighter mb-6 leading-tight"
            >
              INVESTIMENTO <br />
              <span className="text-[#C5A059]">INTELIGENTE.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl border-l-2 border-[#C5A059]/40 pl-6"
            >
              Infraestrutura de execução automatizada para quem busca consistência. Eliminamos o erro emocional através de tecnologia proprietária de alta performance.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Link to="/register">
                <Button size="lg" className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-10 h-16 text-[12px] font-bold uppercase tracking-widest transition-all border-none">
                  Abrir Conta
                </Button>
              </Link>
              <Link to="/platform">
                <span className="text-white font-bold uppercase tracking-widest text-[11px] cursor-pointer hover:text-[#C5A059] transition-colors flex items-center gap-2">
                  Nossa Tecnologia <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Market Bar - Simplified */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/5 py-6">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-wrap justify-between items-center gap-8">
              {[
                { label: "Uptime", value: "99.99%" },
                { label: "Latência", value: "< 1ms" },
                { label: "Suporte", value: "24/7" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</span>
                  <span className="text-white font-bold text-base tracking-tight">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - More compact */}
      <section className="py-24 bg-[#05070A] border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
                SEGURANÇA E <br />
                <span className="text-[#C5A059]">TRANSPARÊNCIA.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                Operamos com foco total na proteção do seu capital, utilizando protocolos de segurança de nível bancário.
              </p>
              <div className="space-y-6">
                {[
                  "Execução em servidores de alta performance",
                  "Segurança AES-256",
                  "Transparência total de resultados"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-[#C5A059]/10 flex items-center justify-center border border-[#C5A059]/20">
                      <CheckCircle2 className="text-[#C5A059]" size={12} />
                    </div>
                    <span className="text-slate-200 font-bold text-xs uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Shield size={32} />, title: "Segurança", desc: "Custódia e criptografia." },
                { icon: <Clock size={32} />, title: "24/7", desc: "Monitoramento constante." },
                { icon: <Award size={32} />, title: "Qualidade", desc: "Infraestrutura premium." },
                { icon: <Zap size={32} />, title: "Velocidade", desc: "Execução instantânea." }
              ].map((card, i) => (
                <div key={i} className="p-8 bg-white/5 border border-white/10 hover:border-[#C5A059]/30 transition-colors">
                  <div className="text-[#C5A059] mb-6">{card.icon}</div>
                  <h3 className="text-lg font-bold mb-2 uppercase tracking-tight">{card.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Automation Section - Simplified */}
      <section className="py-24 bg-[#080B12]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Automação</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
              FOCO NO <span className="text-[#C5A059]">RESULTADO.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Nossa tecnologia gerencia as operações automaticamente, permitindo que você acompanhe tudo em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 border border-white/10 bg-black/20">
            {[
              { icon: <Cpu size={24} />, title: "Algoritmos", desc: "Estratégias desenvolvidas por especialistas para diversos cenários." },
              { icon: <BarChart3 size={24} />, title: "Dashboard", desc: "Visualize cada operação no momento em que acontece.", highlight: true },
              { icon: <Shield size={24} />, title: "Gestão de Risco", desc: "Protocolos automáticos de proteção operando 24h." }
            ].map((item, i) => (
              <div key={i} className={cn(
                "p-12 border-white/10",
                i < 2 ? "lg:border-r" : "",
                item.highlight ? "bg-white/5" : ""
              )}>
                <div className={cn(
                  "w-12 h-12 flex items-center justify-center mb-8",
                  item.highlight ? "bg-[#C5A059] text-white" : "bg-white/10 text-[#C5A059]"
                )}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - More comfortable size */}
      <section className="py-32 bg-[#05070A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#C5A059]/5 blur-[120px]" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-12">
            PRONTO PARA <br />
            <span className="text-[#C5A059]">COMEÇAR?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            <Link to="/register">
              <Button size="lg" className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-12 h-20 text-[13px] font-bold uppercase tracking-widest transition-all border-none">
                Abrir Conta
              </Button>
            </Link>
            <Link to="/contact">
              <span className="text-white font-bold uppercase tracking-widest text-[11px] cursor-pointer hover:text-[#C5A059] transition-colors border-b border-white/20 pb-1">
                Falar com Suporte
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;