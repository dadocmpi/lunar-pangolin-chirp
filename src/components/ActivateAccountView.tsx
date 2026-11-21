// ============================================================================
// ActivateAccountView — the customer onboarding / account-link view.
//
// Flow: package + payment status (read from the server) -> onboarding
// instructions and disclosures -> account-link request -> lifecycle status
// (pending, in review, information needed, approved, rejected, suspended,
// disconnected).
//
// Security notes:
//   * Entitlement, plan key, payment status and the current account-link status
//     come from the JWT-verified `account-link` Edge Function, never from form
//     fields.
//   * No provider password / CID / token field exists anywhere in this form.
//   * The submission is multipart/form-data to `activation-submit`; the server
//     re-validates the file, the firm and the payment before inserting.
//   * Execution is never offered: Braxel does not place, modify or close orders.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
  isDisconnected,
  statusLabelKey,
  statusTone,
} from "@/lib/activationStatus";
import { paymentReasonLabelKey, resolveOnboardingStep } from "@/lib/onboarding";
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
  suspended: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  disconnected: "bg-slate-500/10 border-slate-500/30 text-slate-400",
};

const StatusIcon = ({ status }: { status: ActivationStatus }) => {
  if (status === "approved") return <CheckCircle2 size={16} className="text-emerald-500" />;
  if (status === "rejected") return <XCircle size={16} className="text-red-500" />;
  if (status === "info_requested" || status === "suspended") {
    return <AlertTriangle size={16} className="text-orange-400" />;
  }
  return <Clock size={16} className="text-yellow-500" />;
};

interface EntitlementView {
  entitled: boolean;
  reason: string;
  paymentId: string | null;
  planKey: string | null;
  planName: string | null;
  status: string | null;
}

interface AccountLinkResponse {
  ok?: boolean;
  enabled: boolean;
  execution?: { enabled: boolean; implemented: boolean };
  latest: ActivationRow | null;
  history: ActivationRow[];
  entitlement: EntitlementView;
}

const DISCLOSURE_KEYS = [
  "onboarding.disclosures.firmRules",
  "onboarding.disclosures.noGuarantee",
  "onboarding.disclosures.connectivity",
  "onboarding.disclosures.delayedData",
  "onboarding.disclosures.payouts",
  "onboarding.disclosures.noCustody",
];

const ActivateAccountView = () => {
  const { t } = useTranslation();
  const { config, loading: configLoading } = useActivationConfig();

  const [data, setData] = useState<AccountLinkResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

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

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoadError(true);
        return;
      }
      const res = await fetch(functionsUrl("account-link"), {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setLoadError(true);
        setData(null);
        return;
      }
      setData(await res.json() as AccountLinkResponse);
    } catch {
      setLoadError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Preselect the first configured firm once the config arrives.
  useEffect(() => {
    if (!firmId && config.firms.length > 0) setFirmId(config.firms[0].id);
  }, [config.firms, firmId]);

  const latest = data?.latest ?? null;
  const history = useMemo(() => data?.history ?? [], [data]);
  const entitlement = data?.entitlement;
  const entitled = entitlement?.entitled === true;
  const step = resolveOnboardingStep({
    enabled: config.enabled,
    entitled,
    status: latest?.status ?? null,
  });

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
        showError(t("onboarding.errors.unauthorized"));
        return;
      }
      const form = new FormData();
      form.append("firmId", firmId);
      form.append("planName", planName.trim());
      form.append("accountLogin", accountLogin.trim());
      form.append("purchaseEmail", purchaseEmail.trim());
      form.append("note", note.trim());
      if (entitlement?.paymentId) form.append("paymentId", entitlement.paymentId);
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
        } else if (json?.error === "already_active") {
          showError(t("onboarding.errors.alreadyActive"));
        } else if (json?.error === "payment_not_confirmed") {
          showError(t("onboarding.errors.paymentRequired"));
        } else if (json?.error === "invalid_receipt") {
          showError(t("activation.errors.invalidReceipt"));
        } else if (json?.error === "feature_disabled") {
          showError(t("activation.errors.disabled"));
        } else {
          showError(t("onboarding.errors.submitFailed"));
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
      await load();
    } catch {
      showError(t("onboarding.errors.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const disconnect = async () => {
    if (!latest) return;
    if (!window.confirm(t("onboarding.disconnectConfirm"))) return;
    setDisconnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showError(t("onboarding.errors.unauthorized"));
        return;
      }
      const res = await fetch(functionsUrl("account-link"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "disconnect", id: latest.id }),
      });
      if (!res.ok) {
        showError(t("onboarding.disconnectFailed"));
        return;
      }
      showSuccess(t("onboarding.status.disconnected"));
      await load();
    } catch {
      showError(t("onboarding.disconnectFailed"));
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading || configLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#C5A059]" size={32} />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="p-10 border border-dashed border-white/10 bg-[#1A1A1A] text-center space-y-4">
        <AlertTriangle size={28} className="mx-auto text-yellow-500" />
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{t("onboarding.errors.loadFailed")}</p>
        <Button onClick={load} className="bg-white/10 hover:bg-white/20 text-white rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest">
          {t("operatorActivations.refresh")}
        </Button>
      </div>
    );
  }

  const statusPanel = latest ? (
    <div className={cn("p-6 border", toneClass[statusTone(latest.status)])}>
      <div className="flex items-center gap-3 mb-2">
        <StatusIcon status={latest.status} />
        <p className="text-[11px] font-bold uppercase tracking-widest">{t(statusLabelKey(latest.status))}</p>
      </div>
      <p className="text-[11px] text-slate-400">
        {firmName(latest.firm)} · {latest.plan_name} · {latest.account_login}
      </p>
      {latest.braxel_plan_name && (
        <p className="text-[10px] text-slate-500 mt-1">{t("onboarding.planLabel")}: {latest.braxel_plan_name}</p>
      )}
      {(latest.operator_note || latest.suspended_reason || latest.disconnected_reason) && (
        <p className="text-[11px] text-slate-300 mt-3 p-3 bg-black/30 border border-white/10">
          <span className="font-bold uppercase tracking-widest text-[9px] block mb-1">{t("activation.operatorNote")}</span>
          {latest.operator_note ?? latest.suspended_reason ?? latest.disconnected_reason}
        </p>
      )}
    </div>
  ) : null;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t("onboarding.eyebrow")}</span>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t("onboarding.title")}</h2>
        <p className="text-slate-500 text-[12px] mt-2 max-w-2xl leading-relaxed">{t("onboarding.intro")}</p>
      </div>

      {/* Disclosures — always visible in the onboarding flow. */}
      <div className="p-6 border border-[#D4AF37]/30 bg-[#D4AF37]/5">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-4">{t("onboarding.disclosuresTitle")}</h3>
        <ul className="space-y-2">
          {DISCLOSURE_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-2 text-[11px] text-slate-300 leading-relaxed">
              <span className="text-[#D4AF37] mt-0.5" aria-hidden="true">·</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Package + payment status, both server-derived. */}
      <div className="p-6 bg-[#1A1A1A] border border-white/10 space-y-4">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("onboarding.packageTitle")}</h3>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{t("onboarding.packageBody")}</p>
        </div>
        {entitlement?.planName && (
          <p className="text-[13px] font-bold text-[#D4AF37]">{entitlement.planName}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t("onboarding.paymentTitle")}</span>
          <span className={cn(
            "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border",
            entitled ? "border-emerald-500/30 text-emerald-500" : "border-yellow-500/30 text-yellow-500",
          )}>
            {t(paymentReasonLabelKey(entitlement?.reason))}
          </span>
        </div>
        {entitlement?.paymentId && (
          <p className="text-[9px] text-slate-600 break-all">{t("onboarding.paymentIdLabel")}: {entitlement.paymentId}</p>
        )}
        {!entitled && (
          <Link to="/pricing">
            <Button className="bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-12 px-6 text-[10px] font-black uppercase tracking-widest">
              {t("onboarding.choosePlan")}
            </Button>
          </Link>
        )}
      </div>

      {/* Execution capability is never offered in this phase. */}
      <div className="p-6 bg-white/[0.02] border border-white/10">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("onboarding.executionTitle")}</h3>
        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{t("onboarding.executionBody")}</p>
        <span className="inline-block mt-3 px-3 py-1 text-[9px] font-bold uppercase tracking-widest border border-slate-500/30 text-slate-400">
          {t("onboarding.executionDisabled")}
        </span>
      </div>

      {/* Approved: the plan is active. */}
      {step === "active" && latest ? (
        <PlanActiveChecklist
          activation={latest}
          firmName={firmName(latest.firm)}
          onDisconnect={disconnect}
          disconnecting={disconnecting}
        />
      ) : (
        <>
          {statusPanel}

          {step === "disabled" && (
            <div className="p-8 border border-slate-500/30 bg-slate-500/[0.06]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-2">{t("onboarding.title")}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{t("activation.errors.disabled")}</p>
            </div>
          )}

          {step === "suspended" && (
            <div className="p-6 border border-orange-500/30 bg-orange-500/[0.06]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-orange-300 mb-2">{t("onboarding.suspendedTitle")}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{t("onboarding.suspendedBody")}</p>
            </div>
          )}

          {step === "rejected" && (
            <div className="p-6 border border-red-500/30 bg-red-500/[0.06]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-red-300 mb-2">{t("onboarding.rejectedTitle")}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{t("onboarding.rejectedBody")}</p>
            </div>
          )}

          {isDisconnected(latest?.status) && (
            <div className="p-6 border border-slate-500/30 bg-slate-500/[0.06]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-2">{t("onboarding.disconnectedTitle")}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{t("onboarding.disconnectedBody")}</p>
            </div>
          )}

          {step === "awaiting_review" && (
            <div className="p-10 border border-dashed border-white/10 bg-[#1A1A1A] text-center">
              <FileText size={32} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t("activation.pendingHint")}</p>
            </div>
          )}

          {step === "payment_required" && (
            <div className="p-8 border border-yellow-500/30 bg-yellow-500/[0.06]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-yellow-300 mb-2">{t("onboarding.paymentRequiredTitle")}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{t("onboarding.paymentRequiredBody")}</p>
            </div>
          )}

          {step === "info_needed" && (
            <div className="p-6 border border-orange-500/30 bg-orange-500/[0.06]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-orange-300 mb-2">{t("onboarding.status.info_requested")}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{t("onboarding.infoNeededBody")}</p>
            </div>
          )}

          {(step === "form" || step === "info_needed") && (
            <form onSubmit={submit} className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{t("onboarding.linkTitle")}</h3>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{t("onboarding.linkBody")}</p>
              </div>

              <div className="p-5 border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-start gap-3">
                <AlertTriangle className="text-[#D4AF37] shrink-0 mt-0.5" size={18} aria-hidden="true" />
                <p className="text-[11px] text-slate-300 leading-relaxed">{t("activation.noPasswordNotice")}</p>
              </div>

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

              <p className="text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-4">
                {t("activation.riskDraft")}
              </p>
            </form>
          )}
        </>
      )}

      {history.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{t("onboarding.historyTitle")}</h3>
          <div className="space-y-2">
            {history.map((row) => (
              <div key={row.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <StatusIcon status={row.status} />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest">{firmName(row.firm)} · {row.plan_name}</p>
                    <p className="text-[9px] text-slate-500">{row.submitted_at ?? row.created_at}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {t(statusLabelKey(row.status))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivateAccountView;
