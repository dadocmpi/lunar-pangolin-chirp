"use client";

import React from 'react';

interface LogoBraxelProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const sizes = {
  sm: { container: 'w-6 h-6', text: 'text-xs', icon: 16 },
  md: { container: 'w-8 h-8', text: 'text-sm', icon: 20 },
  lg: { container: 'w-10 h-10', text: 'text-base', icon: 28 },
  xl: { container: 'w-14 h-14', text: 'text-lg', icon: 36 },
  '2xl': { container: 'w-20 h-20', text: 'text-2xl', icon: 52 },
};

const variants = {
  full: 'flex items-center gap-3',
  icon: 'flex items-center justify-center',
  text: 'flex items-center gap-2',
};

export const LogoBraxel = ({ size = 'md', variant = 'icon', className = '' }: LogoBraxelProps) => {
  const s = sizes[size];
  
  const icon = (
    <svg viewBox="0 0 100 100" className={`${s.container} w-auto h-auto`}>
      <defs>
        <linearGradient id="braxelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#F4CF47" />
          <stop offset="100%" stopColor="#B8962E" />
        </linearGradient>
        <linearGradient id="braxelGradientHover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4CF47" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <filter id="braxelShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4AF37" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Background shield */}
      <path 
        d="M50 5 L90 20 L90 55 Q90 80 50 95 Q10 80 10 55 L10 20 Z" 
        fill="url(#braxelGradient)" 
        filter="url(#braxelShadow)"
      />
      
      {/* Inner diamond pattern */}
      <path 
        d="M50 20 L75 35 L75 60 Q75 75 50 82 Q25 75 25 60 L25 35 Z" 
        fill="none" 
        stroke="black" 
        strokeWidth="2"
        opacity="0.2"
      />
      
      {/* Center B letter */}
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        dominantBaseline="middle" 
        fill="black" 
        fontSize="42" 
        fontWeight="900" 
        fontFamily="Arial Black, Arial, sans-serif"
      >
        B
      </text>
      
      {/* Accent lines */}
      <line x1="30" y1="75" x2="70" y2="75" stroke="black" strokeWidth="2" opacity="0.3" />
      <line x1="35" y1="80" x2="65" y2="80" stroke="black" strokeWidth="1" opacity="0.2" />
    </svg>
  );

  const text = (
    <div className="flex flex-col">
      <span className={`${s.text} font-black tracking-tight leading-none text-white`}>BRAXEL</span>
      <span className="text-[8px] font-medium tracking-[0.3em] text-[#D4AF37] uppercase">Markets</span>
    </div>
  );

  return (
    <div className={`${variants[variant]} ${className}`}>
      {icon}
      {variant === 'full' && text}
      {variant === 'text' && (
        <span className={`${s.text} font-black tracking-tight text-white`}>BRAXEL</span>
      )}
    </div>
  );
};

// Standalone icon version
export const LogoBraxelIcon = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeMap = { sm: 24, md: 32, lg: 48 };
  const px = sizeMap[size];
  
  return (
    <svg viewBox="0 0 100 100" width={px} height={px} className={className}>
      <defs>
        <linearGradient id="braxelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8962E" />
        </linearGradient>
      </defs>
      <path d="M50 5 L90 20 L90 55 Q90 80 50 95 Q10 80 10 55 L10 20 Z" fill="url(#braxelGrad)" />
      <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" fill="black" fontSize="42" fontWeight="900" fontFamily="Arial Black">B</text>
    </svg>
  );
};

export default LogoBraxel;
