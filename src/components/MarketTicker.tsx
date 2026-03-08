"use client";

import React from 'react';

const MarketTicker = () => {
  const items = [
    { pair: "GBP/USD", value: "1.2632", change: "-0.09%", up: false },
    { pair: "USD/JPY", value: "149.1965", change: "+0.24%", up: true },
    { pair: "BTC/USD", value: "64,145", change: "-1.14%", up: false },
    { pair: "ETH/USD", value: "3,452", change: "-0.82%", up: false },
    { pair: "GOLD", value: "2,155", change: "-0.45%", up: false },
    { pair: "EUR/USD", value: "1.0844", change: "+0.12%", up: true },
  ];

  // Duplicate items for seamless loop
  const tickerItems = [...items, ...items, ...items, ...items];

  return (
    <div className="fixed top-20 left-0 w-full h-[50px] bg-black border-b border-[#333333] z-[999] overflow-hidden flex items-center">
      <div className="flex gap-12 px-8 whitespace-nowrap ticker-scroll">
        {tickerItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2 font-tech text-[12px] font-medium">
            <span className="text-[#999999] uppercase tracking-[0.5px]">{item.pair}</span>
            <span className="text-white font-bold">{item.value}</span>
            <span className={item.up ? "text-[#44FF44] font-semibold" : "text-[#FF4444] font-semibold"}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;