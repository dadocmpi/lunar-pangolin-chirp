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
      features: [
        "Operações automatizadas",
        "Gerenciamento de conta",
        "Estatísticas básicas",
        "Suporte por e-mail",
        "Ferramentas de gerenciamento de risco"
      ],
      popular: false
    },
    {
      name: "Pro 5K",
      price: "€159.99",
      accountSize: "$5,000",
      features: [
        "Todos os recursos do Starter",
        "Estatísticas avançadas",
        "Suporte prioritário",
        "Exportação de histórico de negociações"
      ],
      popular: true
    },
    {
      name: "Advanced 10K",
      price: "€319.99",
      accountSize: "$10,000",
      features: [
        "Todos os recursos do Pro",
        "Gerenciamento multi-contas",
        "Análise de correlação",
        "Relatórios semanais detalhados"
      ],
      popular: false
    },
    {
      name: "Elite 20K",
      price: "€629.99",
      accountSize: "$20,000",
      features: [
        "Todos os recursos do Advanced",
        "Estatísticas premium",
        "Suporte prioritário 24/7",
        "Gerente de conta dedicado",
        "Gerenciamento de risco avançado"
      ],
      popular: false
    }
  ];

  const commonFeatures = [
    { title: "Acesso Seguro", icon: <Lock size={18} /> },
    { title: "Gestão de Conta", icon: <Shield size={18} /> },
    { title: "Saldo em USD", icon: <Globe size={18} /> },
    { title: "Saques em EUR", icon: <Zap size={18} /> },
    { title: "ID Dedicado", icon: <Check size={18} /> },
    { title: "Acesso Móvel", icon: <Smartphone size={18} /> },
    { title: "Criptografia SSL", icon: <Lock size={18} /> },
    { title: "Suporte E-mail", icon: <Mail size={18} /> }
  ];

  const faqs = [
    {
      q: "Posso fazer upgrade ou downgrade do meu plano?",
      a: "Sim, você pode alterar seu plano a qualquer momento através do seu dashboard. A alteração será processada no próximo ciclo de faturamento."
    },
    {
      q: "Existem taxas ocultas?",
      a: "Não. A Braxel Markets preza pela transparência total. O valor da assinatura mensal é o único custo fixo da plataforma."
    },
    {
      q: "Quais métodos de pagamento são aceitos?",
      a: "Aceitamos pagamentos seguros via PayPal, incluindo saldo PayPal, cartões de crédito/débito e Bizum (processado externamente)."
    },
    {
      q: "Existe um compromisso mínimo?",
      a: "Não, nossas assinaturas são mensais e você pode cancelar a qualquer momento sem taxas de rescisão."
    },
    {
      q: "Como funcionam os saldos e saques?",
      a: "Seu saldo de investimento é mantido em USD. Você pode solicitar saques em EUR, que são convertidos e processados de forma automatizada."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Planos de Preços</h1>
            <p className="text-xl text-slate-600">
              Escolha seu plano de investimento com preços transparentes e sem taxas ocultas.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-sky-500 shadow-xl shadow-sky-100' : 'border-slate-200 shadow-sm'} bg-white flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Mais Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Tamanho da Conta</p>
                    <p className="text-lg font-bold text-sky-600">{plan.accountSize} USD</p>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="text-sky-600 shrink-0" size={18} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/register" className="mt-auto">
                  <Button 
                    className={`w-full rounded-full py-6 font-bold ${plan.popular ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                  >
                    Começar Agora
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Todos os Planos Incluem</h2>
            <p className="text-slate-600">Recursos padrão de segurança e gerenciamento para todos os nossos clientes.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {commonFeatures.map((feature, i) => (
              <div key={i} className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 text-center">
                <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center text-sky-600 mb-4">
                  {feature.icon}
                </div>
                <span className="font-bold text-slate-800">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-slate-600">Tudo o que você precisa saber sobre nossos planos e pagamentos.</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-slate-200">
                <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-sky-600">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-24 bg-sky-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Comece Sua Jornada de Investimento Hoje</h2>
          <Link to="/register">
            <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 rounded-full px-12 py-7 text-lg font-bold">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;