"use client";

import React, { useState, useEffect, useRef } from 'react';

const MarketTicker = () => {
  const [prices, setPrices] = useState([
    { pair: "BTC/USD", value: 0, change: 0, up: true },
    { pair: "ETH/USD", value: 0, change: 0, up: true },
    { pair: "EUR/USD", value: 1.0844, change: 0.12, up: true },
    { pair: "GBP/USD", value: 1.2632, change: -0.05, up: false },
    { pair: "GBP/JPY", value: 190.45, change: 0.15, up: true },
    { pair: "USD/CAD", value: 1.3520, change: -0.08, up: false },
    { pair: "GOLD", value: 0, change: 0, up: true },
  ]);

  const d1Data = useRef<any>({});

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Cripto e Ouro (PAXG) via Binance - 24/7
        const cryptoRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","PAXGUSDT"]');
        const cryptoJson = await cryptoRes.json();
        
        // Forex via ExchangeRate (Dados de fechamento ou tempo real)
        const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const fxJson = await fxRes.json();

        d1Data.current = {
          crypto: cryptoJson,
          fx: fxJson.rates,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error("Erro ao sincronizar dados:", error);
      }
    };

    fetchMarketData();
    const syncInterval = setInterval(fetchMarketData, 10000);

    const tickInterval = setInterval(() => {
      setPrices(prev => prev.map(p => {
        let newValue = p.value;
        let newChange = p.change;

        // Lógica para Cripto (Sempre Real)
        if (d1Data.current.crypto) {
          const symbolToFind = p.pair === "GOLD" ? "PAXGUSDT" : p.pair.replace('/', '').replace('USD', 'USDT');
          const cryptoItem = d1Data.current.crypto.find((i: any) => i.symbol === symbolToFind);
          
          if (cryptoItem) {
            const base = parseFloat(cryptoItem.lastPrice);
            // Adiciona micro-oscilação de 0.01% para parecer vivo entre updates da API
            newValue = base + (Math.random() - 0.5) * (base * 0.0002);
            newChange = parseFloat(cryptoItem.priceChangePercent);
          }
        }

        // Lógica para Forex (Real + Jitter no final de semana)
        if (d1Data.current.fx) {
          let baseFx = 0;
          if (p.pair === "EUR/USD") baseFx = 1 / d1Data.current.fx.EUR;
          else if (p.pair === "GBP/USD") baseFx = 1 / d1Data.current.fx.GBP;
          else if (p.pair === "GBP/JPY") baseFx = d1Data.current.fx.JPY / d1Data.current.fx.GBP;
          else if (p.pair === "USD/CAD") baseFx = d1Data.current.fx.CAD;

          if (baseFx > 0) {
            // Micro-oscilação para Forex (0.005%)
            newValue = baseFx + (Math.random() - 0.5) * (baseFx * 0.0001);
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

  const tickerItems = [...prices, ...prices, ...prices];

  return (
    <div className="fixed top-24 left-0 w-full h-[50px] bg-black/80 backdrop-blur-md border-b border-white/5 z-[900] overflow-hidden flex items-center">
      <div className="flex gap-16 px-8 whitespace-nowrap ticker-scroll">
        {tickerItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 font-tech text-[11px] font-bold">
            <span className="text-slate-500 uppercase tracking-widest">{item.pair}</span>
            <span className="text-white tabular-nums">
              {item.value === 0 ? "---" : 
                item.pair === 'GOLD' || item.pair.includes('BTC') || item.pair.includes('ETH')
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