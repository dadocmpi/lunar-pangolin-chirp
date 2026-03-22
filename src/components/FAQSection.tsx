"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const { t } = useTranslation();

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];

  return (
    <section id="faq" className="py-32 px-8 bg-[#05070A] border-t border-white/5">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-20 text-center">
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t('faq.badge')}</span>
          <h2 className="text-[24px] md:text-[32px] font-serif font-bold uppercase tracking-tight leading-tight">
            {t('faq.title')} <span className="text-white">{t('faq.subtitle')}</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 bg-[#080B12] px-6">
              <AccordionTrigger className="text-[11px] font-bold uppercase tracking-[2px] text-white hover:text-[#D4AF37] hover:no-underline py-6 text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 text-[13px] leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;