"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MarketTicker = () => {
  const [prices, setPrices] = useState([
    { pair: "EUR/USD", price: 1.0842, change: "+0.12%", up: true },
    { pair: "GBP/USD", price: 1.2634, change: "-0.05%", up: false },
    { pair: "USD/JPY", price: 149.21, change: "+0.24%", up: true },
    { pair: "BTC/USD", price: 64120, change: "+1.42%", up: true },
    { pair: "ETH/USD", price: 3452, change: "-0.82%", up: false },
    { pair: "GOLD", price: 2154.20, change: "+0.45%", up: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(item => {
        const move = (Math.random() - 0.5) * (item.price * 0.0001);
        const newPrice = item.price + move;
        return {
          ...item,
          price: newPrice,
          up: move >= 0
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border-b border-white/5 py-2 overflow-hidden">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-12 items-center"
      >
        {[...prices, ...prices, ...prices].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{item.pair}</span>
            <span className="text-[10px] font-bold text-white">
              {item.price.toLocaleString(undefined, { minimumFractionDigits: item.price > 1000 ? 0 : 4, maximumFractionDigits: item.price > 1000 ? 0 : 4 })}
            </span>
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