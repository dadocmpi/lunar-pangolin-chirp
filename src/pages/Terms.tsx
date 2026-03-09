"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <section className="relative h-[40vh] flex items-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <img 
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop" 
            alt="Los Angeles" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070A]/80 to-[#05070A]" />
        </div>
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Legal</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Terms of <br /><span className="text-[#C5A059]">Service</span></h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20">
        <section className="border border-white/10 bg-[#080B12] p-12 md:p-16">
          <div className="max-w-4xl mx-auto space-y-12 text-slate-400 text-sm leading-relaxed">
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using the Braxel Markets platform, you agree to comply with and be bound by the following terms and conditions of use. If you do not agree with any part of these terms, you should not use our services.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">2. Nature of Services</h2>
              <p>Braxel Markets provides technological infrastructure for investment strategy automation. We are not a stockbroker or individualized financial consultancy. Use of the platform implies understanding the risks inherent in the financial market.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">3. User Responsibility</h2>
              <p>The user is entirely responsible for the security of their access credentials and for capital allocation decisions within the plans offered by the platform.</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;