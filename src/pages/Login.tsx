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
  const [loading, setLoading] = useState(true); // Start with loading true
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/dashboard';
  const plan = location.state?.plan;
  const logoUrl = "https://image2url.com/r2/default/images/1773617984273-e9d2f7a5-3691-45a6-81e2-12c734f51a8f.png";

  // Check for existing session and restore if valid
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check if remember me was set
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        const sessionExpiry = localStorage.getItem('sessionExpiry');
        
        // Check if session is still valid (30 days)
        const isSessionValid = sessionExpiry && parseInt(sessionExpiry) > Date.now();
        
        if (isSessionValid && rememberedEmail) {
          // Restore email
          setEmail(rememberedEmail);
          setRememberMe(true);
          
          // Check Supabase session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session && !error) {
            // Session exists, redirect to dashboard
            navigate('/dashboard');
            return;
          }
        }
        
        // Load saved email if exists (for when session expired but user wants to re-login)
        if (rememberedEmail && !isSessionValid) {
          setEmail(rememberedEmail);
        }
      } catch (err) {
        console.error('Session restore error:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [navigate]);

  // Clean up expired sessions
  useEffect(() => {
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (sessionExpiry && parseInt(sessionExpiry) < Date.now()) {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('sessionExpiry');
      setRememberMe(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if it's a "Invalid login credentials" error
        if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
          showError("Account not found. Please create an account first.");
          navigate('/register', { state: { from, plan } });
          return;
        }
        throw error;
      }

      // Handle remember me - set 30 days expiry
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('sessionExpiry', (Date.now() + 30 * 24 * 60 * 60 * 1000).toString());
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('sessionExpiry');
      }

      showSuccess("Login successful!");
      navigate(from, { state: { plan } });
    } catch (error: any) {
      showError(error.message || "Error logging in.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
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
        
        <Link to="/" className="flex items-center gap-4 relative z-10">
          <img src={logoUrl} alt="Braxel Markets" className="h-16 w-auto object-contain" />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-white">BRAXEL</span>
            <span className="text-[#C5A059] text-[8px] font-bold tracking-[0.2em]">MARKETS</span>
          </div>
        </Link>
        
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white mb-8 leading-tight uppercase tracking-tighter">
            Welcome <br /><span className="text-[#C5A059]">Back</span>
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
            Access your investment infrastructure and monitor your performance in real-time.
          </p>
        </div>
        
        <div className="relative z-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Braxel Markets. Secure Access.
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Security</span>
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
                  placeholder="email@example.com" 
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
                  placeholder="••••••••" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059]" 
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
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
              {t('auth.noAccount')} <Link to="/register" state={{ from, plan }} className="text-[#C5A059] hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;