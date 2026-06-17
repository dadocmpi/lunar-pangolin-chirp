"use client";

import React from 'react';

// LogoVault - Branding element
export const LogoVault = () => (
  <div className="flex items-center gap-2">
    <div className="relative w-8 h-8">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <defs>
          <linearGradient id="braxelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8962E" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#braxelGrad)" />
        <path d="M8 10 L16 6 L24 10 L24 18 L16 26 L8 18 Z" fill="none" stroke="black" strokeWidth="2" />
        <circle cx="16" cy="16" r="4" fill="black" />
      </svg>
    </div>
    <div className="text-white font-bold tracking-[0.2em] text-sm">VAULT</div>
  </div>
);

// MetaTrader 5 - Logo profissional
export const LogoMetatrader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { container: 'px-2 py-1', icon: 'h-4', text: 'text-[7px]' },
    md: { container: 'px-3 py-1.5', icon: 'h-5', text: 'text-[8px]' },
    lg: { container: 'px-4 py-2', icon: 'h-6', text: 'text-[9px]' },
  };
  const s = sizes[size];
  
  return (
    <div className={`flex items-center gap-1.5 ${s.container} bg-gradient-to-r from-green-900/40 to-green-800/30 border border-green-500/40 rounded-lg`}>
      <svg viewBox="0 0 48 48" className={`${s.icon} w-auto`}>
        <defs>
          <linearGradient id="mtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#27AE60" />
            <stop offset="100%" stopColor="#1E8449" />
          </linearGradient>
        </defs>
        {/* Background */}
        <rect x="4" y="4" width="40" height="40" rx="8" fill="url(#mtGrad)"/>
        {/* M */}
        <path d="M12 32 L12 16 L18 24 L24 16 L24 32 L21 32 L21 22 L19 26 L17 22 L17 32 Z" fill="white"/>
        {/* T */}
        <path d="M26 16 L38 16 L38 19 L33 19 L33 32 L31 32 L31 19 L26 19 Z" fill="white"/>
      </svg>
      <div className="flex flex-col">
        <span className={`${s.text} text-white font-bold leading-none`}>METATRADER</span>
        <span className={`${s.text} text-green-300/80 font-medium leading-none mt-0.5`}>MT5</span>
      </div>
    </div>
  );
};

// Binance - Logo profissional
export const LogoBinance = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { container: 'px-2 py-1', icon: 'h-4', text: 'text-[7px]' },
    md: { container: 'px-3 py-1.5', icon: 'h-5', text: 'text-[8px]' },
    lg: { container: 'px-4 py-2', icon: 'h-6', text: 'text-[9px]' },
  };
  const s = sizes[size];
  
  return (
    <div className={`flex items-center gap-1.5 ${s.container} bg-gradient-to-r from-yellow-900/40 to-yellow-800/30 border border-yellow-500/40 rounded-lg`}>
      <svg viewBox="0 0 48 48" className={`${s.icon} w-auto`}>
        <defs>
          <linearGradient id="binGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F3BA2F" />
            <stop offset="100%" stopColor="#F0B90B" />
          </linearGradient>
        </defs>
        {/* Background */}
        <rect x="4" y="4" width="40" height="40" rx="8" fill="url(#binGrad)"/>
        {/* Diamond shape */}
        <path d="M24 10 L34 20 L24 38 L14 20 Z" fill="white"/>
        <path d="M24 18 L30 24 L24 34 L18 24 Z" fill="#F3BA2F"/>
      </svg>
      <span className={`${s.text} text-yellow-300 font-bold tracking-wide`}>BINANCE</span>
    </div>
  );
};

// Visa - Logo profissional
export const LogoVisa = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { container: 'px-2 py-1', icon: 'h-5' },
    md: { container: 'px-3 py-1.5', icon: 'h-6' },
    lg: { container: 'px-4 py-2', icon: 'h-7' },
  };
  const s = sizes[size];
  
  return (
    <div className={`flex items-center ${s.container} bg-white/10 border border-white/20 rounded-lg`}>
      <svg viewBox="0 0 80 25" className={`${s.icon} w-auto`}>
        {/* V */}
        <path d="M0 2 L10 23 L20 2 L24 2 L32 23 L42 2 L38 2 L34 15 L28 2 L22 2 L16 15 L12 2 Z" fill="white"/>
        {/* I */}
        <rect x="46" y="2" width="4" height="21" fill="white"/>
        {/* S */}
        <path d="M54 8 Q54 2 60 2 Q66 2 66 8 Q66 14 60 14 L60 14 Q66 14 66 20 Q66 23 60 23 Q54 23 54 17" fill="white"/>
        {/* A */}
        <path d="M70 23 L80 2 L84 2 L88 23 L85 23 L84 19 L80 19 L79 23 Z M82 5 L83 10 L84 5 Z" fill="white"/>
      </svg>
    </div>
  );
};

// Mastercard - Logo profissional
export const LogoMastercard = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { container: 'w-10 h-6' },
    md: { container: 'w-12 h-7' },
    lg: { container: 'w-14 h-8' },
  };
  const s = sizes[size];
  
  return (
    <div className={`relative flex items-center justify-center ${s.container} bg-white/10 border border-white/20 rounded-lg overflow-hidden`}>
      <svg viewBox="0 0 48 30" className="w-full h-full">
        {/* Red circle */}
        <circle cx="18" cy="15" r="12" fill="#EB001B"/>
        {/* Orange circle */}
        <circle cx="30" cy="15" r="12" fill="#F79E1B"/>
        {/* Overlap area - red */}
        <path d="M24 5 A12 12 0 0 1 24 25 A12 12 0 0 1 24 5" fill="#EB001B"/>
        {/* Overlap area - orange */}
        <path d="M24 5 A12 12 0 0 0 24 25 A12 12 0 0 0 24 5" fill="#FF5F00"/>
      </svg>
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

// PayPal - Logo profissional
export const LogoPaypal = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { container: 'px-2 py-1', icon: 'h-4', text: 'text-[7px]' },
    md: { container: 'px-3 py-1.5', icon: 'h-5', text: 'text-[8px]' },
    lg: { container: 'px-4 py-2', icon: 'h-6', text: 'text-[9px]' },
  };
  const s = sizes[size];
  
  return (
    <div className={`flex items-center gap-1.5 ${s.container} bg-gradient-to-r from-blue-900/40 to-blue-800/30 border border-blue-500/40 rounded-lg`}>
      <svg viewBox="0 0 60 20" className={`${s.icon} w-auto`}>
        {/* P */}
        <path d="M8 0 L8 20 L12 20 L12 13 L18 13 Q24 13 24 8 Q24 0 12 0 Z" fill="#009CDE"/>
        {/* P */}
        <path d="M28 0 Q32 0 34 2 L34 8 Q32 10 28 10 L28 10 L28 0 Z" fill="#003087"/>
        {/* a */}
        <path d="M42 10 Q42 7 45 7 Q48 7 48 10 Q48 13 45 13 L45 13 Q46 13 47 13 L47 13 L47 20 L50 20 L50 14 Q52 12 55 12 Q58 12 58 15 Q58 18 55 20 L51 20 Q54 18 54 15 Q54 13 51 13 L51 13 Q50 13 48 13 Q46 13 46 15 Q46 17 48 18 L52 18 Q54 18 54 20 L58 20 Q58 20 58 18 Q58 14 52 14 L52 14 Q50 14 48 14 Q45 14 45 17 Q45 19 47 20 L42 20 Q38 20 38 17 Q38 14 42 13 L42 13 Q44 13 45 13 Q45 11 43 10 Z" fill="#009CDE"/>
        {/* y */}
        <path d="M40 20 L36 10 L33 10 Q31 10 32 12 L26 20 L22 20 L28 8 Q30 5 32 5 Q34 5 35 6 L34 8 L36 5 Q37 4 39 4 Q41 4 42 6 L48 20 Z" fill="#003087"/>
      </svg>
      <span className={`${s.text} text-blue-300 font-bold tracking-wide`}>PayPal</span>
    </div>
  );
};

export default {
  LogoVault,
  LogoMetatrader,
  LogoBinance,
  LogoVisa,
  LogoMastercard,
  LogoAES,
  LogoPaypal,
};
