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

// MetaTrader 5 - Logo oficial (verde com MT5)
export const LogoMetatrader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { container: 'px-2 py-1', icon: 'h-5' },
    md: { container: 'px-3 py-1.5', icon: 'h-6' },
    lg: { container: 'px-4 py-2', icon: 'h-8' },
  };
  const s = sizes[size];
  
  return (
    <div className={`flex items-center ${s.container} bg-white/10 border border-white/20 rounded-lg`}>
      <svg viewBox="0 0 60 20" className={`${s.icon} w-auto`}>
        {/* Background verde */}
        <rect x="0" y="0" width="60" height="20" fill="#25B14D" rx="3"/>
        {/* M */}
        <path d="M6 15 L6 5 L10 12 L14 5 L14 15 L12 15 L12 9 L10 13 L8 9 L8 15 Z" fill="white"/>
        {/* T */}
        <path d="M16 5 L24 5 L24 7 L21 7 L21 15 L19 15 L19 7 L16 7 Z" fill="white"/>
        {/* 5 */}
        <path d="M26 5 L32 5 Q36 5 36 9 L34 9 Q34 7 32 7 L26 7 L26 10 L31 10 Q34 10 34 13 Q34 15 31 15 L26 15 Z" fill="white"/>
      </svg>
    </div>
  );
};

// Visa - Logo oficial (letras V-I-S-A clássicas em azul)
export const LogoVisa = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { container: 'px-2 py-1', icon: 'h-5' },
    md: { container: 'px-3 py-1.5', icon: 'h-6' },
    lg: { container: 'px-4 py-2', icon: 'h-7' },
  };
  const s = sizes[size];
  
  return (
    <div className={`flex items-center ${s.container} bg-[#1A1F71] border border-white/10 rounded-lg`}>
      <svg viewBox="0 0 60 20" className={`${s.icon} w-auto`}>
        {/* Fundo azul escuro */}
        <rect width="60" height="20" fill="#1A1F71"/>
        {/* V */}
        <path d="M4 4 L11 16 L18 4 L22 4 L29 16 L36 4 L31 4 L27 12 L23 4 L18 4 L14 12 L10 4 Z" fill="white"/>
        {/* I */}
        <rect x="40" y="4" width="3" height="12" fill="white"/>
        {/* S */}
        <path d="M46 6 Q46 4 49 4 Q52 4 52 6 Q52 8 49 8 L49 8 Q52 8 52 12 Q52 16 49 16 Q46 16 46 12" stroke="white" strokeWidth="2.5" fill="none"/>
        {/* A */}
        <path d="M56 16 L62 4 L65 4 L71 16 L68 16 L67 13 L60 13 L59 16 Z M63 5 L64 10 L65 5 Z" fill="white"/>
      </svg>
    </div>
  );
};

// Mastercard - Logo oficial (círculos vermelho e laranja)
export const LogoMastercard = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { container: 'w-10 h-6' },
    md: { container: 'w-12 h-7' },
    lg: { container: 'w-14 h-8' },
  };
  const s = sizes[size];
  
  return (
    <div className={`relative flex items-center justify-center ${s.container} bg-white/10 border border-white/20 rounded-lg overflow-hidden`}>
      <svg viewBox="0 0 40 24" className="w-full h-full">
        {/* Círculo vermelho */}
        <circle cx="15" cy="12" r="10" fill="#EB001B"/>
        {/* Círculo laranja */}
        <circle cx="25" cy="12" r="10" fill="#F79E1B"/>
        {/* Área de sobreposição laranja */}
        <path d="M20 4 A10 10 0 0 0 20 20 A10 10 0 0 0 20 4" fill="#FF5F00"/>
        {/* Área de sobreposição vermelha */}
        <path d="M20 4 A10 10 0 0 1 20 20 A10 10 0 0 1 20 4" fill="#EB001B"/>
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

export default {
  LogoVault,
  LogoMetatrader,
  LogoVisa,
  LogoMastercard,
  LogoAES,
};
