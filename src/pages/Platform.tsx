"use client";

import React from 'react';
import { Zap, BarChart3, Shield, Globe, Database, Activity, Layers, Users, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Platform = () => {
  return (
    <div className="min-h-screen bg-[#050A15] text-white">
      <Navbar />
      
      <section className="pt-48 pb-32 border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <div className="h-[1px] w-12 bg-[#C5A059] mb-8" />
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">TECNOLOGIA <span className="text-[#C5A059]">QUANTITATIVA.</span></h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
              Infraestrutura de nível institucional projetada para execução de alta frequência e gerenciamento de risco automatizado.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
            {[
              { title: "Operações Automatizadas", icon: <Zap size={24} /> },
              { title: "Gerenciamento de Contas", icon: <Users size={24} /> },
              { title: "Estatísticas de Negociação", icon: <BarChart3 size={24} /> },
              { title: "Histórico Completo", icon: <Database size={24} /> },
              { title: "Gerenciamento Multi-Contas", icon: <Layers size={24} /> },
              { title: "Infraestrutura Operacional", icon: <Activity size={24} /> },
              { title: "Risco e Conformidade", icon: <Shield size={24} /> },
              { title: "Análise de Portfólio", icon: <Globe size={24} /> }
            ].map((feature, i) => (
              <div key={i} className="p-16 bg-[#050A15] hover:bg-[#0A192F] transition-colors group">
                <div className="text-[#C5A059] mb-10 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-[0.2em]">{feature.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">Tecnologia de ponta para execução e monitoramento de ativos globais.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Platform;