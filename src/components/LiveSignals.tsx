"use client";

import React, { useState, useEffect } from 'react';
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
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});
  
  const cryptoAssets = ["BTCUSDT", "ETHUSDT", "PAXGUSDT"];
  const fxAssets = ["EURUSD", "GBPUSD", "GBPJPY", "USDCAD"];
  const allAssets = [...cryptoAssets, ...fxAssets];

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const cryptoRes = await fetch('https://api.binance.com/api/v3/ticker/price');
        const cryptoData = await cryptoRes.json();
        const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const fxData = await fxRes.json();

        const prices: Record<string, number> = {};
        cryptoData.forEach((item: any) => {
          if (cryptoAssets.includes(item.symbol)) prices[item.symbol] = parseFloat(item.price);
        });

        if (fxData.rates) {
          prices["EURUSD"] = 1 / fxData.rates.EUR;
          prices["GBPUSD"] = 1 / fxData.rates.GBP;
          prices["GBPJPY"] = fxData.rates.JPY / fxData.rates.GBP;
          prices["USDCAD"] = fxData.rates.CAD;
        }
        setMarketPrices(prices);
      } catch (e) {
        console.error("Error fetching live prices", e);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Função de formatação estrita: Máximo 4 casas decimais, sem zeros extras
    const formatPrice = (val: number, asset: string) => {
      if (!val || isNaN(val)) return "---";
      
      // Para ativos de alto valor (BTC, ETH, GOLD), usamos 2 casas decimais
      if (asset === "GOLD" || asset.includes("BTC") || asset.includes("ETH")) {
        return val.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2,
          useGrouping: false 
        });
      }
      
      // Para Forex e outros, limitamos a no máximo 4 casas decimais
      return Number(val.toFixed(4)).toString();
    };

    const formatAssetName = (symbol: string) => {
      if (symbol === "PAXGUSDT") return "GOLD";
      if (symbol.includes("USDT")) return symbol.replace("USDT", "/USD");
      return symbol.slice(0, 3) + "/" + symbol.slice(3);
    };

    if (Object.keys(marketPrices).length > 0 && signals.length === 0) {
      const initial = allAssets.slice(0, 5).map((symbol, i) => {
        const name = formatAssetName(symbol);
        const price = marketPrices[symbol] || 0;
        return {
          id: i.toString(),
          asset: name,
          type: Math.random() > 0.5 ? 'BUY' : 'SELL' as 'BUY' | 'SELL',
          entry: formatPrice(price, name),
          profit: `+${(Math.random() * 0.9).toFixed(2)}%`,
          status: 'COMPLETED' as 'COMPLETED'
        };
      });
      setSignals(initial);
    }

    const interval = setInterval(() => {
      if (Object.keys(marketPrices).length === 0) return;
      
      const randomAsset = allAssets[Math.floor(Math.random() * allAssets.length)];
      const name = formatAssetName(randomAsset);
      const price = marketPrices[randomAsset] || 0;

      const newSignal: Signal = {
        id: Date.now().toString(),
        asset: name,
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        entry: formatPrice(price, name),
        profit: Math.random() > 0.3 ? `+${(Math.random() * 0.4).toFixed(2)}%` : '---',
        status: Math.random() > 0.3 ? 'COMPLETED' : 'ACTIVE'
      };

      setSignals(prev => [newSignal, ...prev.slice(0, 4)]);
    }, 8000);

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
                          {signal.entry}
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