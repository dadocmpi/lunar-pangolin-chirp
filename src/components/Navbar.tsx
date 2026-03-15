"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const navLinks = [
    { name: t('nav.pricing'), path: '/pricing' },
    { name: t('nav.howItWorks'), path: '/how-it-works' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="fixed top-0 left-0 w-full h-20 bg-black border-b border-white/10 z-[1000] px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center rounded-sm group-hover:scale-110 transition-transform">
          <Shield className="text-black" size={24} fill="currentColor" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[18px] font-black text-white tracking-tighter font-sans">
            BRAXEL
          </span>
          <span className="text-[#D4AF37] text-[8px] font-bold tracking-[0.3em]">MARKETS</span>
        </div>
      </Link>

      <nav className="hidden lg:flex items-center gap-12">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="relative text-[11px] font-bold text-slate-400 tracking-[2px] uppercase font-tech group hover:text-white transition-colors"
          >
            {link.name}
            <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}
      </nav>

      <div className="hidden lg:flex items-center gap-8">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-[11px] font-bold text-white tracking-[1px] uppercase font-tech hover:text-[#D4AF37] transition-colors outline-none">
            <Globe size={14} />
            {i18n.language.toUpperCase()}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black border-white/10 text-white">
            <DropdownMenuItem onClick={() => changeLanguage('en')} className="hover:bg-[#D4AF37] hover:text-black cursor-pointer text-[10px] font-bold">ENGLISH</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('pt')} className="hover:bg-[#D4AF37] hover:text-black cursor-pointer text-[10px] font-bold">PORTUGUÊS</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link 
          to="/login" 
          className="text-[11px] font-bold text-white tracking-[1px] uppercase font-tech hover:text-[#D4AF37] transition-colors duration-300"
        >
          {t('nav.login')}
        </Link>
        <Link to="/register">
          <button className="bg-[#D4AF37] text-black text-[11px] font-black tracking-[2px] uppercase font-tech px-8 py-3 rounded-none hover:bg-[#C9A227] hover:-translate-y-[1px] transition-all duration-300">
            {t('nav.openAccount')}
          </button>
        </Link>
      </div>

      <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-black border-b border-white/10 p-8 flex flex-col gap-6 lg:hidden animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-[11px] font-bold text-white tracking-[2px] uppercase font-tech"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-white/10" />
          <div className="flex gap-4">
            <button onClick={() => changeLanguage('en')} className={cn("text-[11px] font-bold", i18n.language === 'en' ? "text-[#D4AF37]" : "text-white")}>EN</button>
            <button onClick={() => changeLanguage('pt')} className={cn("text-[11px] font-bold", i18n.language === 'pt' ? "text-[#D4AF37]" : "text-white")}>PT</button>
          </div>
          <Link to="/login" className="text-[11px] font-bold text-white tracking-[2px] uppercase font-tech">
            {t('nav.login')}
          </Link>
          <Link to="/register">
            <button className="w-full bg-[#D4AF37] text-black text-[11px] font-black tracking-[2px] uppercase font-tech px-6 py-4 rounded-none">
              {t('nav.openAccount')}
            </button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;