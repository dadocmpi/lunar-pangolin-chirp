"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, BarChart3, Globe, ArrowRight, CheckCircle2, TrendingUp, Lock, Cpu, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      
      {/* Hero Section - Estilo Hantec/FTMO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Corporate Building" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-12 bg-[#C5A059]" />
              <span className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em]">Líder em Infraestrutura Quantitativa</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]"
            >
              PRECISÃO <br />
              <span className="text-[#C5A059]">INSTITUCIONAL.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-300 mb-12 leading-relaxed max-w-xl border-l-2 border-[#C5A059]/30 pl-6"
            >
              A Braxel Markets fornece tecnologia de execução automatizada de nível empresarial para investidores que exigem transparência, segurança e performance superior.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Link to="/register">
                <Button size="lg" className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-12 h-16 text-sm font-bold uppercase tracking-widest transition-all shadow-2xl shadow-[#C5A059]/20">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/platform">
                <Button size="lg" variant="outline" className="rounded-none px-12 h-16 text-sm font-bold uppercase tracking-widest border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                  Explorar Tecnologia
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Market Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 py-6">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-wrap justify-between items-center gap-8">
              {[
                { label: "Uptime do Sistema", value: "99.99%" },
                { label: "Latência Média", value: "< 1ms" },
                { label: "Ativos Disponíveis", value: "150+" },
                { label: "Suporte Global", value: "24/7" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                  <span className="text-white font-bold tracking-tight">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-8 leading-tight">
                TECNOLOGIA QUE <br />
                <span className="text-[#C5A059]">REDEFINE O MERCADO.</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-10">
                Diferente de plataformas convencionais, a Braxel Markets opera com uma infraestrutura proprietária que elimina o erro humano e otimiza cada milissegundo de execução.
              </p>
              <div className="space-y-6">
                {[
                  "Execução direta em servidores Equinix LD4",
                  "Protocolos de segurança de nível bancário",
                  "Segregação total de capital e transparência de P&L"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
                      <CheckCircle2 className="text-[#C5A059]" size={14} />
                    </div>
                    <span className="text-slate-800 font-bold text-sm uppercase tracking-wide">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-10 bg-slate-50 border border-slate-100">
                <Award className="text-[#C5A059] mb-6" size={40} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Excelência</h3>
                <p className="text-slate-500 text-sm">Premiada como melhor infraestrutura quantitativa 2025.</p>
              </div>
              <div className="p-10 bg-slate-900 text-white">
                <Shield className="text-[#C5A059] mb-6" size={40} />
                <h3 className="text-xl font-bold mb-2">Segurança</h3>
                <p className="text-slate-400 text-sm">Criptografia AES-256 e custódia institucional.</p>
              </div>
              <div className="p-10 bg-slate-900 text-white">
                <Clock className="text-[#C5A059] mb-6" size={40} />
                <h3 className="text-xl font-bold mb-2">24/7</h3>
                <p className="text-slate-400 text-sm">Monitoramento ininterrupto de algoritmos e risco.</p>
              </div>
              <div className="p-10 bg-slate-50 border border-slate-100">
                <Globe className="text-[#C5A059] mb-6" size={40} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Global</h3>
                <p className="text-slate-500 text-sm">Presença nos principais centros financeiros do mundo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Automation Section - O diferencial solicitado */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <span className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Automação de Elite</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8">
              VOCÊ MONITORA, <br />
              <span className="text-[#C5A059]">NÓS EXECUTAMOS.</span>
            </h2>
            <p className="text-slate-600 text-xl leading-relaxed">
              Nossa tecnologia é 100% automatizada. Uma vez configurada, nossos algoritmos gerenciam todas as operações, enquanto você acompanha o desempenho e o P&L em tempo real através de um dashboard intuitivo.
            </p>
          </div>

          <div className="bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="p-12 border-b lg:border-b-0 lg:border-r border-slate-100">
                <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-[#C5A059] mb-8">
                  <Cpu size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tight">Algoritmos Proprietários</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Estratégias desenvolvidas por especialistas quantitativos para operar em qualquer condição de mercado.
                </p>
              </div>
              <div className="p-12 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-900 text-white">
                <div className="w-12 h-12 bg-[#C5A059] flex items-center justify-center text-white mb-8">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">Dashboard em Tempo Real</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Transparência absoluta. Visualize cada entrada, saída e métrica de risco no momento em que acontecem.
                </p>
              </div>
              <div className="p-12">
                <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-[#C5A059] mb-8">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tight">Gestão de Risco Passiva</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Protocolos automáticos de proteção de capital que operam 24 horas por dia, sem necessidade de intervenção.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#0A192F] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#C5A059]/5 blur-[120px]" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-12">
            PRONTO PARA O <br />
            <span className="text-[#C5A059]">PRÓXIMO NÍVEL?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link to="/register">
              <Button size="lg" className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-16 h-20 text-sm font-bold uppercase tracking-widest transition-all">
                Abrir Conta Institucional
              </Button>
            </Link>
            <Link to="/contact">
              <span className="text-white font-bold uppercase tracking-widest text-sm cursor-pointer hover:text-[#C5A059] transition-colors">
                Falar com um Especialista
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