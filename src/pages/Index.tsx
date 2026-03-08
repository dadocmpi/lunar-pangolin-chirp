"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MarketTicker from '@/components/MarketTicker';
import Footer from '@/components/Footer';

const Index = () => {
  const stats = [
    { value: "$2.4B+", label: "VOLUME TRADED" },
    { value: "12,400+", label: "ACTIVE TRADERS" },
    { value: "99.97%", label: "UPTIME SLA" },
    { value: "<1.8ms", label: "AVG LATENCY" },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <MarketTicker />

      {/* HERO SECTION */}
      <section className="relative mt-[130px] min-h-[700px] flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        {/* Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),rgba(0,0,0,0),rgba(0,0,0,0))] pointer-events-none z-[1]" />
        
        <div className="relative z-[2] text-center max-w-[900px] px-8 animate-fadeInUp">
          <div className="inline-block bg-black/50 border border-[#D4AF37] text-white px-5 py-[10px] rounded-[25px] font-tech text-[12px] font-semibold tracking-[1px] uppercase mb-8 animate-pulse-badge">
            ● INSTITUTIONAL ACCESS NOW OPEN
          </div>
          
          <h1 className="font-serif text-[40px] md:text-[80px] font-bold leading-[1.1] mb-6 tracking-[-1px] text-white">
            THE FUTURE OF
            <span className="block text-[#D4AF37]">QUANT TRADING.</span>
          </h1>
          
          <p className="font-sans text-[16px] md:text-[18px] text-[#E0E0E0] mb-10 leading-[1.8] max-w-[700px] mx-auto">
            Proprietary algorithms engineered for the modern market. Experience 
            institutional-grade execution with millisecond precision.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/register">
              <button className="bg-white text-black px-10 py-4 rounded-[50px] font-tech text-[14px] font-bold tracking-[1px] uppercase hover:bg-[#E0E0E0] hover:-translate-y-[3px] hover:shadow-[0_12px_24px_rgba(255,255,255,0.2)] transition-all duration-300">
                GET STARTED NOW
              </button>
            </Link>
            <Link to="/pricing">
              <button className="bg-transparent text-white border-2 border-white px-10 py-[14px] rounded-[50px] font-tech text-[14px] font-bold tracking-[1px] uppercase hover:bg-white hover:text-black hover:-translate-y-[3px] hover:shadow-[0_12px_24px_rgba(255,255,255,0.2)] transition-all duration-300">
                VIEW STRATEGIES
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-black py-[60px] px-8 border-y border-[#333333]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="text-center px-4 border-b lg:border-b-0 lg:border-r border-[#333333] last:border-none pb-8 lg:pb-0 hover:-translate-y-[5px] transition-transform duration-300"
            >
              <div className="font-serif text-[36px] md:text-[48px] font-bold text-[#D4AF37] mb-2 tracking-[-0.5px]">
                {stat.value}
              </div>
              <div className="font-tech text-[10px] md:text-[12px] font-semibold tracking-[1px] uppercase text-[#999999]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;