"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Send, Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-950 font-bold text-xl">
                B
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                BRAXEL <span className="text-sky-400">MARKETS</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Infraestrutura de investimento de nível institucional para traders modernos. Rápido, simples, seguro e totalmente automatizado.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-sky-600 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-sky-600 transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="https://t.me/braxelmarkets" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-sky-600 transition-colors">
                <Send size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Plataforma</h4>
            <ul className="space-y-4">
              <li><Link to="/platform" className="hover:text-sky-400 transition-colors">Visão Geral</Link></li>
              <li><Link to="/pricing" className="hover:text-sky-400 transition-colors">Preços</Link></li>
              <li><Link to="/how-it-works" className="hover:text-sky-400 transition-colors">Como Funciona</Link></li>
              <li><Link to="/platform" className="hover:text-sky-400 transition-colors">Infraestrutura</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Empresa</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">Sobre Nós</Link></li>
              <li><Link to="/contact" className="hover:text-sky-400 transition-colors">Contato</Link></li>
              <li><Link to="/legal/risk" className="hover:text-sky-400 transition-colors">Risco e Conformidade</Link></li>
              <li><Link to="/legal/terms" className="hover:text-sky-400 transition-colors">Termos de Serviço</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="text-sky-400 shrink-0" size={20} />
                <span>marketsbraxel@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-sky-400 shrink-0" size={20} />
                <span>Braxel Markets Ltd., 45 Finsbury Square, 4th Floor, London, EC2A 1PJ, UK</span>
              </li>
              <li className="flex items-start gap-3">
                <Send className="text-sky-400 shrink-0" size={20} />
                <a href="https://t.me/braxelmarkets" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400">Suporte via Telegram</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-slate-900 mb-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <p>© {currentYear} Braxel Markets. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Termos</Link>
            <Link to="/disclaimer" className="hover:text-white transition-colors">Aviso Financeiro</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;