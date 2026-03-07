"use client";

import React from 'react';
import { UserPlus, CreditCard, Key, ArrowDownCircle, Mail, Layout, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const HowItWorks = () => {
  const steps = [
    {
      title: "Registrar Sua Conta",
      desc: "Processo de registro rápido com informações mínimas e segurança total de dados.",
      icon: <UserPlus size={32} />
    },
    {
      title: "Selecionar um Plano",
      desc: "Escolha o plano ideal com base nos seus objetivos de investimento e alocação de saldo.",
      icon: <Layout size={32} />
    },
    {
      title: "Completar Pagamento",
      desc: "Pagamento seguro via PayPal (saldo, crédito, débito ou Bizum), processado externamente.",
      icon: <CreditCard size={32} />
    },
    {
      title: "Receber Seu ID",
      desc: "Ativação imediata do plano e recebimento de um ID de conta único para rastreamento.",
      icon: <Key size={32} />
    },
    {
      title: "Solicitar Saques",
      desc: "Saques em EUR do seu saldo em USD, com limites flexíveis e processamento verificado.",
      icon: <ArrowDownCircle size={32} />
    },
    {
      title: "Resumos Semanais",
      desc: "Receba relatórios detalhados por e-mail com saldo, ganhos, perdas e valores disponíveis.",
      icon: <Mail size={32} />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Como a Braxel Markets Funciona</h1>
            <p className="text-xl text-slate-600">
              Um processo simples e transparente em seis passos para você começar a investir com automação profissional.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-xl z-10 shadow-lg">
                  {i + 1}
                </div>
                <div className="p-10 rounded-3xl border border-slate-100 bg-white shadow-sm group-hover:shadow-xl transition-all duration-300 h-full">
                  <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mb-8 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">O Que Esperar Depois de Começar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-sky-400">Gerenciamento</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Acesso total à área do cliente com detalhes do plano ativo, ID de conta e status da assinatura em tempo real.
                </p>
              </div>
              
              <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-sky-400">Rastreamento</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Verificação de saldo em USD a qualquer momento, com estimativas automáticas de conversão para EUR.
                </p>
              </div>
              
              <div className="p-8 bg-slate-800 rounded-3xl border border-slate-700">
                <h3 className="text-xl font-bold mb-4 text-sky-400">Saques</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Solicitações automatizadas e verificadas dentro do horário comercial para garantir segurança e agilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Pronto para Começar?</h2>
          <Link to="/register">
            <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-12 py-7 text-lg font-bold">
              Criar Minha Conta
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;