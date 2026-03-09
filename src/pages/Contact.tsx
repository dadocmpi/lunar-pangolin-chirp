"use client";

import React from 'react';
import { Mail, Send, Phone, MessageSquare, Globe, Clock } from 'lucide-react';
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
      
      <section className="relative pt-[160px] pb-20 border-b border-white/5 bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('contact.badge')}</span>
            <h1 className="font-serif text-[42px] md:text-[72px] font-bold leading-[1] mb-6 tracking-[-2px] uppercase">
              {t('contact.title')} <br />
              <span className="text-[#D4AF37]">{t('contact.subtitle')}</span>
            </h1>
            <p className="font-sans text-[15px] md:text-[18px] text-slate-400 max-w-xl leading-relaxed">
              {t('contact.desc')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-24">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 border border-white/5 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-[28px] md:text-[40px] font-serif font-bold tracking-tighter mb-12 uppercase">{t('contact.infoTitle')}</h2>
            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="text-[#D4AF37] mt-1 group-hover:scale-110 transition-transform"><Mail size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[3px] text-white mb-2">E-mail</p>
                  <p className="text-slate-400 text-[14px]">marketsbraxel@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="text-[#D4AF37] mt-1 group-hover:scale-110 transition-transform"><Send size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[3px] text-white mb-2">Telegram</p>
                  <a href="https://t.me/braxelmarkets" target="_blank" rel="noopener noreferrer" className="text-slate-400 text-[14px] hover:text-[#D4AF37] transition-colors">@braxelmarkets</a>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="text-[#D4AF37] mt-1 group-hover:scale-110 transition-transform"><Clock size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[3px] text-white mb-2">Support Hours</p>
                  <p className="text-slate-400 text-[14px]">24/7 Institutional Support</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-12 md:p-16 bg-[#080B12]">
            <h2 className="text-[24px] font-serif font-bold uppercase tracking-tighter mb-10">{t('contact.formTitle')}</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input placeholder={t('contact.placeholders.name')} className="bg-white/[0.03] border-white/10 rounded-none h-14 text-[11px] font-bold uppercase tracking-[2px] placeholder:text-slate-700 focus:border-[#D4AF37] transition-colors" />
                <Input placeholder={t('contact.placeholders.email')} className="bg-white/[0.03] border-white/10 rounded-none h-14 text-[11px] font-bold uppercase tracking-[2px] placeholder:text-slate-700 focus:border-[#D4AF37] transition-colors" />
              </div>
              <Input placeholder={t('contact.placeholders.subject')} className="bg-white/[0.03] border-white/10 rounded-none h-14 text-[11px] font-bold uppercase tracking-[2px] placeholder:text-slate-700 focus:border-[#D4AF37] transition-colors" />
              <Textarea placeholder={t('contact.placeholders.message')} className="bg-white/[0.03] border-white/10 rounded-none min-h-[160px] text-[11px] font-bold uppercase tracking-[2px] placeholder:text-slate-700 focus:border-[#D4AF37] transition-colors" />
              <Button className="w-full bg-[#D4AF37] hover:bg-[#C9A227] text-black rounded-none h-16 text-[12px] font-black uppercase tracking-[2px] transition-all border-none">
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