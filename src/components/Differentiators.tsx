"use client";

import React from 'react';
import { Cpu, Zap, Layout, Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Differentiators = () => {
  const { t } = useTranslation();

  const items = [
    { icon: <Cpu size={32} />, title: t('diffs.t1'), desc: t('diffs.d1') },
    { icon: <Zap size={32} />, title: t('diffs.t2'), desc: t('diffs.d2') },
    { icon: <Layout size={32} />, title: t('diffs.t3'), desc: t('diffs.d3') },
    { icon: <Network size={32} />, title: t('diffs.t4'), desc: t('diffs.d4') },
  ];

  return (
    <section className="py-32 px-8 bg-black border-t border-white/5">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-24 text-center">
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('diffs.badge')}</span>
          <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight">{t('diffs.title')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
          {items.map((item, i) => (
            <div key={i} className="p-12 bg-[#080B12] hover:bg-white/[0.02] transition-all group">
              <div className="text-[#D4AF37] mb-8 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-[11px] font-bold uppercase tracking-[2px] mb-4 text-white">{item.title}</h3>
              <p className="text-slate-500 text-[12px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Differentiators;