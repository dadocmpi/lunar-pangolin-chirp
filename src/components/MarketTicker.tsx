"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MarketTicker = () => {
  const prices = [
    { pair: "EUR/USD", price: "1.0842", change: "+0.12%", up: true },
    { pair: "GBP/USD", price: "1.2634", change: "-0.05%", up: false },
    { pair: "USD/JPY", price: "149.21", change: "+0.24%", up: true },
    { pair: "BTC/USD", price: "64,120", change: "+1.42%", up: true },
    { pair: "ETH/USD", price: "3,452", change: "-0.82%", up: false },
    { pair: "GOLD", price: "2,154.20", change: "+0.45%", up: true },
  ];

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border-b border-white/5 py-2 overflow-hidden">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-12 items-center"
      >
        {[...prices, ...prices].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{item.pair}</span>
            <span className="text-[10px] font-bold text-white">{item.price}</span>
            <div className={`flex items-center gap-1 text-[9px] font-bold ${item.up ? 'text-green-500' : 'text-red-500'}`}>
              {item.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {item.change}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default MarketTicker;