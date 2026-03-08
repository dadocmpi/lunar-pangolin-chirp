"use client";

import React, { useState, useEffect } from 'react';

const MarketTicker = () => {
  const [prices, setPrices] = useState([
    { pair: "GBP/USD", value: 1.2632, change: -0.09, up: false },
    { pair: "USD/JPY", value: 149.1965, change: 0.24, up: true },
    { pair: "BTC/USD", value: 64145, change: -1.14, up: false },
    { pair: "ETH/USD", value: 3452, change: -0.82, up: false },
    { pair: "GOLD", value: 2155, change: -0.45, up: false },
    { pair: "EUR/USD", value: 1.0844, change: 0.12, up: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(p => {
        const fluctuation = (Math.random() - 0.5) * (p.value * 0.0001);
        const newValue = p.value + fluctuation;
        return {
          ...p,
          value: newValue,
          up: fluctuation > 0
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tickerItems = [...prices, ...prices, ...prices, ...prices];

  return (
    <div className="fixed top-20 left-0 w-full h-[50px] bg-black border-b border-[#333333] z-[999] overflow-hidden flex items-center">
      <div className="flex gap-12 px-8 whitespace-nowrap ticker-scroll">
        {tickerItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2 font-tech text-[12px] font-medium">
            <span className="text-[#999999] uppercase tracking-[0.5px]">{item.pair}</span>
            <span className="text-white font-bold">
              {item.pair.includes('BTC') || item.pair.includes('ETH') || item.pair.includes('GOLD') 
                ? item.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                : item.value.toFixed(4)}
            </span>
            <span className={item.up ? "text-[#44FF44] font-semibold" : "text-[#FF4444] font-semibold"}>
              {item.up ? '+' : ''}{item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;