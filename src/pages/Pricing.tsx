"use client";

import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { generateAccountId } from '@/utils/idGenerator';
import { showError, showSuccess } from '@/utils/toast';

const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter 2K",
      price: "€70.00",
      accountSize: "$2,000",
      features: ["Automation", "Account Management", "Email Support", "Controlled Risk"],
    },
    {
      name: "Pro 5K",
      price: "€160.00",
      accountSize: "$5,000",
      features: ["Starter Features", "Priority Support", "Detailed Logs"],
      popular: true
    },
    {
      name: "Advanced 10K",
      price: "€320.00",
      accountSize: "$10,000",
      features: ["Pro Features", "Multi-Account", "Weekly Reports"],
    },
    {
      name: "Elite 20K",
      price: "€630.00",
      accountSize: "$20,000",
      features: ["Advanced Features", "24/7 Support", "Dedicated Manager"],
    }
  ];

  const handleSelectPlan = async (plan: any) => {
    setLoadingPlan(plan.name);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showError("Você precisa estar logado para adquirir um plano.");
        navigate('/login');
        return;
      }

      const accountId = generateAccountId();

      const { error } = await supabase
        .from('services')
        .insert([
          { 
            user_id: user.id, 
            plan_name: plan.name, 
            account_id: accountId,
            status: 'Aguardando Ativação',
            balance: plan.accountSize
          }
        ]);

      if (error) throw error;

      showSuccess(`Plano ${plan.name} selecionado! ID gerado: ${accountId}`);
      navigate('/dashboard');
    } catch (error: any) {
      showError(error.message || "Erro ao processar plano.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <MarketTicker />
      
      <section className="pt-40 pb-20 border-b border-[#333333]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Transparency</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Investment <br /><span className="text-[#C5A059]">Plans</span></h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Clear cost structure with no hidden fees. Choose the ideal allocation for your capital.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {plans.map((plan, i) => (
              <div key={i} className="p-10 bg-[#080B12] flex flex-col h-full relative">
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C5A059]" />
                )}
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">{plan.name}</h3>
                <div className="mb-8">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest ml-2">/ month</span>
                </div>
                <div className="p-5 bg-white/5 border border-white/5 mb-8">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Allocation</p>
                  <p className="text-xl font-bold text-[#C5A059]">{plan.accountSize} USD</p>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <Check className="text-[#C5A059]" size={12} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loadingPlan === plan.name}
                  className={cn(
                    "w-full rounded-none h-14 text-[10px] font-bold uppercase tracking-widest transition-all",
                    plan.popular ? "bg-[#C5A059] text-white" : "bg-white/5 text-white hover:bg-white/10"
                  )}
                >
                  {loadingPlan === plan.name ? <Loader2 className="animate-spin" /> : "Select"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;