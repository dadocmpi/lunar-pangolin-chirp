"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, Twitter, Linkedin, Shield } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-slate-400 pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center rounded-sm">
                <Shield className="text-black" size={24} fill="currentColor" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[18px] font-black text-white tracking-tighter font-sans">
                  BRAXEL
                </span>
                <span className="text-[#D4AF37] text-[8px] font-bold tracking-[0.3em]">MARKETS</span>
              </div>
            </Link>
            <p className="text-slate-500 text-[10px] leading-relaxed uppercase tracking-wider font-bold">
              Institutional-grade investment infrastructure. Proprietary technology for the modern market.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://t.me/braxelmarkets" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                <Send size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8">Platform</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><Link to="/pricing" className="hover:text-[#D4AF37] transition-colors">Pricing</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#D4AF37] transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8">Company</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><Link to="/about" className="hover:text-[#D4AF37] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#D4AF37] transition-colors">Contact</Link></li>
              <li><Link to="/terms" className="hover:text-[#D4AF37] transition-colors">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8">Digital Support</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <Mail className="text-[#D4AF37] shrink-0" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">marketsbraxel@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Send className="text-[#D4AF37] shrink-0" size={16} />
                <a href="https://t.me/braxelmarkets" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest hover:text-[#D4AF37]">Telegram Support</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-white/5 mb-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
          <p>© {currentYear} Braxel Markets. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/disclaimer" className="hover:text-white transition-colors">Financial Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;