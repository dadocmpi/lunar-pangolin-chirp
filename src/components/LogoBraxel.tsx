"use client";

import React from 'react';

interface LogoBraxelProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { container: 'w-6 h-6', text: 'text-sm' },
  md: { container: 'w-8 h-8', text: 'text-lg' },
  lg: { container: 'w-10 h-10', text: 'text-xl' },
  xl: { container: 'w-14 h-14', text: 'text-2xl' },
};

export const LogoBraxel = ({ size = 'md', className = '' }: LogoBraxelProps) => {
  const s = sizes[size];
  return (
    <div className={`${s.container} bg-gradient-to-br from-[#D4AF37] to-[#B8962E] rounded-lg flex items-center justify-center shadow-lg ${className}`}>
      <span className={`${s.text} font-black text-black`}>B</span>
    </div>
  );
};

export default LogoBraxel;
