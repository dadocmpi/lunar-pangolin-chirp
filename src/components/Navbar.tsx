"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
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
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white flex items-center justify-center text-black font-serif text-2xl border border-[#C5A059]/50">
              B
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tighter text-white">
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
                  "text-[12px] font-bold uppercase tracking-widest transition-all hover:text-[#C5A059]",
                  location.pathname === link.path ? "text-[#C5A059]" : "text-slate-300"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link to="/login">
              <span className="text-[12px] font-bold uppercase tracking-widest cursor-pointer text-slate-300 hover:text-[#C5A059] transition-colors">
                Login
              </span>
            </Link>
            <Link to="/register">
              <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-8 h-11 text-[11px] font-bold uppercase tracking-widest transition-all border-none">
                Abrir Conta
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 p-8 flex flex-col gap-6 shadow-2xl animate-in fade-in slide-in-from-top-5 duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-bold uppercase tracking-widest",
                location.pathname === link.path ? "text-[#C5A059]" : "text-slate-300"
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-white/10" />
          <div className="flex flex-col gap-4">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full rounded-none border-white/20 text-white font-bold uppercase tracking-widest text-[11px]">
                Login
              </Button>
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full rounded-none bg-[#C5A059] hover:bg-[#B08D48] text-white font-bold uppercase tracking-widest text-[11px]">
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