// ============================================================================
// ActivateAccountView — the "Activate account" dashboard view.
//
// The customer already bought an evaluation/funded account at a prop firm
// through our affiliate link. Here they request activation of the signals
// plan: firm, plan name, account login (NO password), purchase email, a
// receipt upload and optional notes, plus four mandatory confirmations.
//
// Security notes:
//   * No broker password / CID / secret field exists anywhere in this form.
//   * The submission goes to the authenticated `activation-submit` Edge
//     Function as multipart/form-data; the file is validated again server-side.
//   * When the latest activation is approved the view switches to the
//     "Plan active" onboarding (PlanActiveChecklist).
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Send,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase, functionsUrl, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useActivationConfig } from "@/lib/activationConfig";
import {
  type ActivationRow,
  type ActivationStatus,
  canSubmitNewActivation,
  isApproved,
  latestActivation,
  statusTone,
} from "@/lib/activationStatus";
import PlanActiveChecklist from "@/components/PlanActiveChecklist";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".pdf"];

const toneClass: Record<ReturnType<typeof statusTone>, string> = {
  pending: "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]",
  progress: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
  needs_info: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  approved: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
  rejected: "bg-red-500/10 border-red-500/30 text-red-500",
};

const StatusIcon = ({ status }: { status: ActivationStatus }) => {
  if (status === "approved") return <CheckCircle2 size={16} className="text-emerald-500" />;
  if (status === "rejected") return <XCircle size={16} className="text-red-500" />;
  if (status === "info_requested") return <AlertTriangle size={16} className="text-orange-400" />;
  return <Clock size={16} className="text-yellow-500" />;
};

const ActivateAccountView = () => {
  const { t } = useTranslation();
  const { config, loading: configLoading } = useActivationConfig();

  const [rows, setRows] = useState<ActivationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state.
  const [firmId, setFirmId] = useState("");
  const [planName, setPlanName] = useState("");
  const [accountLogin, setAccountLogin] = useState("");
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [confirmedOwnership, setConfirmedOwnership] = useState(false);
  const [confirmedResponsibility, setConfirmedResponsibility] = useState(false);
  const [confirmedFirmRules, setConfirmedFirmRules] = useState(false);
  const [confirmedRisk, setConfirmedRisk] = useState(false);

  const loadRows = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("account_activations")
      .select("id, firm, plan_name, account_login, purchase_email, receipt_path, status, operator_note, submitted_at, reviewed_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data as ActivationRow[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  // Preselect the first configured firm once the config arrives.
  useEffect(() => {
    if (!firmId && config.firms.length > 0) setFirmId(config.firms[0].id);
  }, [config.firms, firmId]);

  const latest = useMemo(() => latestActivation(rows), [rows]);
  const showForm = canSubmitNewActivation(latest);

  const firmName = useCallback(
    (id: string) => config.firms.find((f) => f.id === id)?.name ?? id,
    [config.firms],
  );

  const pickReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setReceipt(null);
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      showError(t("activation.errors.badFileType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      showError(t("activation.errors.fileTooLarge"));
      return;
    }
    setReceipt(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmId || !planName.trim() || !accountLogin.trim() || !purchaseEmail.trim()) {
      showError(t("activation.errors.missingFields"));
      return;
    }
    if (!receipt) {
      showError(t("activation.errors.receiptRequired"));
      return;
    }
    if (!(confirmedOwnership && confirmedResponsibility && confirmedFirmRules && confirmedRisk)) {
      showError(t("activation.errors.confirmationsRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showError(t("activation.errors.unauthorized"));
        return;
      }
      const form = new FormData();
      form.append("firmId", firmId);
      form.append("planName", planName.trim());
      form.append("accountLogin", accountLogin.trim());
      form.append("purchaseEmail", purchaseEmail.trim());
      form.append("note", note.trim());
      form.append("confirmedOwnership", String(confirmedOwnership));
      form.append("confirmedResponsibility", String(confirmedResponsibility));
      form.append("confirmedFirmRules", String(confirmedFirmRules));
      form.append("confirmedRisk", String(confirmedRisk));
      form.append("receipt", receipt);

      const res = await fetch(functionsUrl("activation-submit"), {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json?.error === "already_pending") {
          showError(t("activation.errors.alreadyPending"));
        } else if (json?.error === "invalid_receipt") {
          showError(t("activation.errors.invalidReceipt"));
        } else if (json?.error === "feature_disabled") {
          showError(t("activation.errors.disabled"));
        } else {
          showError(t("activation.errors.submitFailed"));
        }
        return;
      }
      showSuccess(t("activation.submitted"));
      setPlanName("");
      setAccountLogin("");
      setNote("");
      setReceipt(null);
      setConfirmedOwnership(false);
      setConfirmedResponsibility(false);
      setConfirmedFirmRules(false);
      setConfirmedRisk(false);
      await loadRows();
    } catch {
      showError(t("activation.errors.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || configLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#C5A059]" size={32} />
      </div>
    );
  }

  // Approved: the plan is active. Show the onboarding checklist instead of the form.
  if (isApproved(latest?.status)) {
    return <PlanActiveChecklist activation={latest} firmName={firmName(latest?.firm ?? "")} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t("activation.eyebrow")}</span>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t("activation.title")}</h2>
        <p className="text-slate-500 text-[12px] mt-2 max-w-2xl leading-relaxed">{t("activation.intro")}</p>
      </div>

      {/* No-password warning: this form never asks for a broker credential. */}
      <div className="p-5 border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-start gap-3">
        <AlertTriangle className="text-[#D4AF37] shrink-0 mt-0.5" size={18} aria-hidden="true" />
        <p className="text-[11px] text-slate-300 leading-relaxed">{t("activation.noPasswordNotice")}</p>
      </div>

      {/* Current status / history */}
      {latest && (
        <div className={cn("p-6 border", toneClass[statusTone(latest.status)])}>
          <div className="flex items-center gap-3 mb-2">
            <StatusIcon status={latest.status} />
            <p className="text-[11px] font-bold uppercase tracking-widest">
              {t(`activation.status.${latest.status}`)}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            {firmName(latest.firm)} · {latest.plan_name} · {latest.account_login}
          </p>
          {latest.operator_note && (
            <p className="text-[11px] text-slate-300 mt-3 p-3 bg-black/30 border border-white/10">
              <span className="font-bold uppercase tracking-widest text-[9px] block mb-1">{t("activation.operatorNote")}</span>
              {latest.operator_note}
            </p>
          )}
        </div>
      )}

      {rows.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{t("activation.history")}</h3>
          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <StatusIcon status={row.status} />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest">{firmName(row.firm)} · {row.plan_name}</p>
                    <p className="text-[9px] text-slate-500">{row.submitted_at ?? row.created_at}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {t(`activation.status.${row.status}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form — only when the latest request is not awaiting a decision. */}
      {showForm ? (
        <form onSubmit={submit} className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("activation.formTitle")}</h3>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("activation.firmLabel")}</label>
            <select
              value={firmId}
              onChange={(e) => setFirmId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 h-14 px-4 text-[12px] font-bold uppercase tracking-widest text-white outline-none appearance-none"
            >
              {config.firms.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#1A1A1A]">{f.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("activation.planNameLabel")}</label>
            <Input
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder={t("activation.planNamePlaceholder")}
              className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("activation.accountLoginLabel")}</label>
            <Input
              value={accountLogin}
              onChange={(e) => setAccountLogin(e.target.value)}
              placeholder={t("activation.accountLoginPlaceholder")}
              className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white"
            />
            <p className="text-[9px] text-slate-500">{t("activation.accountLoginHint")}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("activation.purchaseEmailLabel")}</label>
            <Input
              type="email"
              value={purchaseEmail}
              onChange={(e) => setPurchaseEmail(e.target.value)}
              placeholder={t("activation.purchaseEmailPlaceholder")}
              className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("activation.receiptLabel")}</label>
            <label className="flex items-center gap-3 h-14 px-4 bg-white/5 border border-white/10 cursor-pointer hover:border-[#D4AF37]/40 transition-colors">
              <Upload size={16} className="text-[#D4AF37]" />
              <span className="text-[11px] text-slate-300 truncate">
                {receipt ? receipt.name : t("activation.receiptPlaceholder")}
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.heic,.pdf,image/*,application/pdf"
                onChange={pickReceipt}
                className="hidden"
              />
            </label>
            <p className="text-[9px] text-slate-500">{t("activation.receiptHint")}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("activation.noteLabel")}</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("activation.notePlaceholder")}
              className="bg-white/5 border-white/10 rounded-none min-h-[100px] text-[13px] text-white"
            />
          </div>

          {/* Mandatory confirmations */}
          <div className="space-y-4 p-6 bg-white/[0.02] border border-white/5">
            {[
              { checked: confirmedOwnership, set: setConfirmedOwnership, label: t("activation.confirmOwnership") },
              { checked: confirmedResponsibility, set: setConfirmedResponsibility, label: t("activation.confirmResponsibility") },
              { checked: confirmedFirmRules, set: setConfirmedFirmRules, label: t("activation.confirmFirmRules") },
              { checked: confirmedRisk, set: setConfirmedRisk, label: t("activation.confirmRisk") },
            ].map((item, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={(v) => item.set(v === true)}
                  className="mt-0.5 border-white/30 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-black"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">{item.label}</span>
              </label>
            ))}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
          >
            {submitting ? <Loader2 size={16} className="me-2 animate-spin" /> : <Send size={16} className="me-2" />}
            {t("activation.submit")}
          </Button>

          {/* Draft risk/legal text — pending legal review. */}
          <p className="text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-4">
            {t("activation.riskDraft")}
          </p>
        </form>
      ) : (
        <div className="p-10 border border-dashed border-white/10 bg-[#1A1A1A] text-center">
          <FileText size={32} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t("activation.pendingHint")}</p>
        </div>
      )}
    </div>
  );
};

export default ActivateAccountView;
