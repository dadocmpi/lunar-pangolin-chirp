"use client";

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { classifyLinkError, isRecoveryRedirect, readLinkError } from '@/lib/authFlow';

type Phase = 'loading' | 'ready' | 'invalid';

// A recovery session survives a page refresh, but a normal signed-in session
// must never be treated as one: only a session established from a recovery
// link (or a refresh of it) may set a new password.
const RECOVERY_FLAG = 'braxel-recovery-session';

const hasRecoveryFlag = () => {
  try {
    return sessionStorage.getItem(RECOVERY_FLAG) === '1';
  } catch {
    return false;
  }
};

const setRecoveryFlag = () => {
  try {
    sessionStorage.setItem(RECOVERY_FLAG, '1');
  } catch {
    // Storage can be unavailable in private mode; the URL still proves it.
  }
};

const clearRecoveryFlag = () => {
  try {
    sessionStorage.removeItem(RECOVERY_FLAG);
  } catch {
    // Nothing to clear.
  }
};

const RESET_ERROR_KEY = {
  expired: 'auth.resetLinkExpired',
  used: 'auth.resetLinkUsed',
  invalid: 'auth.resetInvalidLink',
} as const;

/**
 * Completes the password-reset flow.
 *
 * Supabase redirects the recovery link here with either a PKCE `?code=` or an
 * implicit `#access_token=...&type=recovery` fragment. Both produce a session
 * that may ONLY be used to set a new password — after that we sign out and send
 * the customer back to the login screen.
 */
const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phase, setPhase] = useState<Phase>('loading');
  const [invalidKey, setInvalidKey] = useState('auth.resetInvalidLink');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setPhase('invalid');
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const fail = (key: string) => {
      if (cancelled) return;
      setInvalidKey(key);
      setPhase('invalid');
    };

    const failFromError = (error: { code?: string; message?: string } | null) => {
      fail(RESET_ERROR_KEY[classifyLinkError(error ?? {})]);
    };

    const establish = async (): Promise<boolean> => {
      const { data } = await supabase.auth.getSession();
      return Boolean(data.session);
    };

    const init = async () => {
      // An expired or already-used link carries the failure in the URL.
      const linkError = readLinkError(window.location.hash, window.location.search);
      if (linkError) {
        failFromError({ code: linkError.code, message: linkError.description });
        return;
      }

      const recoveryUrl = isRecoveryRedirect(window.location.hash, window.location.search);
      const code = searchParams.get('code');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          // A refresh re-sends the same (already consumed) code; the recovery
          // session persisted from the first visit is the real signal.
          if (!(await establish()) || !(recoveryUrl || hasRecoveryFlag())) {
            failFromError(error);
            return;
          }
        }
        if (await establish()) {
          setRecoveryFlag();
          setPhase('ready');
          return;
        }
        failFromError(error);
        return;
      }

      if ((await establish()) && (recoveryUrl || hasRecoveryFlag())) {
        setRecoveryFlag();
        setPhase('ready');
        return;
      }

      // Implicit links are parsed asynchronously by supabase-js; wait for the
      // recovery event instead of racing it.
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) {
          setRecoveryFlag();
          setPhase('ready');
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();

      timer = setTimeout(async () => {
        if (cancelled) return;
        if ((await establish()) && (recoveryUrl || hasRecoveryFlag())) {
          setRecoveryFlag();
          setPhase('ready');
        } else {
          fail('auth.resetInvalidLink');
        }
      }, 3000);
    };

    init();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribe?.();
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      showError(t('auth.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      showError(t('auth.passwordMismatch'));
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // A recovery session must not keep terminal access; the customer signs in
      // again with the new password.
      clearRecoveryFlag();
      await supabase.auth.signOut();
      showSuccess(t('auth.resetSuccess'));
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Password reset failed:', error);
      showError(t('auth.resetError'));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059]';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] p-8">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-3.5 mb-8">
            <img src="/logo-white.svg" alt="Braxel Markets" className="h-10 w-auto object-contain" />
          </Link>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            {t('auth.resetTitle')}
          </h1>
          <p className="text-slate-500 text-xs mt-2">{t('auth.resetSubtitle')}</p>
        </div>

        {phase === 'loading' && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#C5A059]" size={32} />
          </div>
        )}

        {phase === 'invalid' && (
          <div className="space-y-6 text-center">
            <AlertCircle className="mx-auto text-red-400" size={40} />
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              {t(invalidKey)}
            </p>
            <Button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
            >
              {t('authCallback.goToLogin')}
            </Button>
          </div>
        )}

        {phase === 'ready' && (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('auth.newPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.newPassword')}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('auth.confirmNewPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmNewPassword')}
                  className={inputClass}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none"
            >
              {saving ? <Loader2 className="animate-spin" /> : (
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} /> {t('auth.resetSubmit')}
                </span>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
