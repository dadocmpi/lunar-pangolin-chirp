"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const { t } = useTranslation();

  const questions = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  return (
    <section className="py-32 px-8 bg-[#05070A] border-t border-white/5">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-16 text-center">
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('faq.badge')}</span>
          <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight">{t('faq.title')}</h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {questions.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-white/5 bg-[#080B12] px-6">
              <AccordionTrigger className="text-[11px] font-bold uppercase tracking-[2px] text-white hover:text-[#D4AF37] transition-colors py-6 text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-500 text-[13px] leading-relaxed pb-6">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;