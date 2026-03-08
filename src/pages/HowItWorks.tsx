"use client";

import React from 'react';
import { UserPlus, CreditCard, Key, ArrowDownCircle, Mail, Layout, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const HowItWorks = () => {
  const steps = [
    { title: "Registro", desc: "Processo rápido e seguro.", icon: <UserPlus size={24} /> },
    { title: "Plano", desc: "Escolha sua alocação ideal.", icon: <Layout size={24} /> },
    { title: "Pagamento", desc: "Processamento via PayPal.", icon: <CreditCard size={24} /> },
    { title: "Ativação", desc: "Receba seu ID de conta.", icon: <Key size={24} /> },
    { title: "Saques", desc: "Solicitações em EUR.", icon: <ArrowDownCircle size={24} /> },
    { title: "Relatórios", desc: "Resumos semanais por e-mail.", icon: <Mail size={24} /> }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="relative h-[50vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1449156001437-3a1621dfbe28?q=80&w=2070&auto=format&fit=crop" 
            alt="Process" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/80 to-[#05070A]" />
        </div>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Processo</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Como <br /><span className="text-[#C5A059]">Funciona</span></h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Um fluxo simples e transparente em seis etapas para você começar a investir com automação profissional.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {steps.map((step, i) => (
            <div key={i} className="p-12 bg-[#080B12] flex flex-col items-start hover:bg-white/5 transition-colors relative group">
              <span className="absolute top-8 right-8 text-4xl font-black text-white/5 group-hover:text-[#C5A059]/10 transition-colors">0{i+1}</span>
              <div className="text-[#C5A059] mb-8">{step.icon}</div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3">{step.title}</h3>
              <p className="text-slate-500 text-[10px] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 p-16 border border-white/10 bg-[#080B12] text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">Pronto para o primeiro passo?</h2>
          <Link to="/register">
            <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-12 h-16 text-[11px] font-bold uppercase tracking-widest transition-all border-none">
              Criar Minha Conta
            </Button>
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;