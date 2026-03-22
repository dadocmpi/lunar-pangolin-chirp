"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import PerformanceChart from './PerformanceChart';
import { TrendingUp, Target, Activity, BarChart3 } from 'lucide-react';

const ResultsSection = () => {
  const { t } = useTranslation();

  const metrics = [
    { label: t('results.winrate'), value: "84.2%", icon: <Target className="text-green-500" size={24} /> },
    { label: t('results.growth'), value: "+12.4%", icon: <TrendingUp className="text-[#D4AF37]" size={24} /> },
    { label: t('results.trades'), value: "1,240+", icon: <Activity className="text-blue-500" size={24} /> },
    { label: t('results.profit'), value: "$2.4M+", icon: <BarChart3 className="text-[#D4AF37]" size={24} /> },
  ];

  return (
    <section id="results" className="py-32 px-8 bg-black border-y border-white/5">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-20 text-center">
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('results.badge')}</span>
          <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight leading-tight">
            {t('results.title')} <span className="text-white">{t('results.subtitle')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="p-8 bg-[#080B12] border border-white/10 flex items-center gap-6 hover:border-[#D4AF37]/30 transition-all group">
                <div className="group-hover:scale-110 transition-transform">{m.icon}</div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">{m.label}</p>
                  <p className="text-2xl font-serif font-bold text-white">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;