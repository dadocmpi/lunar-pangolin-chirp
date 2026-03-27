"use client";

import React from 'react';
import { Send } from 'lucide-react';

const FloatingSupport = () => {
  return (
    <a 
      href="https://t.me/braxelmarkets" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-[999] group"
    >
      <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative bg-[#D4AF37] text-black p-4 rounded-none flex items-center gap-3 shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <Send size={20} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">Institutional Support</span>
      </div>
    </a>
  );
};

export default FloatingSupport;