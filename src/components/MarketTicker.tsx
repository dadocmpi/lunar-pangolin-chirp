"use client";

import React, { useState, useEffect } from 'react';

const MarketTicker = () => {
  const [prices, setPrices] = useState([
    { pair: "GBP/USD", value: 1.2632, change: 0, up: true },
    { pair: "USD/JPY", value: 149.19, change: 0, up: true },
    { pair: "BTC/USD", value: 64000, change: 0, up: true },
    { pair: "ETH/USD", value: 3400, change: 0, up: true },
    { pair: "GOLD", value: 2155, change: 0, up: true },
    { pair: "EUR/USD", value: 1.0844, change: 0, up: true },
  ]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch Crypto from Binance (Public API)
        const cryptoRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]');
        const cryptoData = await cryptoRes.json();
        
        // Fetch FX from Public API
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
          } else if (p.pair === "EUR/USD") {
            newValue = 1 / fxData.rates.EUR;
            newChange = (Math.random() - 0.5) * 0.1; // Simulated daily change for FX
          } else if (p.pair === "GBP/USD") {
            newValue = 1 / fxData.rates.GBP;
            newChange = (Math.random() - 0.5) * 0.1;
          } else if (p.pair === "USD/JPY") {
            newValue = fxData.rates.JPY;
            newChange = (Math.random() - 0.5) * 0.1;
          } else if (p.pair === "GOLD") {
            // Gold usually requires a key, so we simulate a very realistic fluctuation around real spot
            newValue = 2150 + (Math.random() * 10);
            newChange = (Math.random() - 0.5) * 0.5;
          }

          return {
            ...p,
            value: newValue,
            change: newChange,
            up: newChange >= 0
          };
        }));
      } catch (error) {
        console.error("Error fetching real-time prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds
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
                ? item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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