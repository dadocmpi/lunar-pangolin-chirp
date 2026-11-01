"use client";

import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ProfileDetailsFields from "@/components/profile/ProfileDetailsFields";
import type { ProfileErrors, ProfileFields } from "@/lib/profileValidation";

export interface BillingDetails extends ProfileFields {
  email: string;
}

interface Props {
  billing: BillingDetails;
  errors: ProfileErrors;
  updateProfile: boolean;
  onChange: (field: keyof BillingDetails, value: string) => void;
  onCountryChange: (code: string) => void;
  onUpdateProfileChange: (value: boolean) => void;
}

/**
 * Billing details shown at checkout, pre-filled from the customer's profile and
 * freely editable for this purchase. The values are sent to the server, which
 * passes them to Stripe (customer + billing_details) so they appear on the
 * payment and the receipt.
 */
export default function CheckoutBillingForm({
  billing,
  errors,
  updateProfile,
  onChange,
  onCountryChange,
  onUpdateProfileChange,
}: Props) {
  const { t } = useTranslation();

  const addressFields: ProfileFields = {
    fullName: billing.fullName,
    phoneCountryCode: billing.phoneCountryCode,
    phone: billing.phone,
    country: billing.country,
    street: billing.street,
    number: billing.number,
    complement: billing.complement,
    city: billing.city,
    state: billing.state,
    postalCode: billing.postalCode,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white border-l-2 border-[#C5A059] pl-3">
          {t("checkoutBilling.title")}
        </h4>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
          {t("checkoutBilling.description")}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {t("checkoutBilling.email")}
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <Input
            type="email"
            value={billing.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="pl-12 bg-white/5 border-white/10 rounded-none h-12 text-[13px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059]"
          />
        </div>
      </div>

      <ProfileDetailsFields
        fields={addressFields}
        errors={errors}
        onChange={(field, value) => onChange(field, value)}
        onCountryChange={onCountryChange}
        showFullName
      />

      <label className="flex items-start gap-3 cursor-pointer p-4 bg-white/[0.02] border border-white/10">
        <Checkbox
          checked={updateProfile}
          onCheckedChange={(v) => onUpdateProfileChange(v === true)}
          className="mt-0.5 border-white/20 data-[state=checked]:bg-[#C5A059] data-[state=checked]:border-[#C5A059]"
        />
        <span className="text-[9px] text-slate-400 leading-relaxed uppercase tracking-widest">
          {t("checkoutBilling.updateProfile")}
        </span>
      </label>
    </div>
  );
}
