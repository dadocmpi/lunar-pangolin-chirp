"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Shield, Globe, Database, Activity, Layers, Users, CheckCircle2, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const Platform = () => {
  const features = [
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
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="relative h-[60vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Institutional Building" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/80 to-[#05070A]" />
        </div>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Tecnologia</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Plataforma <br /><span className="text-[#C5A059]">Proprietária</span></h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Infraestrutura de nível institucional desenhada para execução de baixa latência e transparência total de dados.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20 space-y-20">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
          {features.map((f, i) => (
            <div key={i} className="p-10 bg-[#080B12] flex flex-col items-start hover:bg-white/5 transition-colors">
              <div className="text-[#C5A059] mb-6">{f.icon}</div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">{f.title}</h3>
              <p className="text-slate-500 text-[10px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 uppercase">
              Dashboard <br /><span className="text-[#C5A059]">Intuitiva</span>
            </h2>
            <div className="space-y-4 mb-8">
              {[
                "Curva de patrimônio em tempo real",
                "Métricas de Win Rate e Profit Factor",
                "Monitoramento constante de Drawdown",
                "Exportação de relatórios detalhados"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#C5A059]" size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/register">
              <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-10 h-14 text-[10px] font-bold uppercase tracking-widest transition-all border-none">
                Começar Agora
              </Button>
            </Link>
          </div>
          <div className="relative h-[400px] lg:h-auto overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
              alt="Data Analysis" 
              className="w-full h-full object-cover grayscale opacity-50"
            />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Platform;