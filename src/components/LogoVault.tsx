"use client";

import React from 'react';

export const LogoVault = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-[#D4AF37] rounded flex items-center justify-center">
      <span className="text-black font-bold text-lg">B</span>
    </div>
    <div className="text-white font-bold tracking-wider">VAULT</div>
  </div>
);

export const LogoMetatrader = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10">
    <svg viewBox="0 0 100 30" className="h-5 w-auto" fill="currentColor">
      <text x="0" y="22" className="text-[10px] font-bold fill-white tracking-wider">MT5</text>
    </svg>
    <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">Metatrader</span>
  </div>
);

export const LogoBinance = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10">
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-yellow-400" fill="currentColor">
      <path d="M12 2L7.5 9.5L10 12L12 9L14 12L16.5 9.5L12 2Z" />
      <path d="M12 22L16.5 14.5L14 12L12 15L10 12L7.5 14.5L12 22Z" />
    </svg>
    <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">Binance</span>
  </div>
);

export const LogoVisa = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10">
    <svg viewBox="0 0 48 16" className={size === 'sm' ? 'h-3' : size === 'lg' ? 'h-5' : 'h-4'}>
      <text x="0" y="13" className="fill-white text-[11px] font-bold tracking-wider">VISA</text>
    </svg>
  </div>
);

export const LogoMastercard = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <div className="relative flex items-center justify-center w-10 h-6 bg-white/5 border border-white/10 overflow-hidden">
    <div className="absolute left-0 top-0 w-5 h-5 bg-red-500 rounded-full opacity-80" />
    <div className="absolute right-0 top-0 w-5 h-5 bg-yellow-500 rounded-full opacity-80" />
  </div>
);

export const LogoAES = () => (
  <div className="flex items-center gap-2 text-white/40">
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
    <span className="text-[10px] font-black tracking-widest">AES-256</span>
  </div>
);

export const LogoPaypal = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10">
    <span className="text-[#003087] font-bold text-lg">P</span>
    <span className="text-[#009cde] font-bold text-lg">P</span>
    <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest ml-1">PayPal</span>
  </div>
);
