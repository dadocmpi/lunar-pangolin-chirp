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
    <div className="min-h-screen bg-[#05070A] font-sans text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Corporate Building" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/80 via-[#05070A]/90 to-[#05070A]" />
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-[1px] w-12 bg-[#C5A059]" />
              <span className="text-[#C5A059] text-[11px] font-bold uppercase tracking-[0.4em]">Infraestrutura Quantitativa de Elite</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.85]"
            >
              PRECISÃO <br />
              <span className="text-[#C5A059]">INSTITUCIONAL.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-400 mb-14 leading-relaxed max-w-2xl border-l border-[#C5A059]/30 pl-8"
            >
              A Braxel Markets fornece tecnologia de execução automatizada de nível empresarial. Nossa infraestrutura proprietária elimina o erro humano e otimiza cada milissegundo de execução.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-8"
            >
              <Link to="/register">
                <Button size="lg" className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-16 h-20 text-[13px] font-bold uppercase tracking-widest transition-all shadow-2xl shadow-[#C5A059]/20 border-none">
                  Abrir Conta Agora
                </Button>
              </Link>
              <Link to="/platform">
                <span className="text-white font-bold uppercase tracking-widest text-[12px] cursor-pointer hover:text-[#C5A059] transition-colors flex items-center gap-2">
                  Explorar Tecnologia <ArrowRight size={16} />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Market Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-2xl border-t border-white/5 py-8">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-wrap justify-between items-center gap-12">
              {[
                { label: "Uptime do Sistema", value: "99.99%" },
                { label: "Latência Média", value: "< 1ms" },
                { label: "Ativos Disponíveis", value: "150+" },
                { label: "Suporte Global", value: "24/7" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">{stat.label}</span>
                  <span className="text-white font-bold text-lg tracking-tight">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-[#05070A] border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 leading-tight">
                TECNOLOGIA QUE <br />
                <span className="text-[#C5A059]">REDEFINE O MERCADO.</span>
              </h2>
              <p className="text-slate-400 text-xl leading-relaxed mb-12">
                Operamos com uma infraestrutura proprietária que garante transparência absoluta e segurança de nível bancário para cada investidor.
              </p>
              <div className="space-y-8">
                {[
                  "Execução direta em servidores Equinix LD4",
                  "Protocolos de segurança AES-256",
                  "Segregação total de capital e transparência de P&L"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6">
                    <div className="w-6 h-6 rounded-full bg-[#C5A059]/10 flex items-center justify-center border border-[#C5A059]/20">
                      <CheckCircle2 className="text-[#C5A059]" size={14} />
                    </div>
                    <span className="text-slate-200 font-bold text-sm uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {[
                { icon: <Award size={40} />, title: "Excelência", desc: "Melhor infraestrutura quantitativa 2025." },
                { icon: <Shield size={40} />, title: "Segurança", desc: "Custódia institucional e criptografia." },
                { icon: <Clock size={40} />, title: "24/7", desc: "Monitoramento ininterrupto de risco." },
                { icon: <Globe size={40} />, title: "Global", desc: "Presença nos principais centros financeiros." }
              ].map((card, i) => (
                <div key={i} className="p-12 bg-white/5 border border-white/10 hover:border-[#C5A059]/30 transition-colors">
                  <div className="text-[#C5A059] mb-8">{card.icon}</div>
                  <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">{card.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Automation Section */}
      <section className="py-40 bg-[#080B12]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <span className="text-[#C5A059] text-[11px] font-bold uppercase tracking-[0.5em] mb-6 block">Automação de Elite</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10">
              VOCÊ MONITORA, <br />
              <span className="text-[#C5A059]">NÓS EXECUTAMOS.</span>
            </h2>
            <p className="text-slate-400 text-xl leading-relaxed">
              Nossa tecnologia é 100% automatizada. Uma vez configurada, nossos algoritmos gerenciam todas as operações, enquanto você acompanha o desempenho em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 border border-white/10 bg-black/20">
            {[
              { icon: <Cpu size={28} />, title: "Algoritmos Proprietários", desc: "Estratégias desenvolvidas por especialistas quantitativos para qualquer condição de mercado." },
              { icon: <BarChart3 size={28} />, title: "Dashboard em Tempo Real", desc: "Transparência absoluta. Visualize cada entrada e saída no momento em que acontecem.", highlight: true },
              { icon: <Zap size={28} />, title: "Gestão de Risco Passiva", desc: "Protocolos automáticos de proteção de capital que operam 24 horas por dia." }
            ].map((item, i) => (
              <div key={i} className={cn(
                "p-16 border-white/10",
                i < 2 ? "lg:border-r" : "",
                item.highlight ? "bg-white/5" : ""
              )}>
                <div className={cn(
                  "w-14 h-14 flex items-center justify-center mb-10",
                  item.highlight ? "bg-[#C5A059] text-white" : "bg-white/10 text-[#C5A059]"
                )}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-6 uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-[#05070A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#C5A059]/5 blur-[150px]" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-16">
            PRONTO PARA O <br />
            <span className="text-[#C5A059]">PRÓXIMO NÍVEL?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12">
            <Link to="/register">
              <Button size="lg" className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-20 h-24 text-[14px] font-bold uppercase tracking-widest transition-all border-none">
                Abrir Conta Institucional
              </Button>
            </Link>
            <Link to="/contact">
              <span className="text-white font-bold uppercase tracking-widest text-[12px] cursor-pointer hover:text-[#C5A059] transition-colors border-b border-white/20 pb-1">
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