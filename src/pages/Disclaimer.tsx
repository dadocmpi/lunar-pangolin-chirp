"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Disclaimer = () => {
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
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Risk</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">Financial <br /><span className="text-[#C5A059]">Disclaimer</span></h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-20">
        <section className="border border-white/10 bg-[#080B12] p-12 md:p-16">
          <div className="max-w-4xl mx-auto space-y-12 text-slate-400 text-sm leading-relaxed">
            <div className="p-8 border-l-2 border-[#C5A059] bg-white/5">
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Important Risk Warning</h2>
              <p>Investment in financial markets involves substantial risks and can result in the total loss of invested capital. Past performance is no guarantee of future results.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">No Advice</h2>
              <p>The content of this site and the services provided by Braxel Markets do not constitute financial, legal, or tax advice. We recommend that each investor seek independent professional guidance before making investment decisions.</p>
            </div>
            <div>
              <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Limitation of Liability</h2>
              <p>Braxel Markets is not responsible for financial losses resulting from the use of our automation technology or market fluctuations.</p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Disclaimer;