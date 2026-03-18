"use client";

import React, { useState, useEffect, useRef } from 'react';

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

  // Refs para manter os dados de referência D1 entre as atualizações de 1s
  const d1Data = useRef<any>({});

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // 1. Buscar Cripto da Binance (Dados de 24h para referência D1)
        const cryptoRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","SOLUSDT"]');
        const cryptoJson = await cryptoRes.json();
        
        // 2. Buscar FX de API Pública
        const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const fxJson = await fxRes.json();

        d1Data.current = {
          crypto: cryptoJson,
          fx: fxJson.rates
        };
      } catch (error) {
        console.error("Erro ao sincronizar dados D1:", error);
      }
    };

    // Sincroniza dados reais a cada 10s para não sobrecarregar a API
    fetchMarketData();
    const syncInterval = setInterval(fetchMarketData, 10000);

    // Atualização visual a cada 1 segundo (Dinamismo Real-Time)
    const tickInterval = setInterval(() => {
      setPrices(prev => prev.map(p => {
        let newValue = p.value;
        let newChange = p.change;

        // Se temos dados da API, usamos como base e adicionamos micro-oscilação
        if (d1Data.current.crypto) {
          if (p.pair === "BTC/USD") {
            const btc = d1Data.current.crypto.find((i: any) => i.symbol === "BTCUSDT");
            const base = parseFloat(btc.lastPrice);
            newValue = base + (Math.random() - 0.5) * 5; // Micro-oscilação de $5
            newChange = parseFloat(btc.priceChangePercent);
          } else if (p.pair === "ETH/USD") {
            const eth = d1Data.current.crypto.find((i: any) => i.symbol === "ETHUSDT");
            const base = parseFloat(eth.lastPrice);
            newValue = base + (Math.random() - 0.5) * 1;
            newChange = parseFloat(eth.priceChangePercent);
          } else if (p.pair === "SOL/USD") {
            const sol = d1Data.current.crypto.find((i: any) => i.symbol === "SOLUSDT");
            const base = parseFloat(sol.lastPrice);
            newValue = base + (Math.random() - 0.5) * 0.1;
            newChange = parseFloat(sol.priceChangePercent);
          }
        }

        if (d1Data.current.fx) {
          if (p.pair === "EUR/USD") {
            const base = 1 / d1Data.current.fx.EUR;
            newValue = base + (Math.random() - 0.5) * 0.0002;
            newChange = p.change + (Math.random() - 0.5) * 0.01; // Variação D1 simulada sobre base real
          } else if (p.pair === "GBP/USD") {
            const base = 1 / d1Data.current.fx.GBP;
            newValue = base + (Math.random() - 0.5) * 0.0002;
            newChange = p.change + (Math.random() - 0.5) * 0.01;
          } else if (p.pair === "USD/JPY") {
            const base = d1Data.current.fx.JPY;
            newValue = base + (Math.random() - 0.5) * 0.02;
            newChange = p.change + (Math.random() - 0.5) * 0.01;
          } else if (p.pair === "GOLD") {
            newValue = (p.value || 2155) + (Math.random() - 0.5) * 0.5;
            newChange = p.change + (Math.random() - 0.5) * 0.005;
          }
        }

        return {
          ...p,
          value: newValue || p.value,
          change: newChange,
          up: newChange >= 0
        };
      }));
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, []);

  const tickerItems = [...prices, ...prices, ...prices, ...prices];

  return (
    <div className="fixed top-24 left-0 w-full h-[50px] bg-black/80 backdrop-blur-md border-b border-white/5 z-[999] overflow-hidden flex items-center">
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-black z-10 flex items-center border-r border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black tracking-[0.2em] text-white uppercase">Live Terminal</span>
        </div>
      </div>
      
      <div className="flex gap-16 px-8 whitespace-nowrap ticker-scroll ml-24">
        {tickerItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 font-tech text-[11px] font-bold transition-all duration-500">
            <span className="text-slate-500 uppercase tracking-widest">{item.pair}</span>
            <span className="text-white tabular-nums">
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