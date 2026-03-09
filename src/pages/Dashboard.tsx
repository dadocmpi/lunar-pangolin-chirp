"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LayoutDashboard, CreditCard, History, User, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  // Mock de dados - No futuro isso virá do banco de dados
  const [myServices] = useState([
    {
      id: "2024058832",
      plan: "Pro 5K",
      status: "Ativo",
      date: "12/05/2026",
      balance: "$5,240.00"
    },
    {
      id: "2024061129",
      plan: "Starter 2K",
      status: "Aguardando Ativação",
      date: "15/05/2026",
      balance: "$2,000.00"
    }
  ]);

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-8 pt-32 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar do Dashboard */}
          <aside className="w-full md:w-64 space-y-2">
            <div className="p-6 bg-[#080B12] border border-white/10 mb-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Usuário</p>
              <p className="text-sm font-bold">Investidor Braxel</p>
            </div>
            
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#C5A059] text-black text-[10px] font-bold uppercase tracking-widest">
                <LayoutDashboard size={16} /> Meus Serviços
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors">
                <CreditCard size={16} /> Financeiro
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors">
                <User size={16} /> Perfil
              </button>
            </nav>
          </aside>

          {/* Conteúdo Principal */}
          <main className="flex-1 space-y-8">
            <header>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Meus <span className="text-[#C5A059]">Investimentos</span></h1>
              <p className="text-slate-500 text-xs mt-2">Gerencie suas contas e acompanhe seus IDs de operação.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
              {myServices.map((service) => (
                <div key={service.id} className="bg-[#080B12] border border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-[#C5A059]">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{service.plan}</h3>
                        <span className={`text-[8px] px-2 py-0.5 font-bold uppercase tracking-widest ${service.status === 'Ativo' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                          {service.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">
                        ID DA CONTA: <span className="text-white font-bold">{service.id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Saldo Atual</p>
                      <p className="text-xl font-black text-[#C5A059]">{service.balance}</p>
                    </div>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest h-10 rounded-none">
                      Detalhes <ExternalLink size={12} className="ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 border border-dashed border-white/10 text-center">
              <p className="text-slate-500 text-xs mb-4">Precisa de mais capital operando?</p>
              <Button className="bg-white text-black hover:bg-slate-200 text-[10px] font-bold uppercase tracking-widest h-12 px-8 rounded-none">
                Adquirir Novo Plano
              </Button>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;