"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'PRICING', path: '/pricing' },
    { name: 'HOW IT WORKS', path: '/how-it-works' },
    { name: 'ABOUT US', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-20 bg-black border-b border-[#333333] z-[1000] px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-[10px]">
        <div className="w-[30px] h-[30px] bg-white rounded-[2px] flex items-center justify-center text-black font-bold text-lg">
          B
        </div>
        <span className="text-[18px] font-bold text-white tracking-[2px] font-sans">
          BRAXEL MARKETS
        </span>
      </Link>

      {/* Desktop Menu */}
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
        <Link 
          to="/login" 
          className="text-[12px] font-semibold text-white tracking-[1px] uppercase font-tech hover:text-[#D4AF37] transition-colors duration-300"
        >
          LOGIN
        </Link>
        <Link to="/register">
          <button className="bg-[#D4AF37] text-black text-[12px] font-bold tracking-[1px] uppercase font-tech px-6 py-3 rounded-[25px] hover:bg-[#C9A227] hover:-translate-y-[2px] hover:shadow-[0_8px_16px_rgba(212,175,55,0.3)] transition-all duration-300">
            OPEN ACCOUNT
          </button>
        </Link>
      </div>

      {/* Mobile Toggle */}
      <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
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
          <Link to="/login" className="text-[12px] font-semibold text-white tracking-[1px] uppercase font-tech">
            LOGIN
          </Link>
          <Link to="/register">
            <button className="w-full bg-[#D4AF37] text-black text-[12px] font-bold tracking-[1px] uppercase font-tech px-6 py-3 rounded-[25px]">
              OPEN ACCOUNT
            </button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;