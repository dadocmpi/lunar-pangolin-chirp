"use client";

import React from 'react';

// LogoVault - Branding element
export const LogoVault = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-[#D4AF37] rounded flex items-center justify-center">
      <span className="text-black font-bold text-lg">B</span>
    </div>
    <div className="text-white font-bold tracking-wider">VAULT</div>
  </div>
);

// MetaTrader 5 - Logo clean só com escrita
export const LogoMetatrader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { text: 'text-[10px]' },
    md: { text: 'text-[11px]' },
    lg: { text: 'text-[12px]' },
  };
  const s = sizes[size];
  
  return (
    <div className="flex items-center">
      <span className={`${s.text} font-black tracking-tight text-[#25B14D]`}>MT5</span>
    </div>
  );
};

// Visa - Logo clean só com escrita
export const LogoVisa = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { text: 'text-[10px]' },
    md: { text: 'text-[11px]' },
    lg: { text: 'text-[12px]' },
  };
  const s = sizes[size];
  
  return (
    <div className="flex items-center">
      <span className={`${s.text} font-black tracking-tight text-white`}>VISA</span>
    </div>
  );
};

// Mastercard - Logo clean só com escrita
export const LogoMastercard = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { text: 'text-[10px]' },
    md: { text: 'text-[11px]' },
    lg: { text: 'text-[12px]' },
  };
  const s = sizes[size];
  
  return (
    <div className="flex items-center gap-1">
      <span className={`${s.text} font-black tracking-tight text-[#EB001B]`}>M</span>
      <span className={`${s.text} font-black tracking-tight text-[#F79E1B]`}>C</span>
    </div>
  );
};

// AES-256 Encryption Badge
export const LogoAES = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-900/40 to-green-800/30 border border-green-500/40 rounded-lg">
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
    <span className="text-green-400/90 text-[9px] font-black tracking-widest">AES-256</span>
  </div>
);

export default {
  LogoVault,
  LogoMetatrader,
  LogoVisa,
  LogoMastercard,
  LogoAES,
};
