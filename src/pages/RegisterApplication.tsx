import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApplicationForm, { type PlanInfo } from '@/components/ApplicationForm';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';

// Canonical monthly USD prices / managed capital, mirroring
// supabase/functions/_shared/plans.ts. The server is the source of truth for
// amounts; these values are display-only fallbacks when no plan is passed.
const FALLBACK_PLANS: Record<string, PlanInfo> = {
  starter: { id: 'starter', name: 'Starter', price: 200, priceUSD: 200, accountSize: '25,000', iconType: 'zap' },
  professional: { id: 'professional', name: 'Professional', price: 350, priceUSD: 350, accountSize: '50,000', iconType: 'award' },
  business: { id: 'business', name: 'Business', price: 600, priceUSD: 600, accountSize: '100,000', iconType: 'shield' },
  enterprise: { id: 'enterprise', name: 'Enterprise', price: 820, priceUSD: 820, accountSize: '150,000', iconType: 'crown' },
};

const resolvePlan = (candidate: unknown): PlanInfo | null => {
  if (!candidate || typeof candidate !== 'object') return null;
  const c = candidate as { id?: unknown; plan_key?: unknown };
  const key = typeof c.id === 'string' ? c.id : typeof c.plan_key === 'string' ? c.plan_key : null;
  if (!key || !FALLBACK_PLANS[key]) return null;
  const base = FALLBACK_PLANS[key];
  const src = candidate as Partial<PlanInfo>;
  return {
    ...base,
    name: typeof src.name === 'string' && src.name ? src.name : base.name,
    priceUSD: typeof src.priceUSD === 'number' ? src.priceUSD : base.priceUSD,
    accountSize: typeof src.accountSize === 'string' ? src.accountSize : base.accountSize,
    iconType: typeof src.iconType === 'string' ? src.iconType : base.iconType,
    features: Array.isArray(src.features) ? src.features : base.features,
    popular: src.popular ?? base.popular,
  };
};

const RegisterApplication = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Render the real application form even when no plan was carried over from
  // the pricing page (direct visit / refresh). Falls back to the query string,
  // then to Starter, instead of bouncing the visitor back to /pricing.
  useEffect(() => {
    const planKeyFromQuery = new URLSearchParams(location.search).get('plan');
    const resolved =
      resolvePlan(location.state?.plan) ??
      resolvePlan({ id: planKeyFromQuery }) ??
      FALLBACK_PLANS.starter;
    setPlan(resolved);
    setLoading(false);
  }, [location.state, location.search]);

  const handleApplicationSubmit = async (applicationData: Record<string, unknown>) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Call the application submission Edge Function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Unauthorized');
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/application-submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ...applicationData,
            // Location-state plan reference for verification only.
            plan_id_from_location: plan.id,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }

      // Assuming the function returns the application ID
      if (json.application_id) {
        setApplicationId(json.application_id);
        // Navigate to checkout with the application ID in state
        navigate('/checkout', { state: { applicationId: json.application_id } });
      } else {
        throw new Error('No application ID returned');
      }
    } catch (err: unknown) {
      console.error('Application submission error:', err);
      setSubmitError(err instanceof Error ? err.message : t('application.errors.submit_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !plan) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
        <div className="mb-8">
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('nav.pricing')}</span>
          </a>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tighter">
            {t('application.title')} <span className="text-[#C5A059]">{t('application.subtitle')}</span>
          </h1>
        </div>

        <div className="bg-[#080B12] border border-white/10 p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div>
              <h2 className="font-bold text-2xl uppercase tracking-tight">
                {plan.name}
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                {t('application.plan_selected')}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-serif font-bold text-[#C5A059]">
                {plan.priceUSD?.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
              </span>
              <p className="text-[9px] text-slate-600 uppercase tracking-widest">
                {t('application.billed_monthly')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-slate-400">
              {t('application.plan_description', { plan: plan.name })}
            </p>
            <p className="text-[10px] text-slate-400">
              {t('application.plan_price_detail', {
                price: plan.priceUSD?.toLocaleString(undefined, { style: 'currency', currency: 'USD' }),
              })}
            </p>
          </div>
        </div>

        {submitError && (
          <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-300 text-[10px] font-bold uppercase tracking-widest">
            {submitError}
          </div>
        )}

        <ApplicationForm
          plan={plan}
          onSubmit={handleApplicationSubmit}
        />
      </div>

      <Footer />
    </div>
  );
};

export default RegisterApplication;