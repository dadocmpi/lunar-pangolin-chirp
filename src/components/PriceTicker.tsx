"use client";

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const PriceTicker = () => {
  const prices = [
    { pair: "BTC/USD", price: "64,231.50", change: "+1.2%", up: true },
    { pair: "ETH/USD", price: "3,452.12", change: "-0.4%", up: false },
    { pair: "EUR/USD", price: "1.0842", change: "+0.1%", up: true },
    { pair: "GBP/USD", price: "1.2634", change: "+0.2%", up: true },
    { pair: "GOLD", price: "2,154.20", change: "-0.1%", up: false },
  ];

  return (
    <div className="w-full bg-[#0A0C10] border-b border-white/5 py-2 overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee items-center gap-12 px-4">
        {[...prices, ...prices].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{item.pair}</span>
            <span className="text-[10px] font-black text-white">{item.price}</span>
            <div className={`flex items-center gap-1 text-[9px] font-bold ${item.up ? 'text-green-500' : 'text-red-500'}`}>
              {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.change}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PriceTicker;