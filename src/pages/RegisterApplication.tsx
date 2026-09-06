import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ApplicationForm from '@/components/ApplicationForm';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';

const RegisterApplication = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const planFromState = location.state?.plan;
    if (!planFromState) {
      navigate('/pricing');
      return;
    }
    setPlan(planFromState);
    setLoading(false);
  }, [location.state, navigate]);

  const handleApplicationSubmit = async (applicationData: any) => {
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
            // We'll also send the plan ID from the location state for verification
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
    } catch (err: any) {
      console.error('Application submission error:', err);
      setSubmitError(err.message || t('application.errors.submit_failed'));
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
                €{plan.priceEUR?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                price: €{plan.priceEUR?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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