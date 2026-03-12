"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, Twitter, Linkedin, Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0C10] text-slate-400 pt-32 pb-16 border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-serif text-lg font-bold">
                B
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-white">BRAXEL</span>
                <span className="text-[8px] font-bold tracking-[0.3em] text-[#C5A059]">MARKETS</span>
              </div>
            </Link>
            <p className="text-[11px] leading-relaxed uppercase tracking-widest text-slate-500 max-w-xs">
              Institutional-grade quantitative infrastructure. Engineered for the modern global market.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[#C5A059] transition-colors"><Linkedin size={18} /></a>
              <a href="#" className="hover:text-[#C5A059] transition-colors"><Twitter size={18} /></a>
              <a href="https://t.me/braxelmarkets" target="_blank" rel="noopener noreferrer" className="hover:text-[#C5A059] transition-colors"><Send size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.4em] mb-10">Infrastructure</h4>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-[0.2em]">
              <li><Link to="/pricing" className="hover:text-[#C5A059] transition-colors">Investment Plans</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#C5A059] transition-colors">Technical Framework</Link></li>
              <li><Link to="/about" className="hover:text-[#C5A059] transition-colors">Our Legacy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.4em] mb-10">Legal</h4>
            <ul className="space-y-5 text-[10px] font-bold uppercase tracking-[0.2em]">
              <li><Link to="/terms" className="hover:text-[#C5A059] transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-[#C5A059] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-[#C5A059] transition-colors">Risk Disclosure</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.4em] mb-10">Concierge</h4>
            <ul className="space-y-6">
              <li className="flex items-center gap-4">
                <Mail className="text-[#C5A059]" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">marketsbraxel@gmail.com</span>
              </li>
              <li className="flex items-center gap-4">
                <Shield className="text-[#C5A059]" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Institutional Support 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
            © {currentYear} Braxel Markets. All rights reserved.
          </p>
          <div className="flex gap-10 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full" /> Systems Operational</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#C5A059] rounded-full" /> AES-256 Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;