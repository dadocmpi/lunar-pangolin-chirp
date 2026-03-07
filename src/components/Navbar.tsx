"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
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
    { name: 'Início', path: '/' },
    { name: 'Plataforma', path: '/platform' },
    { name: 'Preços', path: '/pricing' },
    { name: 'Como Funciona', path: '/how-it-works' },
    { name: 'Sobre Nós', path: '/about' },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/90 backdrop-blur-md border-slate-200 py-3 shadow-sm" 
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-amber-400 font-bold text-xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300 shadow-lg shadow-amber-500/10">
              B
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight transition-colors",
              scrolled || location.pathname !== '/' ? "text-slate-900" : "text-white"
            )}>
              BRAXEL <span className="text-amber-500">MARKETS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-amber-500",
                  location.pathname === link.path 
                    ? "text-amber-500" 
                    : (scrolled || location.pathname !== '/' ? "text-slate-600" : "text-slate-200")
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className={cn(
                "font-semibold hover:text-amber-500",
                scrolled || location.pathname !== '/' ? "text-slate-600" : "text-white"
              )}>
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full px-6 font-bold border-none">
                Começar <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden",
              scrolled || location.pathname !== '/' ? "text-slate-900" : "text-white"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-lg font-bold py-2",
                location.pathname === link.path ? "text-amber-500" : "text-slate-600"
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-slate-100 my-2" />
          <div className="flex flex-col gap-3">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-center font-bold">
                Entrar
              </Button>
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full justify-center bg-slate-900 hover:bg-amber-500 text-white font-bold">
                Começar
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;