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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-20 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Entre em Contato</h1>
            <p className="text-xl text-slate-600">
              Estamos aqui para ajudar. Entre em contato conosco para qualquer dúvida ou suporte.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Informações de Contato</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
                    <Mail size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">E-mail</h3>
                    <p className="text-slate-600">marketsbraxel@gmail.com</p>
                    <p className="text-slate-400 text-sm">Resposta em até 24h úteis</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
                    <Send size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Telegram</h3>
                    <a href="https://t.me/braxelmarkets" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline font-medium">
                      @braxelmarkets
                    </a>
                    <p className="text-slate-400 text-sm">Suporte rápido e direto</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Sede Corporativa</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Braxel Markets Ltd.<br />
                      45 Finsbury Square, 4th Floor<br />
                      London, EC2A 1PJ, United Kingdom
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Envie uma Mensagem</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                      <Input placeholder="Seu nome" className="rounded-xl border-slate-200 py-6" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">E-mail</label>
                      <Input type="email" placeholder="seu@email.com" className="rounded-xl border-slate-200 py-6" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Assunto</label>
                    <Input placeholder="Como podemos ajudar?" className="rounded-xl border-slate-200 py-6" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mensagem</label>
                    <Textarea placeholder="Escreva sua mensagem aqui..." className="rounded-xl border-slate-200 min-h-[150px]" />
                  </div>
                  
                  <Button className="w-full bg-slate-900 hover:bg-sky-600 text-white rounded-xl py-7 font-bold text-lg transition-all">
                    Enviar Mensagem
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;