"use client";

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { functionsUrl, supabase } from '@/integrations/supabase/client';
import { notifyOwner } from '@/lib/notifyOwner';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import ProfileDetailsFields from '@/components/profile/ProfileDetailsFields';
import { saveProfile } from '@/lib/profile';
import {
  hasProfileErrors,
  validateProfile,
  type ProfileErrors,
  type ProfileFields,
} from '@/lib/profileValidation';

const EMPTY_DETAILS: ProfileFields = {
  fullName: '',
  phoneCountryCode: '',
  phone: '',
  country: '',
  street: '',
  number: '',
  complement: '',
  city: '',
  state: '',
  postalCode: '',
};

const Register = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [details, setDetails] = useState<ProfileFields>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [stepOneError, setStepOneError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/dashboard';
  const plan = location.state?.plan;

  const handleDetailsChange = (field: keyof ProfileFields, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleCountryChange = (code: string) => {
    setDetails((prev) => ({ ...prev, country: code }));
    setErrors((prev) => (prev.country ? { ...prev, country: undefined } : prev));
  };

  // ---- Step 1: create the account ----
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepOneError(null);

    if (password.length < 6) {
      setStepOneError(t('auth.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setStepOneError(t('auth.passwordMismatch'));
      return;
    }
    if (!acceptedTerms) {
      setStepOneError(t('auth.termsRequired'));
      return;
    }

    setLoading(true);
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // terms_accepted rides along so the profile trigger can stamp the
          // consent with the server clock even if the customer abandons step 2.
          data: { full_name: fullName, terms_accepted: true },
          emailRedirectTo: `${siteUrl}/auth-callback`,
        },
      });

      if (error) throw error;
      if (!data.session && !data.user) throw new Error('signup_failed');

      await notifyOwner({
        type: 'novo_cliente',
        subject: `Novo cadastro de cliente — ${fullName || email}`,
        replyTo: email,
        data: {
          nome: fullName,
          email,
          origem: 'register',
          email_confirmado: data.user?.email_confirmed_at ? 'sim' : 'não',
        },
      });

      try {
        await fetch(functionsUrl('confirm-signup'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user?.id,
            email,
            name: fullName,
            confirmationUrl: `${siteUrl}/auth-callback`,
          }),
        });
      } catch (emailError) {
        console.error('Confirmation email error:', emailError);
      }

      // Carry the name into step 2 so the customer does not retype it.
      setDetails((prev) => ({ ...prev, fullName: prev.fullName || fullName }));
      setStep(2);
    } catch (error: unknown) {
      setStepOneError(error instanceof Error ? error.message : t('auth.registerErrorMessage'));
    } finally {
      setLoading(false);
    }
  };

  // ---- Step 2: save the contact + billing details ----
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProfile(details);
    setErrors(validation);
    if (hasProfileErrors(validation)) {
      showError(t('signup.fixErrors'));
      return;
    }

    setLoading(true);
    try {
      // The step-1 checkbox is the consent; the server stamps the first
      // acceptance time so a later profile edit cannot move it.
      const result = await saveProfile(details, {
        acceptedTerms: acceptedTerms,
        acceptedPrivacy: acceptedTerms,
      });
      if (!result.ok) {
        if (result.fields) setErrors(result.fields as ProfileErrors);
        showError(t('signup.saveError'));
        return;
      }
      showSuccess(t('signup.detailsSaved'));
      navigate(from, { state: { plan }, replace: true });
    } catch (error: unknown) {
      showError(error instanceof Error ? error.message : t('signup.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2].map((n) => (
        <React.Fragment key={n}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-7 h-7 flex items-center justify-center text-[11px] font-black border',
                step >= n
                  ? 'bg-[#C5A059] border-[#C5A059] text-black'
                  : 'border-white/20 text-slate-500',
              )}
            >
              {step > n ? <Check size={14} /> : n}
            </span>
            <span
              className={cn(
                'text-[9px] font-bold uppercase tracking-widest',
                step >= n ? 'text-white' : 'text-slate-600',
              )}
            >
              {t('signup.stepLabel', { current: n, total: 2 })}
            </span>
          </div>
          {n === 1 && <div className={cn('flex-1 h-px', step > 1 ? 'bg-[#C5A059]' : 'bg-white/10')} />}
        </React.Fragment>
      ))}
    </div>
  );

  const inputClass =
    'pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059]';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#05070A]">
      <div className="hidden md:flex md:w-1/2 bg-black p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/10 to-transparent opacity-50" />

        <Link to="/" className="flex items-center gap-3.5 relative z-10">
          <img
            src="/logo-white.svg"
            alt="Braxel Markets"
            className="h-12 w-auto object-contain"
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
          {stepIndicator}

          <div className="mb-10">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('auth.accessBadge')}</span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              {step === 1 ? t('auth.registerTitle') : t('signup.step2Title')}
            </h1>
            <p className="text-slate-500 text-xs mt-2">
              {step === 1 ? t('auth.registerSubtitle') : t('signup.step2Subtitle')}
            </p>
          </div>

          {step === 1 ? (
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
                    className={inputClass}
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
                    className={inputClass}
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
                    placeholder={t('auth.passwordPlaceholder')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <Input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(v) => setAcceptedTerms(v === true)}
                  className="mt-1 border-white/20 data-[state=checked]:bg-[#C5A059] data-[state=checked]:border-[#C5A059]"
                />
                <label htmlFor="terms" className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  {t('auth.termsAgreePrefix')}{' '}
                  <Link to="/terms" className="text-[#C5A059] hover:underline" target="_blank" rel="noopener noreferrer">{t('auth.termsLink')}</Link>
                  {' '}{t('auth.termsAgreeAnd')}{' '}
                  <Link to="/privacy" className="text-[#C5A059] hover:underline" target="_blank" rel="noopener noreferrer">{t('auth.privacyLink')}</Link>.
                </label>
              </div>

              {stepOneError && (
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{stepOneError}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none"
              >
                {loading ? <Loader2 className="animate-spin" /> : t('auth.btnCreate')}
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSaveDetails}>
              <ProfileDetailsFields
                fields={details}
                errors={errors}
                onChange={handleDetailsChange}
                onCountryChange={handleCountryChange}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none"
              >
                {loading ? <Loader2 className="animate-spin" /> : t('signup.finish')}
              </Button>

              <p className="text-[9px] text-slate-600 text-center leading-relaxed">
                {t('signup.requiredHint')}
              </p>
            </form>
          )}

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
