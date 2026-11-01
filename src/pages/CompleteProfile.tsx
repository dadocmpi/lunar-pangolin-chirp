"use client";

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useTranslation } from 'react-i18next';
import ProfileDetailsFields from '@/components/profile/ProfileDetailsFields';
import { fetchProfile, saveProfile } from '@/lib/profile';
import {
  hasProfileErrors,
  toProfileFields,
  validateProfile,
  type ProfileErrors,
  type ProfileFields,
} from '@/lib/profileValidation';

const EMPTY: ProfileFields = {
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

/**
 * Step 2 of the signup, also reachable on its own. A customer who closed the
 * page before finishing is sent here on their next login (the login flow reads
 * profile_completed). Completing it returns them to where they were headed.
 */
const CompleteProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [details, setDetails] = useState<ProfileFields>(EMPTY);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const from = location.state?.from || '/dashboard';
  const plan = location.state?.plan;

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login', { state: { from, plan }, replace: true });
        return;
      }
      try {
        const profile = await fetchProfile(user.id);
        const base = profile ? toProfileFields(profile.raw) : EMPTY;
        // Fall back to the auth metadata name when the profile has none yet.
        setDetails({
          ...base,
          fullName: base.fullName || (user.user_metadata?.full_name as string) || '',
        });
      } catch (err) {
        console.error('Complete profile load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate, from, plan]);

  const handleChange = (field: keyof ProfileFields, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProfile(details);
    setErrors(validation);
    if (hasProfileErrors(validation)) {
      showError(t('signup.fixErrors'));
      return;
    }
    setSaving(true);
    try {
      const result = await saveProfile(details);
      if (!result.ok) {
        if (result.fields) setErrors(result.fields as ProfileErrors);
        showError(t('signup.saveError'));
        return;
      }
      showSuccess(t('signup.detailsSaved'));
      navigate(from, { state: { plan }, replace: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={40} />
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
            {t('signup.step2Title')}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
            {t('signup.step2SideDescription')}
          </p>
        </div>
        <div className="relative z-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Braxel Markets. {t('auth.registerSideFooter')}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-7 h-7 flex items-center justify-center text-[11px] font-black border bg-[#C5A059] border-[#C5A059] text-black">2</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white">
              {t('signup.stepLabel', { current: 2, total: 2 })}
            </span>
          </div>

          <div className="mb-10">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('auth.accessBadge')}</span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{t('signup.step2Title')}</h1>
            <p className="text-slate-500 text-xs mt-2">{t('signup.step2Subtitle')}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <ProfileDetailsFields
              fields={details}
              errors={errors}
              onChange={handleChange}
            />
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none"
            >
              {saving ? <Loader2 className="animate-spin" /> : t('signup.finish')}
            </Button>
            <p className="text-[9px] text-slate-600 text-center leading-relaxed">{t('signup.requiredHint')}</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
