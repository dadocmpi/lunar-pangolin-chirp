"use client";

import React from 'react';
import { ArrowUpRight, ShoppingCart, ShieldAlert, BadgeCheck, Wrench, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { useActivationConfig } from '@/lib/activationConfig';
import { formatUsd } from '@/lib/plans';

/**
 * /accounts — "Buy your account".
 *
 * The customer buys an evaluation/funded account directly from the prop firm
 * through OUR affiliate link, then requests activation in the panel. Braxel
 * does not operate the account and receives an affiliate commission.
 *
 * The firms, their affiliate links and the signals plan price come from the
 * public `activation-config` Edge Function (server-side secrets), never from
 * hard-coded values. A firm with no configured affiliate link does not appear.
 */
const Accounts = () => {
  const { t } = useTranslation();
  useDocumentMeta('accounts');
  const { config, loading } = useActivationConfig();

  const steps = [
    { icon: <ShoppingCart size={24} />, title: t('accounts.step1Title'), body: t('accounts.step1Body') },
    { icon: <BadgeCheck size={24} />, title: t('accounts.step2Title'), body: t('accounts.step2Body') },
    { icon: <Wrench size={24} />, title: t('accounts.step3Title'), body: t('accounts.step3Body') },
  ];

  const planPrice = config.plan.priceCents > 0 ? formatUsd(config.plan.priceCents / 100) : null;

  // ACTIVATION_FLOW_ENABLED=false: the whole flow is off server-side, so the
  // page never offers a firm or a plan the server would refuse.
  if (!loading && !config.enabled) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="container mx-auto px-6 md:px-8 pt-[160px] pb-24 max-w-2xl">
          <h1 className="font-serif text-[28px] md:text-[40px] font-bold uppercase tracking-tighter mb-6">{t('accounts.disabledTitle')}</h1>
          <p className="text-slate-400 text-[14px] leading-relaxed mb-8">{t('accounts.disabledBody')}</p>
          <Link to="/contact">
            <Button className="bg-[#D4AF37] hover:bg-[#C9A227] text-black rounded-none px-10 h-14 text-[11px] font-black uppercase tracking-[0.2em]">
              {t('accounts.disabledCta')}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <section className="relative pt-[160px] pb-16 border-b border-white/5 bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('accounts.badge')}</span>
            <h1 className="font-serif text-[28px] md:text-[46px] font-bold leading-[1.1] mb-6 tracking-[-0.03em] uppercase">
              {t('accounts.title')}
            </h1>
            <p className="font-sans text-[14px] md:text-[17px] text-slate-400 max-w-xl leading-relaxed">
              {t('accounts.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-8 py-20 space-y-16">
        {/* Affiliate disclosure — always visible. */}
        <div className="p-6 border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-start gap-4">
          <ShieldAlert className="text-[#D4AF37] shrink-0 mt-0.5" size={20} aria-hidden="true" />
          <p className="text-[12px] text-slate-300 leading-relaxed">{t('accounts.affiliateNotice')}</p>
        </div>

        {/* Firm cards */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white mb-8">{t('accounts.firmsTitle')}</h2>

          {loading ? (
            <div className="p-16 border border-dashed border-white/10 bg-[#080B12] text-center">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('accounts.loading')}</p>
            </div>
          ) : config.firms.length === 0 ? (
            <div className="p-16 border border-dashed border-white/10 bg-[#080B12] text-center">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('accounts.noFirms')}</p>
              <p className="text-slate-600 text-[10px] mt-3">{t('accounts.noFirmsHint')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
              {config.firms.map((firm) => (
                <div key={firm.id} className="p-10 bg-[#080B12] flex flex-col items-start">
                  <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-6">
                    <CreditCard size={22} className="text-[#D4AF37]" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white mb-3">{firm.name}</h3>
                  <p className="text-slate-500 text-[12px] leading-relaxed mb-8">{t('accounts.firmBody')}</p>
                  {/* rel="sponsored noopener noreferrer" — affiliate link, new tab. */}
                  <a
                    href={firm.url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="mt-auto"
                  >
                    <Button className="bg-[#D4AF37] hover:bg-[#C9A227] text-black rounded-none h-14 px-8 text-[11px] font-black uppercase tracking-[0.2em]">
                      {t('accounts.buyCta', { firm: firm.name })}
                      <ArrowUpRight size={16} className="ms-2" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Signals plan */}
        {config.enabled && (
          <section className="p-10 border border-white/10 bg-[#080B12]">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 block">{t('accounts.planEyebrow')}</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">
              {config.plan.name}
              {planPrice && <span className="text-[#D4AF37] ms-4">{planPrice}<span className="text-[12px] text-slate-500">{t('accounts.perMonth')}</span></span>}
            </h2>
            <p className="text-slate-400 text-[13px] leading-relaxed max-w-2xl">{t('accounts.planBody')}</p>
          </section>
        )}

        {/* How it works — 3 steps */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white mb-8">{t('accounts.stepsTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {steps.map((step, i) => (
              <div key={i} className="p-10 bg-[#080B12] relative">
                <span className="absolute top-8 end-8 text-[42px] font-serif font-black text-white/[0.04]">0{i + 1}</span>
                <div className="text-[#D4AF37] mb-6">{step.icon}</div>
                <h3 className="text-[11px] font-bold uppercase tracking-[3px] mb-4 text-white">{step.title}</h3>
                <p className="text-slate-500 text-[12px] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA to the panel */}
        <section className="p-12 border border-white/5 bg-[#080B12] text-center">
          <h2 className="text-[20px] md:text-[26px] font-serif font-bold uppercase tracking-tighter mb-6">{t('accounts.ctaTitle')}</h2>
          <p className="text-slate-400 text-[13px] leading-relaxed max-w-xl mx-auto mb-10">{t('accounts.ctaBody')}</p>
          <Link to="/dashboard">
            <Button className="bg-[#D4AF37] hover:bg-[#C9A227] text-black rounded-none px-12 h-16 text-[12px] font-black uppercase tracking-[2px]">
              {t('accounts.ctaButton')}
            </Button>
          </Link>
        </section>

        {/* Risk warning (draft — legal review) */}
        <section className="p-8 border border-yellow-900/30 bg-yellow-950/10">
          <div className="mb-4 p-3 border border-yellow-700/40 bg-yellow-950/20 text-yellow-300 text-[10px] font-bold uppercase tracking-widest">
            {t('legalDraftBanner')}
          </div>
          <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-3">{t('accounts.riskTitle')}</h3>
          <p className="text-slate-400 text-[12px] leading-relaxed">{t('accounts.riskBody')}</p>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Accounts;
