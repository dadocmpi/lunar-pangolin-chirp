"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Mail, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import ProfileDetailsFields from "./ProfileDetailsFields";
import { fetchProfile, saveProfile } from "@/lib/profile";
import {
  hasProfileErrors,
  toProfileFields,
  validateProfile,
  type ProfileErrors,
  type ProfileFields,
} from "@/lib/profileValidation";

const EMPTY: ProfileFields = {
  fullName: "",
  phoneCountryCode: "",
  phone: "",
  country: "",
  street: "",
  number: "",
  complement: "",
  city: "",
  state: "",
  postalCode: "",
};

/** "My profile" editor — view and update the saved customer details. */
export default function ProfileEditor() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState<ProfileFields>(EMPTY);
  const [errors, setErrors] = useState<ProfileErrors>({});

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email ?? "");
      try {
        if (user) {
          const profile = await fetchProfile(user.id);
          const base = profile ? toProfileFields(profile.raw) : EMPTY;
          setDetails({
            ...base,
            fullName: base.fullName || (user.user_metadata?.full_name as string) || "",
          });
        }
      } catch (err) {
        console.error("Profile load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field: keyof ProfileFields, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProfile(details);
    setErrors(validation);
    if (hasProfileErrors(validation)) {
      showError(t("signup.fixErrors"));
      return;
    }
    setSaving(true);
    try {
      const result = await saveProfile(details);
      if (!result.ok) {
        if (result.fields) setErrors(result.fields as ProfileErrors);
        showError(result.error === "unauthorized" ? t("signup.sessionExpired") : t("signup.saveError"));
        return;
      }
      showSuccess(t("profile.saved"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#C5A059]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">
          {t("profile.eyebrow")}
        </span>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
          {t("profile.title")}
        </h2>
        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{t("profile.subtitle")}</p>
      </div>

      <div className="bg-[#1A1A1A] border border-white/10 p-6 flex items-center gap-3">
        <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("profile.emailLabel")}</p>
          <p className="text-[12px] text-white truncate flex items-center gap-2">
            <Mail size={12} className="text-slate-500" /> {email}
          </p>
        </div>
      </div>

      <form className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6" onSubmit={handleSave}>
        <ProfileDetailsFields
          fields={details}
          errors={errors}
          onChange={handleChange}
          showFullName
        />
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-12 font-black text-[10px] uppercase tracking-widest"
        >
          {saving ? <Loader2 size={16} className="me-2 animate-spin" /> : <Save size={16} className="me-2" />}
          {t("profile.save")}
        </Button>
      </form>
    </div>
  );
}
