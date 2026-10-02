"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

const Terms = () => {
  const { t } = useTranslation();
  useDocumentMeta('terms');

  const sections: Array<{ title: string; body: string }> = [
    { title: t('termsPage.entityTitle'), body: t('termsPage.entityText') },
    { title: t('termsPage.descriptionTitle'), body: t('termsPage.descriptionText') },
    { title: t('termsPage.feesTitle'), body: t('termsPage.feesText') },
    { title: t('termsPage.eligibilityTitle'), body: t('termsPage.eligibilityText') },
    { title: t('termsPage.accountTerminationTitle'), body: t('termsPage.accountTerminationText') },
    { title: t('termsPage.limitationOfLiabilityTitle'), body: t('termsPage.limitationOfLiabilityText') },
    { title: t('termsPage.disputeResolutionTitle'), body: t('termsPage.disputeResolutionText') },
    { title: t('termsPage.changesToTermsTitle'), body: t('termsPage.changesToTermsText') },
    { title: t('termsPage.effectiveDateTitle'), body: t('termsPage.effectiveDateText') },
    { title: t('termsPage.contactTitle'), body: t('termsPage.contactText') },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="relative h-[40vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop" 
            alt="Los Angeles" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/80 to-[#05070A]" />
        </div>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">{t('legal.badgeLegal')}</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">{t('legal.termsTitle')}</h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20">
        <section className="border border-white/10 bg-[#080B12] p-12 md:p-16">
          <div className="max-w-4xl mx-auto space-y-12 text-slate-400 text-sm leading-relaxed">
            <div className="p-4 border border-yellow-700/40 bg-yellow-950/20 text-yellow-300 text-[10px] font-bold uppercase tracking-widest">
              {t('legalDraftBanner')}
            </div>
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">{section.title}</h2>
                <p>{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;