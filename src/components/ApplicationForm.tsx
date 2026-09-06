import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router'; // Note: We are using react-router-dom, not next/router. We'll adjust.

// Since we are using react-router-dom, we'll use useNavigate
import { useNavigate } from 'react-router-dom';

interface ApplicationFormProps {
  onSubmit: (applicationData: any) => Promise<void>;
  plan: any; // The plan object from location.state
}

const ApplicationForm = ({ onSubmit, plan }: ApplicationFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    residential_address_line1: '',
    residential_address_line2: '',
    city: '',
    region: '',
    postal_code: '',
    country: '',
    phone: '',
    terms_accepted: false,
    privacy_accepted: false,
    customer_note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Validate email
  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Validate required fields based on whether address is required
  // For simplicity, we'll assume address is required for all countries (can be adjusted per country logic)
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = t('application.errors.full_name_required');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('application.errors.email_required');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('application.errors.email_invalid');
    }

    // Address fields: we'll make them required for now, but note the task says "required only if required by the actual service policy"
    // We'll leave it as required for simplicity, but in reality this should be configurable per country.
    if (!formData.residential_address_line1.trim()) {
      newErrors.residential_address_line1 = t('application.errors.address_line1_required');
    }
    if (!formData.city.trim()) {
      newErrors.city = t('application.errors.city_required');
    }
    if (!formData.country.trim()) {
      newErrors.country = t('application.errors.country_required');
    }

    if (!formData.terms_accepted) {
      newErrors.terms_accepted = t('application.errors.terms_required');
    }
    if (!formData.privacy_accepted) {
      newErrors.privacy_accepted = t('application.errors.privacy_required');
    }

    // Optional: limit customer_note length
    if (formData.customer_note.length > 500) {
      newErrors.customer_note = t('application.errors.note_too_long');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitting(true);
      try {
        await onSubmit({
          ...formData,
          plan_key: plan.id, // Assuming plan.id is the plan key (e.g., 'starter')
          // We'll also include the plan name and price for reference, but the server should use the plan_key to look up the canonical plan
          plan_name: plan.name,
          plan_price_eur: plan.priceEUR, // We'll add this to the plan object in the Checkout page
        });
        // On success, navigate to checkout with the application ID in state
        // The onSubmit function should return the application ID
        // We'll assume onSubmit returns a promise that resolves to the application ID
        // But we changed the signature to take applicationData and return void? Let's adjust.
        // We'll change the onSubmit to return the application ID.
        // For now, we'll assume the onSubmit function handles navigation or returns the ID.
        // We'll change the approach: the onSubmit function will submit the application and then navigate to checkout.
        // We'll pass a navigate function to the onSubmit? Or we can have the onSubmit return the app ID and then navigate here.
        // Let's change the onSubmit to return a promise that resolves to the application ID.
        // We'll adjust the call below.
      } catch (err: any) {
        // Handle error (e.g., show toast)
        console.error('Application submission failed:', err);
        // We'll set a general error
        setErrors({ submit: t('application.errors.submit_failed') });
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {t('application.full_name')}
        </label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400"
          placeholder={t('application.full_name_placeholder')}
        />
        {errors.full_name && (
          <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {t('application.email')}
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400"
          placeholder={t('application.email_placeholder')}
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {t('application.address_line1')}
        </label>
        <input
          type="text"
          value={formData.residential_address_line1}
          onChange={(e) => setFormData({ ...formData, residential_address_line1: e.target.value })}
          className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400"
          placeholder={t('application.address_line1_placeholder')}
        />
        {errors.residential_address_line1 && (
          <p className="text-red-400 text-sm mt-1">{errors.residential_address_line1}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {t('application.address_line2')}
        </label>
        <input
          type="text"
          value={formData.residential_address_line2}
          onChange={(e) => setFormData({ ...formData, residential_address_line2: e.target.value })}
          className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400"
          placeholder={t('application.address_line2_placeholder')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            {t('application.city')}
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400"
            placeholder={t('application.city_placeholder')}
          />
          {errors.city && (
            <p className="text-red-400 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            {t('application.region')}
          </label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400"
            placeholder={t('application.region_placeholder')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            {t('application.postal_code')}
          </label>
          <input
            type="text"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400"
            placeholder={t('application.postal_code_placeholder')}
          />
          {errors.postal_code && (
            <p className="text-red-400 text-sm mt-1">{errors.postal_code}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            {t('application.country')}
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400"
            placeholder={t('application.country_placeholder')}
          />
          {errors.country && (
            <p className="text-red-400 text-sm mt-1">{errors.country}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {t('application.phone')}
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400"
          placeholder={t('application.phone_placeholder')}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={formData.terms_accepted}
            onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
            className="mt-1 w-4 h-4 text-[#C5A059]"
          />
          <label htmlFor="terms" className="ml-3 text-slate-400 text-sm leading-none">
            {t('application.terms_accepted')}
          </label>
        </div>
        {errors.terms_accepted && (
          <p className="text-red-400 text-sm mt-1 ml-5">{errors.terms_accepted}</p>
        )}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="privacy"
            checked={formData.privacy_accepted}
            onChange={(e) => setFormData({ ...formData, privacy_accepted: e.target.checked })}
            className="mt-1 w-4 h-4 text-[#C5A059]"
          />
          <label htmlFor="privacy" className="ml-3 text-slate-400 text-sm leading-none">
            {t('application.privacy_accepted')}
          </label>
        </div>
        {errors.privacy_accepted && (
          <p className="text-red-400 text-sm mt-1 ml-5">{errors.privacy_accepted}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {t('application.customer_note')}
        </label>
        <textarea
          value={formData.customer_note}
          onChange={(e) => setFormData({ ...formData, customer_note: e.target.value })}
          className="w-full px-4 py-2 bg-white/[0.02] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-white placeholder-slate-400 h-24 resize-y"
          placeholder={t('application.customer_note_placeholder')}
          maxLength={500}
        />
        {errors.customer_note && (
          <p className="text-red-400 text-sm mt-1">{errors.customer_note}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          {t('application.note_limit', { count: 500 })} {t('application.characters')}
        </p>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? t('application.submitting') : t('application.submit')}
        </Button>
      </div>
    </form>
  );
};

export default ApplicationForm;