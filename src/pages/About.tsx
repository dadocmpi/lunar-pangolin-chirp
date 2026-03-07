"use client";

import React from 'react';
import { Shield, Target, Eye, Users, Award, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Sobre a Braxel Markets</h1>
            <p className="text-xl text-slate-600">
              Nossa missão é democratizar o acesso a estratégias de investimento de nível institucional através da tecnologia.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Nossa História</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                A Braxel Markets nasceu da visão de um grupo de especialistas em finanças quantitativas e engenheiros de software que perceberam uma lacuna no mercado: a falta de acesso do investidor comum a ferramentas de automação de alta performance.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Desde nossa fundação em Londres, temos trabalhado incansavelmente para construir uma infraestrutura robusta, segura e transparente que permite a qualquer pessoa investir com a mesma precisão dos grandes players institucionais.
              </p>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-6">
              <div className="p-8 bg-sky-50 rounded-3xl border border-sky-100 text-center">
                <p className="text-4xl font-black text-sky-600 mb-2">2026</p>
                <p className="text-slate-600 font-bold">Fundação</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                <p className="text-4xl font-black text-slate-900 mb-2">10k+</p>
                <p className="text-slate-600 font-bold">Usuários</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                <p className="text-4xl font-black text-slate-900 mb-2">99.9%</p>
                <p className="text-slate-600 font-bold">Uptime</p>
              </div>
              <div className="p-8 bg-sky-50 rounded-3xl border border-sky-100 text-center">
                <p className="text-4xl font-black text-sky-600 mb-2">24/7</p>
                <p className="text-slate-600 font-bold">Monitoramento</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-10 rounded-3xl border border-slate-100 bg-white shadow-sm text-center">
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mx-auto mb-8">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Missão</h3>
              <p className="text-slate-600 leading-relaxed">
                Prover tecnologia de ponta e estratégias automatizadas para que investidores alcancem seus objetivos financeiros com segurança e eficiência.
              </p>
            </div>
            
            <div className="p-10 rounded-3xl border border-slate-100 bg-white shadow-sm text-center">
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mx-auto mb-8">
                <Eye size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Visão</h3>
              <p className="text-slate-600 leading-relaxed">
                Ser a plataforma líder global em investimentos automatizados, reconhecida pela inovação tecnológica e transparência absoluta.
              </p>
            </div>
            
            <div className="p-10 rounded-3xl border border-slate-100 bg-white shadow-sm text-center">
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mx-auto mb-8">
                <Shield size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Valores</h3>
              <p className="text-slate-600 leading-relaxed">
                Integridade, transparência, inovação constante e foco total na segurança do capital dos nossos clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;