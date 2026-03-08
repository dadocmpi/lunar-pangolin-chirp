"use client";

import React from 'react';
import { Mail, MapPin, Send, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="relative h-[50vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2070&auto=format&fit=crop" 
            alt="Contact" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/80 to-[#05070A]" />
        </div>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Suporte</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Entre em <br /><span className="text-[#C5A059]">Contato</span></h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Estamos aqui para ajudar. Entre em contato conosco para qualquer dúvida ou suporte especializado.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10 uppercase">Informações</h2>
            <div className="space-y-10">
              <div className="flex items-start gap-6">
                <div className="text-[#C5A059] mt-1"><Mail size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">E-mail</p>
                  <p className="text-slate-400 text-xs">marketsbraxel@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="text-[#C5A059] mt-1"><Send size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">Telegram</p>
                  <a href="https://t.me/braxelmarkets" target="_blank" rel="noopener noreferrer" className="text-slate-400 text-xs hover:text-[#C5A059]">@braxelmarkets</a>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="text-[#C5A059] mt-1"><MapPin size={20} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">Sede</p>
                  <p className="text-slate-400 text-xs leading-relaxed">45 Finsbury Square, 4th Floor, London, EC2A 1PJ, UK</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-12 md:p-16 bg-[#080B12]">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Envie uma Mensagem</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input placeholder="NOME" className="bg-white/5 border-white/10 rounded-none h-14 text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600" />
                <Input placeholder="E-MAIL" className="bg-white/5 border-white/10 rounded-none h-14 text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600" />
              </div>
              <Input placeholder="ASSUNTO" className="bg-white/5 border-white/10 rounded-none h-14 text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600" />
              <Textarea placeholder="MENSAGEM" className="bg-white/5 border-white/10 rounded-none min-h-[150px] text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600" />
              <Button className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-16 text-[11px] font-bold uppercase tracking-widest transition-all border-none">
                Enviar Mensagem
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