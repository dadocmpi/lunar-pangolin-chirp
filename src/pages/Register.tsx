"use client";

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/dashboard';
  const plan = location.state?.plan;
  const logoUrl = "https://image2url.com/r2/default/images/1773617984273-e9d2f7a5-3691-45a6-81e2-12c734f51a8f.png";

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
          },
          persistSession: true, // Enable session persistence
        }
      });

      if (error) throw error;

      showSuccess(t('auth.registerSuccessMessage'));
      navigate('/login', { state: { from, plan } });
    } catch (error: any) {
      showError(error.message || t('auth.registerErrorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#05070A]">
      <div className="hidden md:flex md:w-1/2 bg-black p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/10 to-transparent opacity-50" />
        
        <Link to="/" className="flex items-center gap-4 relative z-10">
          <img 
            src={logoUrl} 
            alt="Braxel Markets" 
            className="h-16 w-auto object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-white">
              BRAXEL
            </span>
            <span className="text-[#C5A059] text-[8px] font-bold tracking-[0.2em]">MARKETS</span>
          </div>
        </Link>
        
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white mb-8 leading-tight uppercase tracking-tighter">
            {t('auth.futureTitle')} <br /><span className="text-[#C5A059]">{t('auth.futureSubtitle')}</span>
          </h2>
          <ul className="space-y-6">
            {(t('auth.features', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                <ShieldCheck className="text-[#C5A059]" size={20} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="relative z-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Braxel Markets. {t('auth.registerSideFooter')}
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('auth.accessBadge')}</span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{t('auth.registerTitle')}</h1>
            <p className="text-slate-500 text-xs mt-2">{t('auth.registerSubtitle')}</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('auth.fullName')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder')} 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059]" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')} 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059]" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059]" 
                />
              </div>
            </div>
            
            <div className="flex items-start gap-3 py-2">
              <Checkbox id="terms" required className="mt-1 border-white/20 data-[state=checked]:bg-[#C5A059] data-[state=checked]:border-[#C5A059]" />
              <label htmlFor="terms" className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                {t('auth.termsAgree')}
              </label>
            </div>
            
            <Button 
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : t('auth.btnCreate')}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              {t('auth.hasAccount')} <Link to="/login" state={{ from, plan }} className="text-[#C5A059] hover:underline">{t('auth.loginLink')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
