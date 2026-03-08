"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, BarChart3, ArrowRight, CheckCircle2, 
  Layout, Globe, Database, Activity, Layers, Users,
  TrendingUp, ShieldAlert, PieChart, Lock, Eye, Info
} from 'lucide-react';
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
      <section className="relative h-[85vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop" 
            alt="Institutional Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070A] via-[#05070A]/90 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-10 bg-[#C5A059]" />
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em]">Braxel Markets Institutional</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] uppercase"
            >
              Estratégia <br />
              <span className="text-[#C5A059]">Quantitativa.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400 mb-12 leading-relaxed max-w-xl"
            >
              Algoritmos proprietários que combinam estratégias quantitativas comprovadas com gestão de risco avançada para retornos consistentes.
            </motion.p>
            
            <div className="flex flex-wrap items-center gap-8">
              <Link to="/register">
                <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-12 h-16 text-[11px] font-bold uppercase tracking-widest transition-all border-none">
                  Começar Jornada
                </Button>
              </Link>
              <Link to="/pricing" className="text-white font-bold uppercase tracking-widest text-[10px] hover:text-[#C5A059] transition-colors flex items-center gap-2 group">
                Ver Planos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-24 space-y-32">
        
        {/* Section: Investment Strategy */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
            <div className="lg:col-span-3 p-12 bg-[#080B12] border-b border-white/10">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Metodologia</span>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Estratégia de Nível Institucional</h2>
            </div>
            {[
              {
                title: "Momentum Strategy",
                icon: <TrendingUp size={20} />,
                features: ["Análise multi-timeframe", "Detecção de correlação", "Escalonamento dinâmico"],
                desc: "Identificamos movimentos sustentados de preços em múltiplas classes de ativos usando análise estatística."
              },
              {
                title: "Volatility Protection",
                icon: <ShieldAlert size={20} />,
                features: ["Integração VIX real-time", "Limites de drawdown adaptativos", "Protocolos de de-risking"],
                desc: "Modelagem avançada que protege o capital durante turbulências ajustando a exposição dinamicamente."
              },
              {
                title: "Risk Management",
                icon: <PieChart size={20} />,
                features: ["Dimensionamento Kelly", "Testes de estresse Monte Carlo", "Monitoramento diário de VaR"],
                desc: "Controles rigorosos que garantem a preservação do capital através de otimização sistemática de portfólio."
              }
            ].map((item, i) => (
              <div key={i} className="p-12 bg-[#080B12] flex flex-col hover:bg-white/5 transition-colors">
                <div className="text-[#C5A059] mb-8">{item.icon}</div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">{item.title}</h3>
                <p className="text-slate-500 text-[10px] leading-relaxed mb-8">{item.desc}</p>
                <ul className="space-y-3 mt-auto">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="w-1 h-1 bg-[#C5A059]" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 p-6 bg-white/5 border border-white/10">
            <Info size={16} className="text-[#C5A059] shrink-0 mt-0.5" />
            <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
              Importante: Performance passada não garante resultados futuros. Todo investimento carrega risco. A Braxel Markets é uma empresa de tecnologia e não fornece aconselhamento financeiro.
            </p>
          </div>
        </section>

        {/* Section: Platform Features */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-16 bg-[#080B12] flex flex-col justify-center">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Infraestrutura</span>
            <h2 className="text-4xl font-black tracking-tighter mb-8 uppercase">Tudo que você precisa <br /><span className="text-[#C5A059]">para prosperar</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {[
                { title: "Operações Automáticas", icon: <Zap size={16} />, desc: "Sistemas de nível institucional." },
                { title: "Estatísticas Real-Time", icon: <BarChart3 size={16} />, desc: "Analytics e curvas de equity." },
                { title: "Execução Veloz", icon: <Activity size={16} />, desc: "Infraestrutura de baixa latência." },
                { title: "Acesso Global", icon: <Globe size={16} />, desc: "Monitore de qualquer lugar, 24/7." }
              ].map((f, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2 text-[#C5A059]">
                    {f.icon}
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white">{f.title}</h4>
                  </div>
                  <p className="text-slate-500 text-[10px] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-16 bg-[#05070A] flex flex-col justify-center relative">
            <div className="absolute inset-0 bg-[#C5A059]/5 blur-[120px]" />
            <div className="relative z-10 space-y-6">
              <div className="p-8 bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Status do Sistema</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-green-500">Operacional</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Uptime</span>
                    <span>99.98%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5">
                    <div className="h-full bg-[#C5A059] w-[99.9%]" />
                  </div>
                </div>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-4">Segurança de Dados</span>
                <div className="flex items-center gap-4">
                  <Lock className="text-[#C5A059]" size={24} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white">Criptografia Enterprise AES-256</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Why Choose Us / Transparency */}
        <section className="border border-white/10 bg-[#080B12]">
          <div className="p-16 border-b border-white/10 text-center">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Diferencial</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Confiança e Transparência</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {[
              { 
                title: "Sem Taxas Ocultas", 
                icon: <CheckCircle2 size={20} />, 
                desc: "Preços claros e diretos, sem surpresas. O que você vê é o que você paga." 
              },
              { 
                title: "Transparência Total", 
                icon: <Eye size={20} />, 
                desc: "Acesse relatórios detalhados, histórico de trades e métricas a qualquer momento." 
              },
              { 
                title: "Infraestrutura Segura", 
                icon: <Shield size={20} />, 
                desc: "Segurança de nível empresarial protegendo seus dados e garantindo confiabilidade." 
              }
            ].map((item, i) => (
              <div key={i} className="p-12 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
                <div className="text-[#C5A059] mb-8">{item.icon}</div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest mb-4">{item.title}</h3>
                <p className="text-slate-500 text-[10px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative p-20 md:p-32 border border-white/10 bg-[#080B12] text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/5 blur-[120px] -z-10" />
          <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block">Pronto para começar?</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 uppercase">
            Inicie sua jornada de <br /><span className="text-[#C5A059]">investimento hoje.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link to="/register">
              <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-16 h-20 text-[12px] font-bold uppercase tracking-widest transition-all border-none">
                Criar Minha Conta
              </Button>
            </Link>
            <Link to="/pricing" className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors border-b border-white/10 pb-1">
              Ver Planos & Preços
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Index;