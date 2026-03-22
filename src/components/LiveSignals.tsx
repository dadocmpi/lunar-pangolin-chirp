"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface Signal {
  id: string;
  asset: string;
  type: 'BUY' | 'SELL';
  entry: string;
  profit: string;
  status: 'ACTIVE' | 'COMPLETED';
}

const LiveSignals = () => {
  const { t } = useTranslation();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [marketPrices, setMarketPrices] = useState<Record<string, string>>({});
  const assets = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "EURUSDT", "GBPUSDT", "PAXGUSDT"];

  // Fetch real prices from Binance
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price');
        const data = await res.json();
        const prices: Record<string, string> = {};
        data.forEach((item: any) => {
          if (assets.includes(item.symbol)) {
            prices[item.symbol] = item.price;
          }
        });
        setMarketPrices(prices);
      } catch (e) {
        console.error("Error fetching live prices", e);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 3000);
    return () => clearInterval(interval);
  }, []);

  // Generate signals based on real prices
  useEffect(() => {
    const generateInitial = () => {
      const initial = assets.slice(0, 5).map((symbol, i) => ({
        id: i.toString(),
        asset: symbol.replace('USDT', '/USD').replace('PAXG', 'GOLD'),
        type: Math.random() > 0.5 ? 'BUY' : 'SELL' as 'BUY' | 'SELL',
        entry: marketPrices[symbol] || "---",
        profit: `+${(Math.random() * 1.5).toFixed(2)}%`,
        status: 'COMPLETED' as 'COMPLETED'
      }));
      setSignals(initial);
    };

    if (Object.keys(marketPrices).length > 0 && signals.length === 0) {
      generateInitial();
    }

    const interval = setInterval(() => {
      if (Object.keys(marketPrices).length === 0) return;
      
      const randomAsset = assets[Math.floor(Math.random() * assets.length)];
      const newSignal: Signal = {
        id: Date.now().toString(),
        asset: randomAsset.replace('USDT', '/USD').replace('PAXG', 'GOLD'),
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        entry: marketPrices[randomAsset] || "---",
        profit: Math.random() > 0.3 ? `+${(Math.random() * 0.8).toFixed(2)}%` : '---',
        status: Math.random() > 0.3 ? 'COMPLETED' : 'ACTIVE'
      };

      setSignals(prev => [newSignal, ...prev.slice(0, 4)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [marketPrices]);

  return (
    <section className="py-32 px-8 bg-black border-t border-white/5">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fadeInUp">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('signals.badge')}</span>
            <h2 className="text-[28px] md:text-[42px] font-serif font-bold uppercase tracking-tight mb-8 leading-tight">
              {t('signals.title')} <br />
              <span className="text-white">{t('signals.subtitle')}</span>
            </h2>
            <p className="text-slate-400 text-[14px] leading-relaxed mb-10 max-w-md">
              {t('signals.desc')}
            </p>
            <div className="flex items-center gap-4 p-6 bg-[#080B12] border border-white/5">
              <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white">Institutional Verification</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">Real-time data feed from global liquidity pools.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#D4AF37]/5 blur-3xl pointer-events-none" />
            <div className="relative bg-[#080B12] border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-[#D4AF37] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">LIVE TERMINAL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-green-500">CONNECTED</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
                      <th className="p-6">{t('signals.asset')}</th>
                      <th className="p-6">{t('signals.type')}</th>
                      <th className="p-6">{t('signals.entry')}</th>
                      <th className="p-6">{t('signals.profit')}</th>
                      <th className="p-6">{t('signals.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {signals.map((signal) => (
                      <tr key={signal.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 text-[11px] font-bold text-white tracking-widest">{signal.asset}</td>
                        <td className="p-6">
                          <span className={cn(
                            "text-[9px] font-black px-2 py-1 rounded-none",
                            signal.type === 'BUY' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {signal.type}
                          </span>
                        </td>
                        <td className="p-6 text-[11px] font-tech text-slate-400">
                          {parseFloat(signal.entry).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </td>
                        <td className="p-6 text-[11px] font-bold text-[#D4AF37]">{signal.profit}</td>
                        <td className="p-6">
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest",
                            signal.status === 'ACTIVE' ? "text-blue-400" : "text-slate-500"
                          )}>
                            {signal.status === 'ACTIVE' ? t('signals.active') : t('signals.completed')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveSignals;