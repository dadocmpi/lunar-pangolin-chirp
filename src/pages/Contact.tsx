"use client";

import React from 'react';
import { Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const Contact = () => {
  const { t } = useTranslation();

  const handleContact = () => {
    window.location.href = 'mailto:marketsbraxel@ouvidor.net?subject=Contato%20-%20Braxel%20Markets&body=Ol%C3%A1%2C%0A%0AMeu%20nome%20%C3%A9%3A%0AEmail%3A%20%0AMensagem%3A%20';
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />
      
      <section className="relative pt-[160px] pb-20 border-b border-white/5 bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('contact.badge')}</span>
            <h1 className="font-serif text-[28px] md:text-[48px] font-bold leading-[1.1] mb-6 tracking-[-0.03em] uppercase">
              {t('contact.title')} <br />
              <span className="text-white">{t('contact.subtitle')}</span>
            </h1>
            <p className="font-sans text-[14px] md:text-[17px] text-slate-400 max-w-xl leading-relaxed">
              {t('contact.desc')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-24">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 border border-white/5 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-[20px] md:text-[28px] font-serif font-bold tracking-tighter mb-12 uppercase">{t('contact.infoTitle')}</h2>
            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="text-[#D4AF37] mt-1 group-hover:scale-110 transition-transform"><Mail size={28} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[3px] text-white mb-2">E-mail</p>
                  <a href="mailto:marketsbraxel@ouvidor.net" className="text-slate-400 text-[14px] hover:text-[#D4AF37] transition-colors">marketsbraxel@ouvidor.net</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="text-[#D4AF37] mt-1 group-hover:scale-110 transition-transform"><Clock size={28} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[3px] text-white mb-2">{t('contact.supportHours')}</p>
                  <p className="text-slate-400 text-[14px]">{t('contact.institutionalSupport')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-[20px] font-serif font-bold uppercase tracking-tighter mb-10">{t('contact.formTitle')}</h2>
            <p className="text-slate-400 text-[14px] leading-relaxed mb-8">
              {t('contact.formDesc')}
            </p>
            <Button 
              onClick={handleContact}
              className="w-full bg-[#D4AF37] hover:bg-[#C9A227] text-black rounded-none h-16 text-[12px] font-black uppercase tracking-[2px] transition-all border-none flex items-center justify-center gap-3"
            >
              <Mail size={20} />
              {t('contact.sendBtn')}
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;