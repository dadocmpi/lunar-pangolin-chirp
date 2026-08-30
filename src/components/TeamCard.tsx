"use client";

import React from 'react';

interface TeamCardProps {
  name: string;
  role: string;
  bio: string;
  photo?: string;
}

const TeamCard = ({ name, role, bio, photo }: TeamCardProps) => {
  return (
    <div className="p-12 bg-[#080B12] flex flex-col items-center text-center hover:bg-white/[0.02] transition-all group">
      <div className="w-40 h-40 mb-8 rounded-full overflow-hidden bg-white/5 border border-white/10 group-hover:border-[#D4AF37]/40 transition-all">
        {photo ? (
          <img 
            src={photo} 
            alt={name} 
            className="w-full h-full object-cover object-[center_30%] scale-110"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
              const fallback = target.parentElement?.querySelector('.avatar-fallback');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className="avatar-fallback hidden w-full h-full flex items-center justify-center text-[#D4AF37] text-4xl font-serif font-bold">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
      </div>
      <h3 className="text-[14px] font-bold uppercase tracking-[0.15em] mb-2 text-white">{name}</h3>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6">{role}</p>
      <p className="text-slate-500 text-[12px] leading-relaxed max-w-xs">{bio}</p>
    </div>
  );
};

export default TeamCard;