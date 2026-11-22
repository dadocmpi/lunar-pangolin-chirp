import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { COUNTRIES, DIAL_COUNTRIES } from "@/lib/countries";
import type {
  CheckoutCustomerFields,
  CheckoutErrorCode,
  CheckoutErrors,
  CheckoutFieldKey,
} from "@/lib/checkout";

interface Props {
  fields: CheckoutCustomerFields;
  errors: CheckoutErrors;
  updateProfile: boolean;
  onChange: (field: CheckoutFieldKey, value: string) => void;
  onUpdateProfileChange: (value: boolean) => void;
}

const inputClass =
  "bg-white/5 border-white/10 rounded-none h-12 text-[13px] font-medium text-white placeholder:text-slate-700 focus-visible:border-[#C5A059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/60";
const selectClass =
  "h-12 w-full rounded-none border border-white/10 bg-[#0B0E14] px-3 text-[13px] font-medium text-white focus-visible:border-[#C5A059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/60";
const labelClass = "text-[10px] font-bold uppercase tracking-widest text-slate-400";

const LABEL_KEYS: Partial<Record<CheckoutFieldKey, string>> = {
  firstName: "checkoutPage.firstName",
  lastName: "checkoutPage.lastName",
  email: "checkoutPage.email",
  city: "profileFields.city",
  state: "profileFields.state",
  postalCode: "profileFields.postalCode",
};

function labelKeyFor(key: string): string {
  return LABEL_KEYS[key as CheckoutFieldKey] ?? `profileFields.${key}`;
}

function errorKey(code: CheckoutErrorCode): string {
  return code === "invalid_email"
    ? "checkoutPage.errors.invalidEmail"
    : `profileFields.errors.${code}`;
}

function FieldError({ id, code }: { id: string; code?: CheckoutErrorCode }) {
  const { t } = useTranslation();
  if (!code) return null;
  return (
    <p
      id={id}
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400"
    >
      <AlertCircle size={12} aria-hidden="true" />
      {t(errorKey(code))}
    </p>
  );
}

export default function CheckoutCustomerForm({
  fields,
  errors,
  updateProfile,
  onChange,
  onUpdateProfileChange,
}: Props) {
  const { t } = useTranslation();

  const field = (
    key: CheckoutFieldKey,
    opts: { type?: string; autoComplete?: string; required?: boolean; optional?: boolean } = {},
  ) => {
    const describedBy = errors[key] ? `checkout-${key}-error` : undefined;
    return (
      <>
        <Input
          id={`checkout-${key}`}
          type={opts.type ?? "text"}
          value={fields[key]}
          onChange={(e) => onChange(key, e.target.value)}
          autoComplete={opts.autoComplete}
          required={opts.required}
          aria-required={opts.required ? "true" : undefined}
          aria-invalid={Boolean(errors[key])}
          aria-describedby={describedBy}
          className={cn(inputClass, errors[key] && "border-red-500/60")}
        />
        <FieldError id={`checkout-${key}-error`} code={errors[key]} />
      </>
    );
  };

  const label = (key: string, opts: { optional?: boolean } = {}) => (
    <label htmlFor={`checkout-${key}`} className={labelClass}>
      {t(labelKeyFor(key))}{" "}
      {opts.optional ? (
        <span className="normal-case tracking-normal text-slate-600">
          ({t("profileFields.optional")})
        </span>
      ) : (
        <span aria-hidden="true" className="text-[#C5A059]">
          *
        </span>
      )}
    </label>
  );

  return (
    <section aria-labelledby="checkout-customer-title" className="space-y-6">
      <div className="space-y-2">
        <h2
          id="checkout-customer-title"
          className="text-[11px] font-bold uppercase tracking-[0.3em] text-white"
        >
          {t("checkoutPage.customerTitle")}
        </h2>
        <p className="text-[10px] leading-relaxed text-slate-500">
          {t("checkoutBilling.description")}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-slate-600">
          {t("checkoutPage.requiredNote")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          {label("firstName")}
          {field("firstName", { autoComplete: "given-name", required: true })}
        </div>
        <div className="space-y-2">
          {label("lastName")}
          {field("lastName", { autoComplete: "family-name", required: true })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          {label("email")}
          {field("email", { type: "email", autoComplete: "email", required: true })}
        </div>
        <div className="space-y-2">
          <label htmlFor="checkout-phone" className={labelClass}>
            {t("profileFields.phone")} <span aria-hidden="true" className="text-[#C5A059]">*</span>
          </label>
          <div className="flex gap-2">
            <select
              id="checkout-phoneCountryCode"
              aria-label={t("profileFields.selectDialCode")}
              value={fields.phoneCountryCode}
              onChange={(e) => onChange("phoneCountryCode", e.target.value)}
              aria-invalid={Boolean(errors.phoneCountryCode)}
              aria-describedby={errors.phoneCountryCode ? "checkout-phoneCountryCode-error" : undefined}
              className={cn(selectClass, "w-32 shrink-0", errors.phoneCountryCode && "border-red-500/60")}
            >
              <option value="">{t("profileFields.selectDialCode")}</option>
              {DIAL_COUNTRIES.map((c) => (
                <option key={c.code} value={c.dialCode}>
                  {c.flag} {c.dialCode}
                </option>
              ))}
            </select>
            <Input
              id="checkout-phone"
              type="tel"
              value={fields.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              autoComplete="tel-national"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
              className={cn(inputClass, errors.phone && "border-red-500/60")}
            />
          </div>
          <FieldError id="checkout-phoneCountryCode-error" code={errors.phoneCountryCode} />
          <FieldError id="checkout-phone-error" code={errors.phone} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="checkout-country" className={labelClass}>
          {t("profileFields.country")} <span aria-hidden="true" className="text-[#C5A059]">*</span>
        </label>
        <select
          id="checkout-country"
          value={fields.country}
          onChange={(e) => onChange("country", e.target.value)}
          autoComplete="country"
          required
          aria-required="true"
          aria-invalid={Boolean(errors.country)}
          aria-describedby={errors.country ? "checkout-country-error" : undefined}
          className={cn(selectClass, errors.country && "border-red-500/60")}
        >
          <option value="">{t("profileFields.selectCountry")}</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
        <FieldError id="checkout-country-error" code={errors.country} />
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>
          {t("application.address_line1")} <span aria-hidden="true" className="text-[#C5A059]">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_9rem]">
          <div className="space-y-2">
            <label htmlFor="checkout-street" className="text-[10px] text-slate-500">
              {t("profileFields.street")}
            </label>
            {field("street", { autoComplete: "address-line1", required: true })}
          </div>
          <div className="space-y-2">
            <label htmlFor="checkout-number" className="text-[10px] text-slate-500">
              {t("profileFields.number")}
            </label>
            {field("number", { required: true })}
          </div>
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="checkout-complement" className={labelClass}>
          {t("application.address_line2")}{" "}<span className="normal-case tracking-normal text-slate-600">({t("profileFields.optional")})</span>
        </label>
        {field("complement", { autoComplete: "address-line2" })}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          {label("city")}
          {field("city", { autoComplete: "address-level2", required: true })}
        </div>
        <div className="space-y-2">
          {label("state")}
          {field("state", { autoComplete: "address-level1", required: true })}
        </div>
        <div className="space-y-2">
          {label("postalCode")}
          {field("postalCode", { autoComplete: "postal-code", required: true })}
        </div>
      </div>

      <label className="flex items-start gap-3 border border-white/10 bg-white/[0.02] p-4">
        <Checkbox
          checked={updateProfile}
          onCheckedChange={(value) => onUpdateProfileChange(value === true)}
          className="mt-0.5 border-white/20 data-[state=checked]:border-[#C5A059] data-[state=checked]:bg-[#C5A059]"
        />
        <span className="text-[10px] leading-relaxed text-slate-400">
          {t("checkoutBilling.updateProfile")}
        </span>
      </label>
    </section>
  );
}
