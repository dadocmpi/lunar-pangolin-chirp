"use client";

import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const Pricing = () => {
  const plans = [
    {
      name: "Starter 2K",
      price: "€69.99",
      accountSize: "$2,000",
      features: ["Automated Execution", "Risk Management", "Email Support", "Standard Latency"],
    },
    {
      name: "Pro 5K",
      price: "€159.99",
      accountSize: "$5,000",
      features: ["All Starter Features", "Priority Support", "Detailed Logs", "Low Latency"],
      popular: true
    },
    {
      name: "Advanced 10K",
      price: "€319.99",
      accountSize: "$10,000",
      features: ["All Pro Features", "Multi-Account Support", "Weekly Reports", "Ultra-Low Latency"],
    },
    {
      name: "Elite 20K",
      price: "€629.99",
      accountSize: "$20,000",
      features: ["All Advanced Features", "24/7 Dedicated Support", "Custom Risk Profiles", "Direct Market Access"],
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="pt-48 pb-24 border-b border-white/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-6 block">Transparency</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 uppercase leading-none">Capital <br /><span className="text-[#C5A059]">Allocations</span></h1>
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
              Institutional-grade infrastructure with a clear, performance-oriented cost structure. Select the allocation that matches your capital requirements.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {plans.map((plan, i) => (
              <div key={i} className="p-12 bg-[#080B12] flex flex-col h-full relative group hover:bg-[#0a0e17] transition-colors">
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C5A059]" />
                )}
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-10">{plan.name}</h3>
                <div className="mb-10">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-600 text-[10px] uppercase tracking-widest ml-2">/ mo</span>
                </div>
                <div className="p-6 bg-white/5 border border-white/5 mb-10">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Allocation Size</p>
                  <p className="text-2xl font-bold text-[#C5A059]">{plan.accountSize} USD</p>
                </div>
                <ul className="space-y-5 mb-12 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <Check className="text-[#C5A059]" size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className={cn(
                    "w-full rounded-none h-16 text-[10px] font-bold uppercase tracking-widest transition-all",
                    plan.popular ? "bg-[#C5A059] text-white shadow-[0_0_20px_rgba(197,160,89,0.2)]" : "bg-white/5 text-white hover:bg-white/10"
                  )}>
                    Select Allocation
                  </Button>
                </Link>
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