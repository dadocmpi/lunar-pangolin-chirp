"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, BarChart3, ArrowRight, CheckCircle2, Cpu, Award, Clock, Star, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const Index = () => {
  return (
    <div className="min-h-screen bg-[#05070A] font-sans text-white">
      <Navbar />
      
      {/* Hero Section - Institutional LA Background */}
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
              <Link to="/platform" className="text-white font-bold uppercase tracking-widest text-[10px] hover:text-[#C5A059] transition-colors flex items-center gap-2">
                Tecnologia <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modular Sections - Framed Layout */}
      <div className="container mx-auto px-4 md:px-8 py-20 space-y-20">
        
        {/* Section 1: Trust & Security */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 uppercase">
              Segurança <br /><span className="text-[#C5A059]">Institucional</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md">
              Protocolos de criptografia avançada e servidores de baixa latência garantem a integridade de cada operação realizada em nossa plataforma.
            </p>
            <div className="space-y-4">
              {["Servidores Equinix", "Segurança AES-256", "Transparência Total"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#C5A059]" size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10">
            {[
              { icon: <Shield size={24} />, title: "Custódia", desc: "Proteção de capital." },
              { icon: <Clock size={24} />, title: "24/7", desc: "Monitoramento." },
              { icon: <Award size={24} />, title: "Elite", desc: "Padrão global." },
              { icon: <Zap size={24} />, title: "Veloz", desc: "Execução real." }
            ].map((card, i) => (
              <div key={i} className="p-10 bg-[#080B12] flex flex-col items-center text-center justify-center hover:bg-white/5 transition-colors">
                <div className="text-[#C5A059] mb-4">{card.icon}</div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2">{card.title}</h3>
                <p className="text-slate-500 text-[10px] leading-tight">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Dashboard Preview - Real Photo Style */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="relative h-[400px] lg:h-auto overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=2070&auto=format&fit=crop" 
              alt="Dashboard Interface" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-[#C5A059]/10 mix-blend-overlay" />
          </div>
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <div className="w-10 h-10 bg-white/5 flex items-center justify-center text-[#C5A059] mb-6 border border-white/10">
              <Layout size={20} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 uppercase">
              Dashboard <br /><span className="text-[#C5A059]">Proprietária</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Acompanhe sua performance em tempo real com métricas institucionais. Nossa interface foi desenhada para clareza absoluta e controle total do seu capital.
            </p>
            <Link to="/platform">
              <Button variant="outline" className="rounded-none border-white/10 text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest h-12 px-8">
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </section>

        {/* Section 3: Testimonials / Comments */}
        <section className="border border-white/10 bg-[#080B12] overflow-hidden">
          <div className="p-12 border-b border-white/10 text-center">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Feedback</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter">O que dizem nossos clientes</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {[
              { 
                name: "Ricardo M.", 
                role: "Investidor Profissional", 
                comment: "A consistência da execução automatizada da Braxel é impressionante. Finalmente uma plataforma que entrega o que promete." 
              },
              { 
                name: "Sofia G.", 
                role: "Gestora de Patrimônio", 
                comment: "O suporte institucional e a transparência da dashboard facilitam muito o acompanhamento dos resultados semanais.",
                highlight: true 
              },
              { 
                name: "Carlos T.", 
                role: "Trader Quantitativo", 
                comment: "Infraestrutura de baixa latência real. A diferença na execução é notável comparada a outras soluções de varejo." 
              }
            ].map((item, i) => (
              <div key={i} className={cn(
                "p-12 flex flex-col items-start",
                item.highlight ? "bg-white/5" : ""
              )}>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-[#C5A059] text-[#C5A059]" />)}
                </div>
                <p className="text-slate-400 text-xs italic leading-relaxed mb-8">"{item.comment}"</p>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white">{item.name}</p>
                  <p className="text-[9px] uppercase tracking-widest text-[#C5A059]">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Final CTA */}
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