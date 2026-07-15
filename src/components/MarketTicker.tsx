"use client";

import React, { useState, useEffect, useRef } from 'react';
import { fetchAllMarketData } from '@/services/marketDataService';

interface TickerItem {
  pair: string;
  value: number;
  change: number;
  up: boolean;
  decimals: number;
}

const MarketTicker = () => {
  const [prices, setPrices] = useState<TickerItem[]>([
    // Crypto
    { pair: "BTC/USD", value: 0, change: 0, up: true, decimals: 2 },
    { pair: "ETH/USD", value: 0, change: 0, up: true, decimals: 2 },
    { pair: "GOLD", value: 0, change: 0, up: true, decimals: 2 },
    // Indices
    { pair: "NASDAQ", value: 0, change: 0, up: true, decimals: 2 },
    // Commodities
    { pair: "SILVER", value: 0, change: 0, up: true, decimals: 2 },
    { pair: "OIL (WTI)", value: 0, change: 0, up: true, decimals: 2 },
    // Forex
    { pair: "EUR/USD", value: 0, change: 0, up: true, decimals: 4 },
    { pair: "GBP/USD", value: 0, change: 0, up: true, decimals: 4 },
    { pair: "GBP/JPY", value: 0, change: 0, up: true, decimals: 3 },
    { pair: "USD/CAD", value: 0, change: 0, up: true, decimals: 4 },
  ]);

  const marketData = useRef<{
    crypto: Record<string, { price: number; changePercent: number }>;
    twelves: Record<string, { price: number; changePercent: number }>;
    timestamp: number;
  }>({ crypto: {}, twelves: {}, timestamp: 0 });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await fetchAllMarketData();
        marketData.current = data;
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

        // Crypto via Binance
        if (p.pair === "BTC/USD" && marketData.current.crypto.BTCUSDT) {
          const data = marketData.current.crypto.BTCUSDT;
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.0002);
          newChange = data.changePercent;
        } else if (p.pair === "ETH/USD" && marketData.current.crypto.ETHUSDT) {
          const data = marketData.current.crypto.ETHUSDT;
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.0002);
          newChange = data.changePercent;
        } else if (p.pair === "GOLD" && marketData.current.crypto.PAXGUSDT) {
          const data = marketData.current.crypto.PAXGUSDT;
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.0002);
          newChange = data.changePercent;
        }
        // Indices & Commodities via Twelves Data
        else if (p.pair === "NASDAQ" && marketData.current.twelves.IXIC) {
          const data = marketData.current.twelves.IXIC;
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.00005);
          newChange = data.changePercent;
        } else if (p.pair === "SILVER" && marketData.current.twelves['XAG/USD']) {
          const data = marketData.current.twelves['XAG/USD'];
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.0001);
          newChange = data.changePercent;
        } else if (p.pair === "OIL (WTI)" && marketData.current.twelves.WTI) {
          const data = marketData.current.twelves.WTI;
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.0001);
          newChange = data.changePercent;
        }
        // Forex via Twelves Data
        else if (p.pair === "EUR/USD" && marketData.current.twelves['EUR/USD']) {
          const data = marketData.current.twelves['EUR/USD'];
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.00005);
          newChange = data.changePercent;
        } else if (p.pair === "GBP/USD" && marketData.current.twelves['GBP/USD']) {
          const data = marketData.current.twelves['GBP/USD'];
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.00005);
          newChange = data.changePercent;
        } else if (p.pair === "GBP/JPY" && marketData.current.twelves['GBP/JPY']) {
          const data = marketData.current.twelves['GBP/JPY'];
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.00005);
          newChange = data.changePercent;
        } else if (p.pair === "USD/CAD" && marketData.current.twelves['USD/CAD']) {
          const data = marketData.current.twelves['USD/CAD'];
          newValue = data.price + (Math.random() - 0.5) * (data.price * 0.00005);
          newChange = data.changePercent;
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
              {item.value === 0 ? "---" : item.value.toLocaleString(undefined, { minimumFractionDigits: item.decimals, maximumFractionDigits: item.decimals })}
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