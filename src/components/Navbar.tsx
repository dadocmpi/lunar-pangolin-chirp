"use client";

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { supportedLanguages } from '../i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const navLinks = [
    { name: t('nav.pricing'), path: '/pricing' },
    { name: t('nav.howItWorks'), path: '/how-it-works' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
    // Forçamos um refresh completo para garantir 100% de aplicação do idioma
    window.location.reload();
  };

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const logoUrl = "https://image2url.com/r2/default/images/1773617984273-e9d2f7a5-3691-45a6-81e2-12c734f51a8f.png";

  return (
    <header className="fixed top-0 left-0 w-full h-24 bg-black/90 backdrop-blur-xl border-b border-white/5 z-[1000] px-6 md:px-12 flex items-center justify-between">
      <Link 
        to="/" 
        onClick={handleLogoClick}
        className="flex items-center group"
      >
        <img 
          src={logoUrl} 
          alt="Braxel Markets" 
          className="h-14 md:h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <nav className="hidden lg:flex items-center gap-10">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="relative text-[10px] font-bold text-slate-400 tracking-[0.25em] uppercase font-tech group hover:text-white transition-colors"
          >
            {link.name}
            <span className="absolute bottom-[-6px] left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}
      </nav>

      <div className="hidden lg:flex items-center gap-8">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-[10px] font-bold text-slate-300 tracking-[0.15em] uppercase font-tech hover:text-[#D4AF37] transition-colors outline-none group">
            <Globe size={12} className="group-hover:rotate-12 transition-transform" />
            {i18n.language.toUpperCase()}
            <ChevronDown size={10} className="opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#080B12] border-white/10 text-white rounded-none min-w-[180px] p-0">
            <ScrollArea className="h-[300px]">
              <div className="p-1">
                {supportedLanguages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)} 
                    className={cn(
                      "hover:bg-[#D4AF37] hover:text-black cursor-pointer text-[9px] font-bold tracking-widest p-3 rounded-none transition-colors",
                      i18n.language === lang.code && "bg-white/5 text-[#D4AF37]"
                    )}
                  >
                    {lang.name.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link 
          to="/login" 
          className="text-[10px] font-bold text-white tracking-[0.2em] uppercase font-tech hover:text-[#D4AF37] transition-colors duration-300 border-l border-white/10 pl-8"
        >
          {t('nav.login')}
        </Link>
        
        <Link to="/register">
          <button className="bg-[#D4AF37] text-black text-[10px] font-black tracking-[0.25em] uppercase font-tech px-8 py-3.5 rounded-none hover:bg-white hover:-translate-y-[1px] transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            {t('nav.openAccount')}
          </button>
        </Link>
      </div>

      <button className="lg:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute top-24 left-0 w-full h-[calc(100vh-96px)] bg-black border-b border-white/10 p-10 flex flex-col gap-8 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-[11px] font-bold text-white tracking-[0.3em] uppercase font-tech"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-white/5 w-full" />
          
          <div className="space-y-4">
            <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Select Language</p>
            <div className="grid grid-cols-2 gap-4">
              {supportedLanguages.map((lang) => (
                <button 
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)} 
                  className={cn(
                    "text-[10px] font-bold tracking-widest text-left py-2", 
                    i18n.language === lang.code ? "text-[#D4AF37]" : "text-slate-400"
                  )}
                >
                  {lang.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto space-y-6">
            <Link to="/login" onClick={() => setIsOpen(false)} className="block text-[11px] font-bold text-white tracking-[0.3em] uppercase font-tech">
              {t('nav.login')}
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <button className="w-full bg-[#D4AF37] text-black text-[11px] font-black tracking-[0.3em] uppercase font-tech px-6 py-5 rounded-none">
                {t('nav.openAccount')}
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;