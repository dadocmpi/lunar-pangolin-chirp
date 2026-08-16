"use client";

import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RiskTransparency = () => {
  const { t } = useTranslation();

  return (
    <section className="py-32 px-8 bg-black border-t border-white/5">
      <div className="max-w-[1000px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('transparency.badge')}</span>
            <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight mb-8">{t('transparency.title')}</h2>
            <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
              {t('transparency.desc')}
            </p>
            <div className="flex items-start gap-4 p-6 bg-[#080B12] border-l-2 border-[#D4AF37]">
              <Info className="text-[#D4AF37] shrink-0" size={20} />
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                {t('transparency.warning')}
              </p>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-[#D4AF37]/5 blur-3xl group-hover:bg-[#D4AF37]/10 transition-all" />
            <div className="relative border border-white/10 bg-[#080B12] p-12 flex flex-col items-center text-center">
              <ShieldAlert size={64} className="text-[#D4AF37] mb-8" />
              <h3 className="text-[14px] font-bold uppercase tracking-[3px] text-white mb-4">{t('transparency.protocolTitle')}</h3>
              <p className="text-slate-500 text-[12px] leading-relaxed">
                {t('transparency.protocolDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskTransparency;
