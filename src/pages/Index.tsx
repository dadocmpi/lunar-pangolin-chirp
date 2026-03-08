"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, BarChart3, Globe, CheckCircle2, TrendingUp, Lock, Cpu, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#050A15] font-sans text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Corporate Building" 
            className="w-full h-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050A15] via-[#050A15]/90 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-[1px] w-12 bg-[#C5A059]" />
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em]">Infraestrutura Quantitativa Global</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-10 leading-[0.9]"
            >
              PRECISÃO <br />
              <span className="text-[#C5A059]">INSTITUCIONAL.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-400 mb-14 leading-relaxed max-w-xl border-l border-[#C5A059]/30 pl-8"
            >
              A Braxel Markets fornece tecnologia de execução automatizada de nível empresarial. Segurança, transparência e performance em um ecossistema 100% digital.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-8"
            >
              <Link to="/register">
                <Button size="lg" className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-14 h-16 text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-2xl shadow-[#C5A059]/10 border-none">
                  Abrir Conta
                </Button>
              </Link>
              <Link to="/platform">
                <Button size="lg" variant="outline" className="rounded-none px-14 h-16 text-[11px] font-bold uppercase tracking-[0.2em] border-white/10 text-white hover:bg-white/5 backdrop-blur-sm">
                  Tecnologia
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Market Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-2xl border-t border-white/5 py-8">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-wrap justify-between items-center gap-10">
              {[
                { label: "Uptime do Sistema", value: "99.99%" },
                { label: "Latência Média", value: "< 1ms" },
                { label: "Ativos Disponíveis", value: "150+" },
                { label: "Suporte Global", value: "24/7" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</span>
                  <span className="text-white font-bold tracking-tight text-lg">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-[#0A192F] border-y border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-10 leading-tight">
                TECNOLOGIA QUE <br />
                <span className="text-[#C5A059]">REDEFINE O MERCADO.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-12">
                Diferente de plataformas convencionais, a Braxel Markets opera com uma infraestrutura proprietária que elimina o erro humano e otimiza cada milissegundo de execução.
              </p>
              <div className="space-y-8">
                {[
                  "Execução direta em servidores Equinix LD4",
                  "Protocolos de segurança de nível bancário",
                  "Segregação total de capital e transparência de P&L"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5">
                    <div className="w-6 h-6 rounded-full bg-[#C5A059]/10 flex items-center justify-center border border-[#C5A059]/20">
                      <CheckCircle2 className="text-[#C5A059]" size={14} />
                    </div>
                    <span className="text-slate-300 font-bold text-[11px] uppercase tracking-[0.2em]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {[
                { icon: <Award size={40} />, title: "Excelência", desc: "Melhor infraestrutura quantitativa 2025." },
                { icon: <Shield size={40} />, title: "Segurança", desc: "Criptografia AES-256 e custódia institucional." },
                { icon: <Clock size={40} />, title: "24/7", desc: "Monitoramento ininterrupto de algoritmos." },
                { icon: <Globe size={40} />, title: "Global", desc: "Presença nos principais centros financeiros." }
              ].map((card, i) => (
                <div key={i} className="p-12 bg-[#050A15] border border-white/5 hover:border-[#C5A059]/30 transition-all group">
                  <div className="text-[#C5A059] mb-8 group-hover:scale-110 transition-transform">{card.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-tight">{card.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Automation Section */}
      <section className="py-32 bg-[#050A15]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">Automação de Elite</span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-10">
              VOCÊ MONITORA, <br />
              <span className="text-[#C5A059]">NÓS EXECUTAMOS.</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed">
              Nossa tecnologia é 100% automatizada. Uma vez configurada, nossos algoritmos gerenciam todas as operações, enquanto você acompanha o desempenho em tempo real.
            </p>
          </div>

          <div className="bg-[#0A192F] border border-white/5 shadow-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {[
                { icon: <Cpu size={24} />, title: "Algoritmos Proprietários", desc: "Estratégias desenvolvidas por especialistas quantitativos para qualquer condição de mercado.", bg: "bg-transparent" },
                { icon: <BarChart3 size={24} />, title: "Dashboard em Tempo Real", desc: "Transparência absoluta. Visualize cada entrada e saída no momento em que acontecem.", bg: "bg-white/5" },
                { icon: <Zap size={24} />, title: "Gestão de Risco Passiva", desc: "Protocolos automáticos de proteção de capital que operam 24 horas por dia.", bg: "bg-transparent" }
              ].map((item, i) => (
                <div key={i} className={cn("p-16 border-b lg:border-b-0 lg:border-r border-white/5", item.bg)}>
                  <div className="w-12 h-12 bg-[#050A15] flex items-center justify-center text-[#C5A059] mb-10 border border-[#C5A059]/20">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-5 uppercase tracking-tight">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-[#0A192F] relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#C5A059]/5 blur-[150px]" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-8xl font-black text-white tracking-tighter mb-16">
            PRONTO PARA O <br />
            <span className="text-[#C5A059]">PRÓXIMO NÍVEL?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            <Link to="/register">
              <Button size="lg" className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-20 h-20 text-[11px] font-bold uppercase tracking-[0.3em] transition-all border-none">
                Abrir Conta Institucional
              </Button>
            </Link>
            <Link to="/contact">
              <span className="text-white font-bold uppercase tracking-[0.3em] text-[10px] cursor-pointer hover:text-[#C5A059] transition-colors">
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