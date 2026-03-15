"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
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

  // URL do logo enviado pelo usuário
  const logoUrl = "https://ymzdxifedtjwkxkzfwqu.supabase.co/storage/v1/object/public/media/logo_braxel.png";

  return (
    <header className="fixed top-0 left-0 w-full h-20 bg-black border-b border-[#333333] z-[1000] px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-[15px]">
        <img 
          src={logoUrl} 
          alt="Braxel Markets Logo" 
          className="w-10 h-10 object-contain"
        />
        <span className="text-[18px] font-bold text-white tracking-[2px] font-sans hidden sm:block">
          BRAXEL MARKETS
        </span>
      </Link>

      <nav className="hidden lg:flex items-center gap-12">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="relative text-[12px] font-semibold text-white tracking-[1px] uppercase font-tech group"
          >
            {link.name}
            <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}
      </nav>

      <div className="hidden lg:flex items-center gap-8">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-[12px] font-semibold text-white tracking-[1px] uppercase font-tech hover:text-[#D4AF37] transition-colors">
            <Globe size={14} />
            {i18n.language.toUpperCase()}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black border-[#333333] text-white">
            <DropdownMenuItem onClick={() => changeLanguage('en')} className="hover:bg-[#D4AF37] hover:text-black cursor-pointer">EN</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('pt')} className="hover:bg-[#D4AF37] hover:text-black cursor-pointer">PT</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link 
          to="/login" 
          className="text-[12px] font-semibold text-white tracking-[1px] uppercase font-tech hover:text-[#D4AF37] transition-colors duration-300"
        >
          {t('nav.login')}
        </Link>
        <Link to="/register">
          <button className="bg-[#D4AF37] text-black text-[12px] font-bold tracking-[1px] uppercase font-tech px-6 py-3 rounded-[25px] hover:bg-[#C9A227] hover:-translate-y-[2px] hover:shadow-[0_8px_16px_rgba(212,175,55,0.3)] transition-all duration-300">
            {t('nav.openAccount')}
          </button>
        </Link>
      </div>

      <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-black border-b border-[#333333] p-8 flex flex-col gap-6 lg:hidden animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-[12px] font-semibold text-white tracking-[1px] uppercase font-tech"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-[#333333]" />
          <div className="flex gap-4">
            <button onClick={() => changeLanguage('en')} className={cn("text-[12px] font-bold", i18n.language === 'en' ? "text-[#D4AF37]" : "text-white")}>EN</button>
            <button onClick={() => changeLanguage('pt')} className={cn("text-[12px] font-bold", i18n.language === 'pt' ? "text-[#D4AF37]" : "text-white")}>PT</button>
          </div>
          <Link to="/login" className="text-[12px] font-semibold text-white tracking-[1px] uppercase font-tech">
            {t('nav.login')}
          </Link>
          <Link to="/register">
            <button className="w-full bg-[#D4AF37] text-black text-[12px] font-bold tracking-[1px] uppercase font-tech px-6 py-3 rounded-[25px]">
              {t('nav.openAccount')}
            </button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;