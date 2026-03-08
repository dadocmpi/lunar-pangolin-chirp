"use client";

import React from 'react';
import { Shield, Target, Eye, Users, Award, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="relative h-[50vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
            alt="Office" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/80 to-[#05070A]" />
        </div>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Institucional</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Sobre a <br /><span className="text-[#C5A059]">Braxel Markets</span></h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Nossa missão é democratizar o acesso a estratégias de investimento de nível institucional através da tecnologia.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 uppercase">Nossa História</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              A Braxel Markets nasceu da visão de especialistas em finanças quantitativas que perceberam a falta de acesso do investidor comum a ferramentas de automação de alta performance.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Desde nossa fundação em Londres, construímos uma infraestrutura robusta e transparente que permite investir com a mesma precisão dos grandes players institucionais.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10">
            {[
              { label: "Fundação", value: "2026" },
              { label: "Usuários", value: "10k+" },
              { label: "Uptime", value: "99.9%" },
              { label: "Suporte", value: "24/7" }
            ].map((stat, i) => (
              <div key={i} className="p-10 bg-[#080B12] flex flex-col items-center justify-center text-center">
                <p className="text-2xl font-black text-[#C5A059] mb-1">{stat.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {[
            { icon: <Target size={24} />, title: "Missão", desc: "Prover tecnologia de ponta para objetivos financeiros seguros." },
            { icon: <Eye size={24} />, title: "Visão", desc: "Ser a plataforma líder global em investimentos automatizados." },
            { icon: <Shield size={24} />, title: "Valores", desc: "Integridade, transparência e inovação constante." }
          ].map((item, i) => (
            <div key={i} className="p-12 bg-[#080B12] flex flex-col items-center text-center hover:bg-white/5 transition-colors">
              <div className="text-[#C5A059] mb-6">{item.icon}</div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3">{item.title}</h3>
              <p className="text-slate-500 text-[10px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;