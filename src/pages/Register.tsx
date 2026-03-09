"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      showSuccess("Account created successfully! Please check your email to confirm.");
      navigate('/login');
    } catch (error: any) {
      showError(error.message || "Error creating account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#05070A]">
      <div className="hidden md:flex md:w-1/2 bg-black p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/10 to-transparent opacity-50" />
        
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white flex items-center justify-center text-black font-serif text-xl border border-[#C5A059]/50">
            B
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-white">
              BRAXEL
            </span>
            <span className="text-[#C5A059] text-[8px] font-bold tracking-[0.2em]">MARKETS</span>
          </div>
        </Link>
        
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white mb-8 leading-tight uppercase tracking-tighter">
            The Future of <br /><span className="text-[#C5A059]">Investment</span>
          </h2>
          <ul className="space-y-6">
            {[
              "Institutional-grade algorithms",
              "Advanced capital protection",
              "Millisecond execution",
              "Total transparency of operations"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                <ShieldCheck className="text-[#C5A059]" size={20} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="relative z-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Braxel Markets. Institutional Infrastructure.
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-bold text-lg">
              B
            </div>
            <span className="text-lg font-black tracking-tighter text-white">
              BRAXEL <span className="text-[#C5A059]">MARKETS</span>
            </span>
          </Link>
          
          <div className="mb-10">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Access</span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Create Account</h1>
            <p className="text-slate-500 text-xs mt-2">Start your journey in the institutional market.</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059] transition-colors" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059] transition-colors" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059] transition-colors" 
                />
              </div>
            </div>
            
            <div className="flex items-start gap-3 py-2">
              <Checkbox id="terms" required className="mt-1 border-white/20 data-[state=checked]:bg-[#C5A059] data-[state=checked]:border-[#C5A059]" />
              <label htmlFor="terms" className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                I agree to the <Link to="/terms" className="text-[#C5A059] hover:underline">Terms</Link> and <Link to="/privacy" className="text-[#C5A059] hover:underline">Privacy</Link>.
              </label>
            </div>
            
            <Button 
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : "CREATE MY ACCOUNT"}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Already have access? <Link to="/login" className="text-[#C5A059] hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;