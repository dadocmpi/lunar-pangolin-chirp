"use client";

import React from 'react';

interface LogoBraxelProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'icon' | 'full';
}

const sizes = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  xl: 'h-14 w-14',
};

export const LogoBraxel = ({ size = 'md', className = '' }: LogoBraxelProps) => {
  return (
    <img 
      src="/logo-white.svg" 
      alt="Braxel" 
      className={`${sizes[size]} object-contain ${className}`}
    />
  );
};

export default LogoBraxel;