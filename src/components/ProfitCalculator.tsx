"use client";

import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const ProfitCalculator = () => {
  const { t } = useTranslation();
  const [capital, setCapital] = useState([5000]);
  
  // Estimativa conservadora de 8% a 15% ao mês para o exemplo
  const monthlyReturn = capital[0] * 0.12;
  const annualReturn = capital[0] * 1.44;

  return (
    <section className="py-32 px-8 bg-[#05070A] border-t border-white/5">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('profitCalculator.badge')}</span>
          <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight">{t('profitCalculator.titleA')} <span className="text-white">{t('profitCalculator.titleB')}</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#080B12] border border-white/10 p-8 md:p-16">
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('profitCalculator.initialAllocation')}</label>
                <span className="text-2xl font-serif font-bold text-[#D4AF37]">${capital[0].toLocaleString()}</span>
              </div>
              <Slider 
                defaultValue={[5000]} 
                max={20000} 
                min={2000} 
                step={1000}
                onValueChange={setCapital}
                className="py-4"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                <span>$2,000</span>
                <span>$20,000</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/5">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('profitCalculator.monthlyProfit')}</p>
                <p className="text-xl font-serif font-bold text-green-500">+${monthlyReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/5">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('profitCalculator.annualProfit')}</p>
                <p className="text-xl font-serif font-bold text-green-500">+${annualReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8 border-l border-white/5 lg:pl-12">
            <div className="flex items-start gap-4">
              <div className="text-[#D4AF37] mt-1"><ShieldCheck size={20} /></div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-1">{t('profitCalculator.riskTitle')}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">{t('profitCalculator.riskDesc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-[#D4AF37] mt-1"><Zap size={20} /></div>
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-1">{t('profitCalculator.instantTitle')}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">{t('profitCalculator.instantDesc')}</p>
              </div>
            </div>
            <p className="text-[8px] text-slate-600 uppercase tracking-tighter leading-relaxed pt-4">
              {t('profitCalculator.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfitCalculator;