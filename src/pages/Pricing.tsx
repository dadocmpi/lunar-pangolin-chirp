"use client";

import React from 'react';
import { Check, HelpCircle, Shield, Zap, Lock, Globe, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Pricing = () => {
  const plans = [
    {
      name: "Starter 2K",
      price: "€69.99",
      accountSize: "$2,000",
      features: ["Operações automatizadas", "Gerenciamento de conta", "Estatísticas básicas", "Suporte por e-mail", "Gestão de risco"],
      popular: false
    },
    {
      name: "Pro 5K",
      price: "€159.99",
      accountSize: "$5,000",
      features: ["Todos os recursos Starter", "Estatísticas avançadas", "Suporte prioritário", "Exportação de histórico"],
      popular: true
    },
    {
      name: "Advanced 10K",
      price: "€319.99",
      accountSize: "$10,000",
      features: ["Todos os recursos Pro", "Gerenciamento multi-contas", "Análise de correlação", "Relatórios semanais"],
      popular: false
    },
    {
      name: "Elite 20K",
      price: "€629.99",
      accountSize: "$20,000",
      features: ["Todos os recursos Advanced", "Estatísticas premium", "Suporte 24/7", "Gerente dedicado"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="pt-48 pb-32 border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl">
            <span className="text-[#C5A059] text-[11px] font-bold uppercase tracking-[0.4em] mb-6 block">Transparência Total</span>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-10">PLANOS DE <br /><span className="text-[#C5A059]">INVESTIMENTO.</span></h1>
            <p className="text-xl text-slate-400 max-w-2xl border-l border-[#C5A059]/30 pl-8">
              Preços institucionais sem taxas ocultas. Escolha o plano que melhor se adapta aos seus objetivos de capital.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {plans.map((plan, i) => (
              <div key={i} className={`p-12 bg-[#080B12] flex flex-col ${plan.popular ? 'relative' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#C5A059]" />
                )}
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">{plan.name}</h3>
                <div className="mb-10">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 text-xs uppercase tracking-widest ml-2">/ mês</span>
                </div>
                <div className="p-6 bg-white/5 border border-white/5 mb-10">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Tamanho da Conta</p>
                  <p className="text-2xl font-bold text-[#C5A059]">{plan.accountSize} USD</p>
                </div>
                <ul className="space-y-5 mb-12 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                      <Check className="text-[#C5A059]" size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className={`w-full rounded-none h-16 text-[11px] font-bold uppercase tracking-widest transition-all ${plan.popular ? 'bg-[#C5A059] text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    Selecionar Plano
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;