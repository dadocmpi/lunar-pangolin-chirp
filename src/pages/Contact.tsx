"use client";

import React from 'react';
import { Mail, Send, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />
      
      <section className="relative pt-[140px] pb-16 border-b border-[#333333] bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">{t('contact.badge')}</span>
            <h1 className="font-serif text-[36px] md:text-[64px] font-bold leading-[1.1] mb-6 tracking-[-1px] uppercase">
              {t('contact.title')} <br />
              <span className="text-[#C5A059]">{t('contact.subtitle')}</span>
            </h1>
            <p className="font-sans text-[14px] md:text-[16px] text-[#E0E0E0] max-w-xl leading-relaxed">
              {t('contact.desc')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-10 md:p-12 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-[24px] md:text-[32px] font-serif font-bold tracking-tighter mb-10 uppercase">{t('contact.infoTitle')}</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="text-[#C5A059] mt-1"><Mail size={18} /></div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">E-mail</p>
                  <p className="text-slate-400 text-[13px]">marketsbraxel@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="text-[#C5A059] mt-1"><Send size={18} /></div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white mb-1">Telegram</p>
                  <a href="https://t.me/braxelmarkets" target="_blank" rel="noopener noreferrer" className="text-slate-400 text-[13px] hover:text-[#C5A059]">@braxelmarkets</a>
                </div>
              </div>
            </div>
          </div>
          <div className="p-10 md:p-12 bg-[#080B12]">
            <h2 className="text-[20px] font-serif font-bold uppercase tracking-tighter mb-8">{t('contact.formTitle')}</h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input placeholder={t('contact.placeholders.name')} className="bg-white/5 border-white/10 rounded-none h-12 text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600" />
                <Input placeholder={t('contact.placeholders.email')} className="bg-white/5 border-white/10 rounded-none h-12 text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600" />
              </div>
              <Input placeholder={t('contact.placeholders.subject')} className="bg-white/5 border-white/10 rounded-none h-12 text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600" />
              <Textarea placeholder={t('contact.placeholders.message')} className="bg-white/5 border-white/10 rounded-none min-h-[120px] text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600" />
              <Button className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-black rounded-none h-14 text-[11px] font-bold uppercase tracking-widest transition-all border-none">
                {t('contact.sendBtn')}
              </Button>
            </form>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;