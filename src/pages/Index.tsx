"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Zap, BarChart3, Globe, ArrowRight, CheckCircle2, TrendingUp, Lock, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section com Imagem de NY */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1496871455396-14e56815f1f4?q=80&w=2070&auto=format&fit=crop" 
            alt="New York City Skyscrapers" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 text-sky-300 text-sm font-semibold mb-8 border border-sky-500/20 backdrop-blur-md"
            >
              <Zap size={16} className="text-amber-400" /> RÁPIDO, SIMPLES, SEGURO & AUTOMATIZADO
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]"
            >
              Invista com a Precisão de <span className="text-amber-400">Wall Street</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl text-slate-200 mb-12 leading-relaxed max-w-2xl"
            >
              Infraestrutura de nível institucional com tecnologia automatizada. Maximize seus retornos enquanto nossa inteligência cuida de tudo para você.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link to="/register">
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full px-10 py-7 text-lg font-bold shadow-xl shadow-amber-500/20 border-none">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="rounded-full px-10 py-7 text-lg border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  Como Funciona
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Approach Section - Cores Claras e Dourado */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Nossa Abordagem Institucional</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6 rounded-full" />
            <p className="text-slate-600 max-w-2xl mx-auto">
              Estratégias quantitativas baseadas em algoritmos proprietários e gerenciamento de risco de elite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Estratégia de Momentum",
                icon: <TrendingUp className="text-amber-600" size={32} />,
                desc: "Análise multi-timeframe e detecção de correlação para capturar as melhores tendências globais."
              },
              {
                title: "Proteção de Volatilidade",
                icon: <Shield className="text-amber-600" size={32} />,
                desc: "Modelagem avançada e protocolos de desrisco automatizados para proteger seu capital 24/7."
              },
              {
                title: "Risco Quantitativo",
                icon: <BarChart3 className="text-amber-600" size={32} />,
                desc: "Dimensionamento de posição Kelly Criterion e monitoramento diário de Value-at-Risk."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Com a nova seção de Automação */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Por Que Escolher a Braxel</h2>
            <p className="text-slate-600 text-lg">
              Excelência tecnológica e transparência absoluta em cada operação.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-amber-100">
                <Cpu className="text-amber-500" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">100% Automático</h3>
              <p className="text-slate-600 leading-relaxed">
                Nossa tecnologia executa tudo por você. Sua única tarefa é acompanhar as transações e o P&L em tempo real pelo dashboard.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-amber-100">
                <Lock className="text-amber-500" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">Segurança Bancária</h3>
              <p className="text-slate-600 leading-relaxed">
                Criptografia de ponta e sistemas redundantes para garantir que seu capital e dados estejam sempre protegidos.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-amber-100">
                <Globe className="text-amber-500" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900">Transparência Total</h3>
              <p className="text-slate-600 leading-relaxed">
                Sem taxas ocultas. Você tem visibilidade completa de cada trade e métrica de performance da sua conta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Dourado e Azul */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden border border-amber-500/20">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-500/5 blur-[120px]" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-8">Pronto para o Próximo Nível?</h2>
              <p className="text-slate-300 text-xl mb-12 opacity-90">
                Junte-se à elite dos investidores e deixe a tecnologia da Braxel Markets trabalhar para o seu futuro.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/pricing">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full px-10 py-7 text-lg font-bold border-none">
                    Ver Planos e Preços
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-10 py-7 text-lg">
                    Falar com Consultor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;