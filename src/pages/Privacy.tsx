"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Privacy = () => {
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
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Privacidade</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Política de <br /><span className="text-[#C5A059]">Privacidade</span></h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20">
        <section className="border border-white/10 bg-[#080B12] p-12 md:p-16">
          <div className="max-w-4xl mx-auto space-y-12 text-slate-400 text-sm leading-relaxed">
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Coleta de Dados</h2>
              <p>Coletamos apenas as informações necessárias para a prestação de nossos serviços, incluindo nome, e-mail e dados de transação. Seus dados são protegidos por criptografia AES-256.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Uso de Informações</h2>
              <p>As informações coletadas são utilizadas exclusivamente para gerenciar sua conta, processar pagamentos e enviar relatórios de performance semanais.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Segurança</h2>
              <p>Implementamos medidas de segurança rigorosas para proteger contra acesso não autorizado, alteração ou destruição de seus dados pessoais.</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;