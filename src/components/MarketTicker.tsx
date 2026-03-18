"use client";

import React, { useState, useEffect } from 'react';

const MarketTicker = () => {
  const [prices, setPrices] = useState([
    { pair: "BTC/USD", value: 0, change: 0, up: true },
    { pair: "ETH/USD", value: 0, change: 0, up: true },
    { pair: "SOL/USD", value: 0, change: 0, up: true },
    { pair: "EUR/USD", value: 1.0844, change: 0.12, up: true },
    { pair: "GBP/USD", value: 1.2632, change: -0.05, up: false },
    { pair: "USD/JPY", value: 149.19, change: 0.22, up: true },
    { pair: "GOLD", value: 2155.40, change: 0.45, up: true },
  ]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // 1. Buscar Cripto da Binance (API Pública)
        const cryptoRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]');
        const cryptoData = await cryptoRes.json();
        
        // 2. Buscar FX de API Pública
        const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const fxData = await fxRes.json();

        setPrices(prev => prev.map(p => {
          let newValue = p.value;
          let newChange = p.change;

          if (p.pair === "BTC/USD") {
            const btc = cryptoData.find((i: any) => i.symbol === "BTCUSDT");
            newValue = parseFloat(btc.lastPrice);
            newChange = parseFloat(btc.priceChangePercent);
          } else if (p.pair === "ETH/USD") {
            const eth = cryptoData.find((i: any) => i.symbol === "ETHUSDT");
            newValue = parseFloat(eth.lastPrice);
            newChange = parseFloat(eth.priceChangePercent);
          } else if (p.pair === "SOL/USD") {
            const sol = cryptoData.find((i: any) => i.symbol === "SOLUSDT");
            newValue = parseFloat(sol.lastPrice);
            newChange = parseFloat(sol.priceChangePercent);
          } else if (p.pair === "EUR/USD") {
            newValue = 1 / fxData.rates.EUR;
            newChange = (Math.random() - 0.5) * 0.05; // Simulação leve de variação diária
          } else if (p.pair === "GBP/USD") {
            newValue = 1 / fxData.rates.GBP;
            newChange = (Math.random() - 0.5) * 0.05;
          } else if (p.pair === "USD/JPY") {
            newValue = fxData.rates.JPY;
            newChange = (Math.random() - 0.5) * 0.05;
          } else if (p.pair === "GOLD") {
            // Ouro flutua baseado em um valor base realista
            newValue = 2150 + (Math.random() * 15);
            newChange = (Math.random() - 0.5) * 0.2;
          }

          return {
            ...p,
            value: newValue,
            change: newChange,
            up: newChange >= 0
          };
        }));
      } catch (error) {
        console.error("Erro ao buscar preços reais:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 8000); // Atualiza a cada 8 segundos
    return () => clearInterval(interval);
  }, []);

  // Duplicamos os itens para criar o efeito de scroll infinito suave
  const tickerItems = [...prices, ...prices, ...prices, ...prices];

  return (
    <div className="fixed top-24 left-0 w-full h-[50px] bg-black/80 backdrop-blur-md border-b border-white/5 z-[999] overflow-hidden flex items-center">
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-black z-10 flex items-center border-r border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">Live Feed</span>
        </div>
      </div>
      
      <div className="flex gap-16 px-8 whitespace-nowrap ticker-scroll ml-24">
        {tickerItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 font-tech text-[11px] font-bold">
            <span className="text-slate-500 uppercase tracking-widest">{item.pair}</span>
            <span className="text-white">
              {item.value === 0 ? "---" : 
                item.pair.includes('BTC') || item.pair.includes('ETH') || item.pair.includes('GOLD') 
                ? item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : item.value.toFixed(4)}
            </span>
            <span className={item.up ? "text-green-500" : "text-red-500"}>
              {item.up ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTicker;