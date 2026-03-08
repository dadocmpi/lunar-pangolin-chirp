"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
    { name: 'Pricing', path: '/pricing' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-black/90 backdrop-blur-md border-b border-white/5 py-2 shadow-xl" 
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-serif text-xl border border-[#C5A059]/50">
              B
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tighter text-white">
                BRAXEL
              </span>
              <span className="text-[#C5A059] text-[8px] font-bold tracking-[0.2em]">MARKETS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-all hover:text-[#C5A059]",
                  location.pathname === link.path ? "text-[#C5A059]" : "text-slate-400"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link to="/login">
              <span className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-slate-400 hover:text-[#C5A059] transition-colors">
                Login
              </span>
            </Link>
            <Link to="/register">
              <Button className="bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none px-6 h-10 text-[10px] font-bold uppercase tracking-widest transition-all border-none">
                Open Account
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 flex flex-col gap-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                location.pathname === link.path ? "text-[#C5A059]" : "text-slate-400"
              )}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-white/5" />
          <div className="flex flex-col gap-3">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full rounded-none border-white/10 text-white font-bold uppercase tracking-widest text-[10px] h-10">
                Login
              </Button>
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full rounded-none bg-[#C5A059] hover:bg-[#B08D48] text-white font-bold uppercase tracking-widest text-[10px] h-10">
                Open Account
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;