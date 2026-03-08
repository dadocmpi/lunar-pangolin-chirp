"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="relative h-[40vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop" 
            alt="Los Angeles" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/80 to-[#05070A]" />
        </div>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Legal</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Termos de <br /><span className="text-[#C5A059]">Serviço</span></h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20">
        <section className="border border-white/10 bg-[#080B12] p-12 md:p-16">
          <div className="max-w-4xl mx-auto space-y-12 text-slate-400 text-sm leading-relaxed">
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">1. Aceitação dos Termos</h2>
              <p>Ao acessar e utilizar a plataforma Braxel Markets, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">2. Natureza dos Serviços</h2>
              <p>A Braxel Markets fornece infraestrutura tecnológica para automação de estratégias de investimento. Não somos uma corretora de valores ou consultoria financeira individualizada. O uso da plataforma implica na compreensão dos riscos inerentes ao mercado financeiro.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">3. Responsabilidade do Usuário</h2>
              <p>O usuário é inteiramente responsável pela segurança de suas credenciais de acesso e pelas decisões de alocação de capital dentro dos planos oferecidos pela plataforma.</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;