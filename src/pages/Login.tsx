"use client";

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/dashboard';
  const plan = location.state?.plan;

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate(from, { replace: true });
          return;
        }
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
          showError(t('auth.accountNotFound'));
          navigate('/register', { state: { from, plan } });
          return;
        }
        throw error;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      navigate(from, { state: { plan } });
    } catch (error: any) {
      showError(error.message || t('auth.loginErrorMessage'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070A]">
        <Loader2 className="animate-spin text-[#C5A059]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#05070A]">
      <div className="hidden md:flex md:w-1/2 bg-black p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/10 to-transparent opacity-50" />
        
        <Link to="/" className="flex items-center gap-3.5 relative z-10">
          <img src="/logo-white.svg" alt="Braxel Markets" className="h-12 w-auto object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-white">BRAXEL</span>
            <span className="text-[#C5A059] text-[8px] font-bold tracking-[0.2em]">MARKETS</span>
          </div>
        </Link>
        
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white mb-8 leading-tight uppercase tracking-tighter">
            {t('auth.welcomeBackTitle')} <br /><span className="text-[#C5A059]">{t('auth.welcomeBackHighlight')}</span>
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
            {t('auth.loginSideDescription')}
          </p>
        </div>
        
        <div className="relative z-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Braxel Markets. {t('auth.loginSideFooter')}
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{t('auth.loginTitle')}</h1>
            <p className="text-slate-500 text-xs mt-2">{t('auth.loginSubtitle')}</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
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
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('auth.password')}</label>
                <a href="#" className="text-[9px] text-[#C5A059] hover:underline font-bold uppercase tracking-widest">{t('auth.forgotPassword')}</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password')} 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059]" 
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={cn(
                  "w-5 h-5 border-2 flex items-center justify-center transition-all",
                  rememberMe 
                    ? "bg-[#C5A059] border-[#C5A059]" 
                    : "border-white/20 bg-transparent hover:border-white/40"
                )}
              >
                {rememberMe && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6L5 9L10 3" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('auth.rememberMe')}</span>
            </div>
            
            <Button 
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : t('auth.btnAccess')}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              {t('auth.noAccount')} <Link to="/register" state={{ from, plan }} className="text-[#C5A059] hover:underline">{t('auth.registerLink')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;