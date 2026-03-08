"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Pricing = () => {
  const plans = [
    {
      name: "Starter 2K",
      price: "€69.99",
      accountSize: "$2,000",
      features: ["Automação", "Gestão de Conta", "Suporte E-mail", "Risco Controlado"],
    },
    {
      name: "Pro 5K",
      price: "€159.99",
      accountSize: "$5,000",
      features: ["Recursos Starter", "Suporte Prioritário", "Logs Detalhados"],
      popular: true
    },
    {
      name: "Advanced 10K",
      price: "€319.99",
      accountSize: "$10,000",
      features: ["Recursos Pro", "Multi-Contas", "Relatórios Semanais"],
    },
    {
      name: "Elite 20K",
      price: "€629.99",
      accountSize: "$20,000",
      features: ["Recursos Advanced", "Suporte 24/7", "Gerente Dedicado"],
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="pt-40 pb-20 border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Transparência</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Planos de <br /><span className="text-[#C5A059]">Investimento</span></h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Estrutura de custos clara e sem taxas ocultas. Escolha a alocação ideal para o seu capital.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {plans.map((plan, i) => (
              <div key={i} className="p-10 bg-[#080B12] flex flex-col h-full relative">
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C5A059]" />
                )}
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest ml-2">/ mês</span>
                </div>
                <div className="p-5 bg-white/5 border border-white/5 mb-8">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Alocação</p>
                  <p className="text-xl font-bold text-[#C5A059]">{plan.accountSize} USD</p>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <Check className="text-[#C5A059]" size={12} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className={cn(
                    "w-full rounded-none h-14 text-[10px] font-bold uppercase tracking-widest transition-all",
                    plan.popular ? "bg-[#C5A059] text-white" : "bg-white/5 text-white hover:bg-white/10"
                  )}>
                    Selecionar
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