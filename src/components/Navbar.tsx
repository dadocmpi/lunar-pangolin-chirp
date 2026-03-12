"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
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
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={cn(
      "fixed top-0 left-0 w-full h-20 z-[1000] transition-all duration-500 border-b",
      scrolled ? "bg-[#0A0C10]/95 backdrop-blur-md border-white/5" : "bg-transparent border-transparent"
    )}>
      <div className="container mx-auto h-full px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-serif text-lg font-bold transition-transform group-hover:scale-105">
            B
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-white">BRAXEL</span>
            <span className="text-[8px] font-bold tracking-[0.3em] text-[#C5A059]">MARKETS</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-[11px] font-bold tracking-[0.15em] uppercase transition-colors hover:text-[#C5A059]",
                location.pathname === link.path ? "text-[#C5A059]" : "text-slate-400"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors outline-none">
              <Globe size={14} />
              {i18n.language.toUpperCase()}
              <ChevronDown size={10} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#11141A] border-white/5 text-white min-w-[80px]">
              <DropdownMenuItem onClick={() => changeLanguage('en')} className="text-[10px] font-bold uppercase tracking-widest focus:bg-[#C5A059] focus:text-black cursor-pointer">EN</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('pt')} className="text-[10px] font-bold uppercase tracking-widest focus:bg-[#C5A059] focus:text-black cursor-pointer">PT</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link 
            to="/login" 
            className="text-[11px] font-bold text-white tracking-[0.15em] uppercase hover:text-[#C5A059] transition-colors"
          >
            {t('nav.login')}
          </Link>
          
          <Link to="/register">
            <button className="bg-white text-black text-[11px] font-bold tracking-[0.15em] uppercase px-6 py-3 hover:bg-[#C5A059] transition-all duration-300">
              {t('nav.openAccount')}
            </button>
          </Link>
        </div>

        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#0A0C10] border-b border-white/5 p-8 flex flex-col gap-6 lg:hidden animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-[12px] font-bold text-white tracking-[0.2em] uppercase"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-white/5 my-2" />
          <Link to="/login" className="text-[12px] font-bold text-white tracking-[0.2em] uppercase">
            {t('nav.login')}
          </Link>
          <Link to="/register">
            <button className="w-full bg-white text-black text-[12px] font-bold tracking-[0.2em] uppercase py-4">
              {t('nav.openAccount')}
            </button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;