"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Shield, Globe, Database, Activity, Layers, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Platform = () => {
  const features = [
    {
      title: "Operações Automatizadas",
      desc: "Algoritmos sofisticados que executam trades com base em estratégias quantitativas comprovadas, eliminando o viés emocional.",
      icon: <Zap className="text-sky-600" size={24} />
    },
    {
      title: "Gerenciamento de Contas",
      desc: "Gerenciamento de portfólio profissional com dimensionamento dinâmico de posições e alocação de risco inteligente.",
      icon: <Users className="text-sky-600" size={24} />
    },
    {
      title: "Estatísticas de Negociação",
      desc: "Análises abrangentes incluindo taxas de vitória, fatores de lucro, análise de drawdown e curvas de patrimônio em tempo real.",
      icon: <BarChart3 className="text-sky-600" size={24} />
    },
    {
      title: "Histórico Completo",
      desc: "Logs detalhados de todas as negociações, pontos de entrada/saída, duração e lucro/prejuízo para total transparência.",
      icon: <Database className="text-sky-600" size={24} />
    },
    {
      title: "Gerenciamento Multi-Contas",
      desc: "Dashboard único para gerenciar múltiplas estratégias ou contas com relatórios consolidados e visão 360°.",
      icon: <Layers className="text-sky-600" size={24} />
    },
    {
      title: "Infraestrutura Operacional",
      desc: "Servidores de nível empresarial com 99.9% de uptime, sistemas redundantes e execução de baixíssima latência.",
      icon: <Activity className="text-sky-600" size={24} />
    },
    {
      title: "Risco e Conformidade",
      desc: "Controles de risco integrados, limites máximos de drawdown e restrições automáticas de tamanho de posição.",
      icon: <Shield className="text-sky-600" size={24} />
    },
    {
      title: "Análise de Portfólio",
      desc: "Ferramentas avançadas de alocação de ativos, análise de correlação e métricas de diversificação profunda.",
      icon: <Globe className="text-sky-600" size={24} />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Plataforma de Investimento de Nível Profissional</h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Tecnologia de nível institucional, ferramentas de negociação automatizadas e análises avançadas de gerenciamento de risco em uma única interface.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">Dashboard Intuitivo e Poderoso</h2>
              <div className="space-y-6">
                {[
                  "Rastreamento da curva de patrimônio em tempo real",
                  "P&L diário, semanal e mensal detalhado",
                  "Métricas de taxa de vitória e fator de lucro",
                  "Análise e monitoramento de drawdown constante",
                  "Histórico completo de negociações com filtros avançados",
                  "Capacidade de exportação de dados para relatórios externos"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-sky-400 shrink-0" size={20} />
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Taxa de Vitória</p>
                    <p className="text-2xl font-bold text-sky-400">72.4%</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Fator de Lucro</p>
                    <p className="text-2xl font-bold text-emerald-400">2.15</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Max Drawdown</p>
                    <p className="text-2xl font-bold text-rose-400">4.2%</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider">Trades Totais</p>
                    <p className="text-2xl font-bold text-white">1,248</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Últimas Operações</p>
                  {[
                    { pair: "EUR/USD", type: "BUY", profit: "+$142.00" },
                    { pair: "GBP/JPY", type: "SELL", profit: "+$89.50" },
                    { pair: "XAU/USD", type: "BUY", profit: "-$34.20" }
                  ].map((trade, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-xl border border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${trade.type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="font-medium">{trade.pair}</span>
                      </div>
                      <span className={trade.profit.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>{trade.profit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Como Nossa Plataforma Funciona</h2>
            <p className="text-slate-600">Quatro passos simples para começar a investir com tecnologia de ponta.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Criar Conta", desc: "Registre-se em minutos com segurança total." },
              { step: "02", title: "Escolher Plano", desc: "Selecione o plano que melhor se adapta aos seus objetivos." },
              { step: "03", title: "Ativar", desc: "Nossos algoritmos começam a trabalhar para você imediatamente." },
              { step: "04", title: "Monitorar", desc: "Acompanhe tudo em tempo real pelo seu dashboard." }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="text-6xl font-black text-slate-100 absolute -top-6 left-1/2 -translate-x-1/2 -z-10">{item.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
            <Link to="/pricing">
              <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-12 py-7 text-lg">
                Ver Preços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Platform;