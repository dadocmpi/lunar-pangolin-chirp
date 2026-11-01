import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { COUNTRIES, DIAL_COUNTRIES, findCountry } from "@/lib/countries";
import type { ProfileErrorCode, ProfileErrors, ProfileFields } from "@/lib/profileValidation";
import { useState } from "react";

interface Props {
  fields: ProfileFields;
  errors: ProfileErrors;
  onChange: (field: keyof ProfileFields, value: string) => void;
  /** Renders a country picker that writes both country and dial code. */
  onCountryChange?: (countryCode: string) => void;
  /**
   * Show the full-name field. Off by default: signup step 2 collects the name
   * in step 1, while the profile editor and checkout must show it for editing.
   */
  showFullName?: boolean;
}

export default function ProfileDetailsFields({
  fields,
  errors,
  onChange,
  onCountryChange,
  showFullName = false,
}: Props) {
  const { t } = useTranslation();
  // Localized message for a field error code, or null when the field is valid.
  const errorFor = (code: ProfileErrorCode | undefined): string | null => {
    if (!code) return null;
    const key = `profileFields.errors.${code}`;
    const message = t(key);
    // Fall back to the generic message when a specific code has no string.
    return message === key ? t('profileFields.errors.required') : message;
  };
  const [dialOpen, setDialOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const selectedCountry = useMemo(() => findCountry(fields.country), [fields.country]);
  const selectedDial = useMemo(
    () => DIAL_COUNTRIES.find((c) => c.dialCode === fields.phoneCountryCode) ?? null,
    [fields.phoneCountryCode],
  );

  const inputClass =
    "bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059]";
  const labelClass =
    "text-[10px] font-bold text-slate-400 uppercase tracking-widest";

  const field = (
    key: keyof ProfileFields,
    opts: { type?: string; optional?: boolean } = {},
  ) => (
    <>
      <Input
        type={opts.type ?? "text"}
        value={fields[key]}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={t(`profileFields.placeholders.${key}`)}
        className={cn(inputClass, errors[key] && "border-red-500/60")}
        aria-invalid={Boolean(errors[key])}
      />
      {errorFor(errors[key]) && (
        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
          {errorFor(errors[key])}
        </p>
      )}
    </>
  );

  return (
    <div className="space-y-5">
      {/* Full name */}
      {showFullName && (
        <div className="space-y-2">
          <label className={labelClass}>{t("auth.fullName")}</label>
          <Input
            type="text"
            value={fields.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder={t("auth.fullName")}
            className={cn(inputClass, errors.fullName && "border-red-500/60")}
            aria-invalid={Boolean(errors.fullName)}
          />
          {errorFor(errors.fullName) && (
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
              {errorFor(errors.fullName)}
            </p>
          )}
        </div>
      )}

      {/* Phone: dial-code selector + national number */}
      <div className="space-y-2">
        <label className={labelClass}>{t(`profileFields.phone`)}</label>
        <div className="flex gap-2">
          <Popover open={dialOpen} onOpenChange={setDialOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={dialOpen}
                className={cn(
                  "w-32 justify-between rounded-none h-14 bg-white/5 border-white/10 text-white font-medium hover:bg-white/10 hover:text-white",
                  errors.phoneCountryCode && "border-red-500/60",
                )}
              >
                <span className="truncate">
                  {selectedDial ? `${selectedDial.flag} ${selectedDial.dialCode}` : t(`profileFields.selectDialCode`)}
                </span>
                <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 bg-[#0B0E14] border-white/10">
              <Command className="bg-transparent text-white">
                <CommandInput placeholder={t(`profileFields.searchCountry`)} />
                <CommandList>
                  <CommandEmpty>{t(`profileFields.noResults`)}</CommandEmpty>
                  <CommandGroup>
                    {DIAL_COUNTRIES.map((c) => (
                      <CommandItem
                        key={c.code}
                        value={`${c.name} ${c.dialCode}`}
                        onSelect={() => {
                          onChange("phoneCountryCode", c.dialCode);
                          setDialOpen(false);
                        }}
                        className="text-white aria-selected:bg-white/10"
                      >
                        <Check
                          className={cn(
                            "me-2 h-4 w-4",
                            fields.phoneCountryCode === c.dialCode ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="me-2">{c.flag}</span>
                        <span className="flex-1">{c.name}</span>
                        <span className="text-slate-500">{c.dialCode}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex-1 space-y-2">
            <Input
              type="tel"
              value={fields.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder={t(`profileFields.placeholders.phone`)}
              className={cn(inputClass, errors.phone && "border-red-500/60")}
              aria-invalid={Boolean(errors.phone)}
            />
          </div>
        </div>
        {errorFor(errors.phoneCountryCode) && (
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
            {errorFor(errors.phoneCountryCode)}
          </p>
        )}
        {errorFor(errors.phone) && (
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
            {errorFor(errors.phone)}
          </p>
        )}
      </div>

      {/* Country */}
      <div className="space-y-2">
        <label className={labelClass}>{t(`profileFields.country`)}</label>
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={countryOpen}
              className={cn(
                "w-full justify-between rounded-none h-14 bg-white/5 border-white/10 text-white font-medium hover:bg-white/10 hover:text-white",
                errors.country && "border-red-500/60",
              )}
            >
              <span className="truncate">
                {selectedCountry
                  ? `${selectedCountry.flag} ${selectedCountry.name}`
                  : t(`profileFields.selectCountry`)}
              </span>
              <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[280px] p-0 bg-[#0B0E14] border-white/10">
            <Command className="bg-transparent text-white">
              <CommandInput placeholder={t(`profileFields.searchCountry`)} />
              <CommandList>
                <CommandEmpty>{t(`profileFields.noResults`)}</CommandEmpty>
                <CommandGroup>
                  {COUNTRIES.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.code}`}
                      onSelect={() => {
                        if (onCountryChange) onCountryChange(c.code);
                        else onChange("country", c.code);
                        setCountryOpen(false);
                      }}
                      className="text-white aria-selected:bg-white/10"
                    >
                      <Check
                        className={cn(
                          "me-2 h-4 w-4",
                          fields.country === c.code ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="me-2">{c.flag}</span>
                      <span className="flex-1">{c.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errorFor(errors.country) && (
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">
            {errorFor(errors.country)}
          </p>
        )}
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-2">
          <label className={labelClass}>{t(`profileFields.street`)}</label>
          {field("street")}
        </div>
        <div className="space-y-2">
          <label className={labelClass}>{t(`profileFields.number`)}</label>
          {field("number")}
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelClass}>
          {t(`profileFields.complement`)}{" "}
          <span className="text-slate-600 normal-case">({t(`profileFields.optional`)})</span>
        </label>
        {field("complement")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <label className={labelClass}>{t(`profileFields.city`)}</label>
          {field("city")}
        </div>
        <div className="space-y-2">
          <label className={labelClass}>{t(`profileFields.state`)}</label>
          {field("state")}
        </div>
        <div className="space-y-2">
          <label className={labelClass}>{t(`profileFields.postalCode`)}</label>
          {field("postalCode")}
        </div>
      </div>
    </div>
  );
}
