"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Shield, Zap, BarChart3, Globe, ArrowRight, CheckCircle2, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Index = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-100/50 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-700 text-sm font-semibold mb-8 border border-sky-100"
            >
              <Zap size={16} /> RÁPIDO, SIMPLES, SEGURO & AUTOMATIZADO
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]"
            >
              Invista de Forma Mais Inteligente com <span className="text-sky-600">Braxel Markets</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              Acesse infraestrutura de investimento de nível institucional com nossa plataforma automatizada e transparente. Projetada para maximizar retornos e minimizar riscos.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register">
                <Button size="lg" className="bg-slate-900 hover:bg-sky-600 text-white rounded-full px-10 py-7 text-lg shadow-xl shadow-slate-200">
                  Começar Agora
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="rounded-full px-10 py-7 text-lg border-slate-200 hover:bg-slate-50">
                  Como Funciona
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Nossa Abordagem</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Estratégia de investimento de nível institucional baseada em algoritmos proprietários e gerenciamento de risco avançado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Estratégia de Momentum",
                icon: <TrendingUp className="text-sky-600" size={32} />,
                desc: "Análise multi-timeframe, detecção de correlação entre ativos e dimensionamento dinâmico de posições para capturar tendências de mercado."
              },
              {
                title: "Proteção de Volatilidade",
                icon: <Shield className="text-sky-600" size={32} />,
                desc: "Modelagem avançada de volatilidade, integração VIX em tempo real e protocolos de desrisco automatizados para proteger seu capital."
              },
              {
                title: "Risco Quantitativo",
                icon: <BarChart3 className="text-sky-600" size={32} />,
                desc: "Dimensionamento de posição Kelly Criterion, testes de estresse Monte Carlo e monitoramento diário de Value-at-Risk."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 p-6 bg-amber-50 border border-amber-100 rounded-2xl text-center">
            <p className="text-amber-800 text-sm font-medium">
              <span className="font-bold">Aviso Importante:</span> O desempenho passado não garante resultados futuros. Todos os investimentos envolvem risco. A Braxel Markets é uma empresa de tecnologia e não fornece aconselhamento financeiro.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Recursos da Plataforma</h2>
              <p className="text-slate-600 mb-10 text-lg">
                Nossa tecnologia foi construída para oferecer a você as mesmas ferramentas utilizadas pelos grandes fundos de investimento.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Operações Automatizadas", icon: <Zap size={20} /> },
                  { title: "Estatísticas em Tempo Real", icon: <BarChart3 size={20} /> },
                  { title: "Gerenciamento de Risco", icon: <Shield size={20} /> },
                  { title: "Execução Ultra-Rápida", icon: <Zap size={20} /> },
                  { title: "Plataforma Segura", icon: <Lock size={20} /> },
                  { title: "Acesso Global 24/7", icon: <Globe size={20} /> }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-sky-600">{feature.icon}</div>
                    <span className="font-semibold text-slate-800">{feature.title}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-sky-100 rounded-3xl blur-2xl -z-10 opacity-50" />
              <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs">braxel-dashboard.v1</div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">Saldo Total</p>
                      <p className="text-white text-xl font-bold">$12,450.00</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">Retorno Mensal</p>
                      <p className="text-emerald-400 text-xl font-bold">+8.4%</p>
                    </div>
                  </div>
                  
                  <div className="h-32 bg-slate-800/30 rounded-xl border border-slate-700 flex items-end p-4 gap-2">
                    {[40, 60, 45, 70, 85, 65, 90, 75, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-sky-500/40 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Taxa de Vitória</span>
                      <span className="text-white font-medium">68%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 w-[68%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-sky-600/10 blur-[120px] -z-0" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Por Que Nos Escolher</h2>
            <p className="text-slate-400 text-lg">
              Construímos a Braxel Markets sobre três pilares fundamentais que nos diferenciam no mercado.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-800">
                <Shield className="text-sky-400" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">Transparência Total</h3>
              <p className="text-slate-400 leading-relaxed">
                Sem taxas ocultas ou letras miúdas. Você tem visibilidade completa de todas as operações e custos.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-800">
                <Lock className="text-sky-400" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">Infraestrutura Segura</h3>
              <p className="text-slate-400 leading-relaxed">
                Segurança de nível bancário com criptografia SSL e sistemas redundantes para garantir 99.9% de uptime.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-800">
                <Zap className="text-sky-400" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-4">Execução Superior</h3>
              <p className="text-slate-400 leading-relaxed">
                Nossos algoritmos executam ordens em milissegundos, aproveitando as melhores oportunidades do mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-sky-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-8">Pronto para Começar Sua Jornada de Investimento?</h2>
              <p className="text-sky-100 text-xl mb-12 opacity-90">
                Junte-se a milhares de investidores que já estão utilizando a tecnologia da Braxel Markets para potencializar seus resultados.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/pricing">
                  <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 rounded-full px-10 py-7 text-lg font-bold">
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