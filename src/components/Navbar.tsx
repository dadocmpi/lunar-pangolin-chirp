"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Plataforma', path: '/platform' },
    { name: 'Preços', path: '/pricing' },
    { name: 'Como Funciona', path: '/how-it-works' },
    { name: 'Sobre Nós', path: '/about' },
    { name: 'Contato', path: '/contact' },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled 
          ? "bg-white border-b border-slate-200 py-3 shadow-md" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-[#C5A059] font-serif text-2xl border border-[#C5A059]/30">
              B
            </div>
            <div className="flex flex-col leading-none">
              <span className={cn(
                "text-xl font-black tracking-tighter transition-colors",
                scrolled || location.pathname !== '/' ? "text-slate-900" : "text-white"
              )}>
                BRAXEL
              </span>
              <span className="text-[#C5A059] text-[10px] font-bold tracking-[0.2em]">MARKETS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-[13px] font-bold uppercase tracking-widest transition-all hover:text-[#C5A059]",
                  location.pathname === link.path 
                    ? "text-[#C5A059]" 
                    : (scrolled || location.pathname !== '/' ? "text-slate-700" : "text-slate-200")
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link to="/login">
              <span className={cn(
                "text-[13px] font-bold uppercase tracking-widest cursor-pointer hover:text-[#C5A059] transition-colors",
                scrolled || location.pathname !== '/' ? "text-slate-700" : "text-white"
              )}>
                Login
              </span>
            </Link>
            <Link to="/register">
              <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-8 h-11 text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#C5A059]/20">
                Abrir Conta
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "lg:hidden",
              scrolled || location.pathname !== '/' ? "text-slate-900" : "text-white"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-8 flex flex-col gap-6 shadow-2xl animate-in fade-in slide-in-from-top-5 duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-bold uppercase tracking-widest",
                location.pathname === link.path ? "text-[#C5A059]" : "text-slate-700"
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-slate-100" />
          <div className="flex flex-col gap-4">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full rounded-none border-slate-300 font-bold uppercase tracking-widest text-[12px]">
                Login
              </Button>
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full rounded-none bg-slate-900 hover:bg-[#C5A059] text-white font-bold uppercase tracking-widest text-[12px]">
                Abrir Conta
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;