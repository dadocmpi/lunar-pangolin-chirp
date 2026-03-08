"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, BarChart3, ArrowRight, CheckCircle2, 
  Layout, Globe, Database, Activity, Layers, Users 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const Index = () => {
  const fullTechGrid = [
    { title: "Automação", desc: "Algoritmos quantitativos de alta performance.", icon: <Zap size={20} /> },
    { title: "Gestão", desc: "Controle dinâmico de posições e risco.", icon: <Users size={20} /> },
    { title: "Métricas", desc: "Análise profunda de P&L e drawdown.", icon: <BarChart3 size={20} /> },
    { title: "Logs", desc: "Histórico completo e transparente.", icon: <Database size={20} /> },
    { title: "Multi-Contas", desc: "Gestão centralizada de estratégias.", icon: <Layers size={20} /> },
    { title: "Uptime", desc: "Infraestrutura redundante 99.9%.", icon: <Activity size={20} /> },
    { title: "Compliance", desc: "Protocolos de segurança institucional.", icon: <Shield size={20} /> },
    { title: "Análise", desc: "Métricas de correlação avançadas.", icon: <Globe size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] font-sans text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop" 
            alt="Los Angeles Skyline" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070A] via-[#05070A]/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-10 bg-[#C5A059]" />
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em]">Braxel Markets Institutional</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]"
            >
              INFRAESTRUTURA <br />
              <span className="text-[#C5A059]">DE ALTA PERFORMANCE.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base text-slate-400 mb-10 leading-relaxed max-w-lg"
            >
              Execução automatizada com tecnologia proprietária. Foco em consistência e segurança institucional para o mercado moderno.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-6"
            >
              <Link to="/register">
                <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-10 h-14 text-[11px] font-bold uppercase tracking-widest transition-all border-none">
                  Abrir Conta
                </Button>
              </Link>
              <Link to="/pricing" className="text-white font-bold uppercase tracking-widest text-[10px] hover:text-[#C5A059] transition-colors flex items-center gap-2">
                Ver Planos <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20 space-y-20">
        
        {/* Full Technology Grid - Moved from Platform page */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
          {fullTechGrid.map((f, i) => (
            <div key={i} className="p-10 bg-[#080B12] flex flex-col items-start hover:bg-white/5 transition-colors group">
              <div className="text-[#C5A059] mb-6 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">{f.title}</h3>
              <p className="text-slate-500 text-[10px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Dashboard Technology Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-white/5 flex items-center justify-center text-[#C5A059] border border-white/10">
                <Layout size={16} />
              </div>
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.3em]">Interface Proprietária</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 uppercase">
              Dashboard <br /><span className="text-[#C5A059]">Tecnológica</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              Nossa dashboard não é apenas visual; é um terminal de dados em tempo real. Desenvolvida para oferecer transparência total sobre cada algoritmo em execução.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {[
                { label: "Métricas", val: "Win Rate / Drawdown" },
                { label: "Logs", val: "Execução em Milissegundos" },
                { label: "Gestão", val: "Alocação Dinâmica" },
                { label: "Relatórios", val: "Exportação Institucional" }
              ].map((item, i) => (
                <div key={i} className="border-l border-[#C5A059]/30 pl-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">{item.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-12 md:p-16 bg-[#05070A] flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[#C5A059]/5 blur-[120px]" />
            <div className="relative z-10 space-y-8">
              <div className="p-8 bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Performance Semanal</p>
                    <p className="text-2xl font-black text-[#C5A059]">+4.82%</p>
                  </div>
                  <BarChart3 className="text-[#C5A059]" size={24} />
                </div>
                <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "75%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-[#C5A059]" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 border border-white/10">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Uptime</p>
                  <p className="text-lg font-bold text-white">99.98%</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1">Latência</p>
                  <p className="text-lg font-bold text-white">1.2ms</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative p-16 md:p-24 border border-white/10 bg-[#080B12] text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/5 blur-[100px] -z-10" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 uppercase">
            Pronto para o <br /><span className="text-[#C5A059]">Próximo Nível?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link to="/register">
              <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-12 h-16 text-[11px] font-bold uppercase tracking-widest transition-all border-none">
                Começar Agora
              </Button>
            </Link>
            <Link to="/contact" className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors border-b border-white/10 pb-1">
              Suporte Especializado
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Index;