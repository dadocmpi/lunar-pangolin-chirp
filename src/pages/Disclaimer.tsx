"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Disclaimer = () => {
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
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Risco</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Aviso <br /><span className="text-[#C5A059]">Financeiro</span></h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20">
        <section className="border border-white/10 bg-[#080B12] p-12 md:p-16">
          <div className="max-w-4xl mx-auto space-y-12 text-slate-400 text-sm leading-relaxed">
            <div className="p-8 border-l-2 border-[#C5A059] bg-white/5">
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Aviso de Risco Importante</h2>
              <p>O investimento em mercados financeiros envolve riscos substanciais e pode resultar na perda total do capital investido. Performance passada não é garantia de resultados futuros.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Sem Aconselhamento</h2>
              <p>O conteúdo deste site e os serviços prestados pela Braxel Markets não constituem aconselhamento financeiro, jurídico ou fiscal. Recomendamos que cada investidor busque orientação profissional independente antes de tomar decisões de investimento.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Limitação de Responsabilidade</h2>
              <p>A Braxel Markets não se responsabiliza por perdas financeiras decorrentes do uso de nossa tecnologia de automação ou de flutuações de mercado.</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Disclaimer;