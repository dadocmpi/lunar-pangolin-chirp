"use client";

import React from 'react';
import { Check, Shield, Zap, Lock, Globe, Mail, Smartphone } from 'lucide-react';
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
    { name: "Starter 2K", price: "€69.99", accountSize: "$2,000", popular: false },
    { name: "Pro 5K", price: "€159.99", accountSize: "$5,000", popular: true },
    { name: "Advanced 10K", price: "€319.99", accountSize: "$10,000", popular: false },
    { name: "Elite 20K", price: "€629.99", accountSize: "$20,000", popular: false }
  ];

  return (
    <div className="min-h-screen bg-[#050A15] text-white">
      <Navbar />
      
      <section className="pt-48 pb-32 border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <div className="h-[1px] w-12 bg-[#C5A059] mb-8" />
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">PLANOS DE <span className="text-[#C5A059]">INVESTIMENTO.</span></h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
              Preços transparentes e infraestrutura de elite. Escolha o plano que melhor se adapta aos seus objetivos de capital.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={cn(
                  "relative p-12 border transition-all",
                  plan.popular ? 'border-[#C5A059] bg-[#0A192F]' : 'border-white/5 bg-[#0A192F]/50'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 bg-[#C5A059] text-white text-[9px] font-bold px-4 py-1 uppercase tracking-[0.2em]">
                    Mais Popular
                  </div>
                )}
                
                <div className="mb-12">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-500 text-xs uppercase tracking-widest">/mês</span>
                  </div>
                  <div className="p-6 bg-[#050A15] border border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.3em] mb-2">Tamanho da Conta</p>
                    <p className="text-2xl font-bold text-[#C5A059]">{plan.accountSize} USD</p>
                  </div>
                </div>
                
                <ul className="space-y-6 mb-12">
                  {["Operações automatizadas", "Gerenciamento de conta", "Estatísticas em tempo real", "Suporte especializado"].map((feature, j) => (
                    <li key={j} className="flex items-center gap-4 text-[11px] text-slate-400 uppercase tracking-widest font-bold">
                      <Check className="text-[#C5A059] shrink-0" size={14} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/register">
                  <Button className={cn(
                    "w-full rounded-none h-14 text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                    plan.popular ? 'bg-[#C5A059] text-white' : 'bg-white/5 text-white hover:bg-white/10'
                  )}>
                    Abrir Conta
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