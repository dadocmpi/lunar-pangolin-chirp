// ============================================================================
// OnboardingView — managed-account onboarding.
//
// Flow: paid package -> onboarding instructions -> declare the external
// prop-firm account -> submit for manual review -> follow the status.
//
// Security notes:
//   * The page only renders what `onboarding-status` returned. The server
//     derives the payment entitlement and the effective link status; the
//     browser never declares a plan, a price, a payment status or a link status.
//   * There is NO broker password / provider token field. Only the external
//     account login/ID is collected.
//   * Every mutation goes to a JWT-verified Edge Function.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Link2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Send,
  Unplug,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { formatUsd } from "@/lib/plans";
import { useOnboardingConfig } from "@/lib/onboardingConfig";
import {
  canSubmitNewLink,
  fetchOnboardingStatus,
  paymentTone,
  statusTone,
  type LinkStatus,
  type OnboardingStatus,
  type StatusTone,
} from "@/lib/onboardingStatus";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

const toneClass: Record<StatusTone, string> = {
  pending: "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]",
  progress: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
  approved: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
  rejected: "bg-red-500/10 border-red-500/30 text-red-500",
  suspended: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  disconnected: "bg-slate-500/10 border-slate-500/30 text-slate-400",
};

const paymentToneClass: Record<ReturnType<typeof paymentTone>, string> = {
  active: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  pending: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  inactive: "bg-red-500/10 border-red-500/30 text-red-400",
  none: "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]",
};

const StatusIcon = ({ status }: { status: LinkStatus }) => {
  if (status === "approved") return <CheckCircle2 size={18} className="text-emerald-500" />;
  if (status === "rejected") return <XCircle size={18} className="text-red-500" />;
  if (status === "suspended") return <AlertTriangle size={18} className="text-orange-400" />;
  if (status === "disconnected") return <Unplug size={18} className="text-slate-400" />;
  return <Clock size={18} className="text-yellow-500" />;
};

const ACK_KEYS = [
  "ownership",
  "externalRules",
  "noProfitGuarantee",
  "eligibility",
  "dataDelayed",
  "payoutsProvider",
  "noFundsHeld",
] as const;

type AckKey = (typeof ACK_KEYS)[number];

const OnboardingView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { config, loading: configLoading } = useOnboardingConfig();

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const [firmId, setFirmId] = useState("");
  const [accountLogin, setAccountLogin] = useState("");
  const [note, setNote] = useState("");
  const [acks, setAcks] = useState<Record<AckKey, boolean>>({
    ownership: false,
    externalRules: false,
    noProfitGuarantee: false,
    eligibility: false,
    dataDelayed: false,
    payoutsProvider: false,
    noFundsHeld: false,
  });

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      navigate("/login", { state: { from: { pathname: "/onboarding" } } });
      return;
    }
    try {
      const next = await fetchOnboardingStatus(session.access_token);
      setStatus(next);
      if (!firmId && next.firms.length > 0) setFirmId(next.firms[0].id);
    } catch {
      showError(t("onboarding.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [firmId, navigate, t]);

  useEffect(() => {
    load();
    // load is intentionally run once per mount; it is stable enough for this view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const link = status?.link ?? null;
  const showForm = canSubmitNewLink(link);
  const firmName = useCallback(
    (id: string) => status?.firms.find((f) => f.id === id)?.name ?? id,
    [status?.firms],
  );
  const planName = useMemo(() => {
    const planId = status?.entitlement.planId;
    if (!planId) return null;
    return status?.plans.find((p) => p.id === planId)?.name ?? planId;
  }, [status?.entitlement.planId, status?.plans]);

  const allAcked = ACK_KEYS.every((k) => acks[k]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmId || !accountLogin.trim()) {
      showError(t("onboarding.errors.missingFields"));
      return;
    }
    if (!allAcked) {
      showError(t("onboarding.errors.confirmationsRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showError(t("onboarding.errors.unauthorized"));
        return;
      }
      const res = await fetch(functionsUrl("account-link-submit"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          firmId,
          accountLogin: accountLogin.trim(),
          note: note.trim(),
          confirmedOwnership: acks.ownership,
          confirmedExternalRules: acks.externalRules,
          confirmedNoProfitGuarantee: acks.noProfitGuarantee,
          confirmedEligibility: acks.eligibility,
          confirmedDataDelayed: acks.dataDelayed,
          confirmedPayoutsProvider: acks.payoutsProvider,
          confirmedNoFundsHeld: acks.noFundsHeld,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json?.error === "payment_required") showError(t("onboarding.errors.paymentRequired"));
        else if (json?.error === "payment_not_active") showError(t("onboarding.errors.paymentNotActive"));
        else if (json?.error === "already_open") showError(t("onboarding.errors.alreadyOpen"));
        else if (json?.error === "firm_not_configured") showError(t("onboarding.errors.invalidFirm"));
        else if (json?.error === "feature_disabled") showError(t("onboarding.errors.disabled"));
        else showError(t("onboarding.errors.submitFailed"));
        return;
      }
      showSuccess(t("onboarding.submitted"));
      setAccountLogin("");
      setNote("");
      setAcks({
        ownership: false,
        externalRules: false,
        noProfitGuarantee: false,
        eligibility: false,
        dataDelayed: false,
        payoutsProvider: false,
        noFundsHeld: false,
      });
      await load();
    } catch {
      showError(t("onboarding.errors.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const disconnect = async () => {
    if (!link) return;
    setDisconnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showError(t("onboarding.errors.unauthorized"));
        return;
      }
      const res = await fetch(functionsUrl("account-link-disconnect"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: link.id }),
      });
      if (!res.ok) {
        showError(t("onboarding.errors.disconnectFailed"));
        return;
      }
      showSuccess(t("onboarding.disconnectDone"));
      await load();
    } catch {
      showError(t("onboarding.errors.disconnectFailed"));
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

  if (!config.enabled && !status?.enabled) {
    return (
      <div className="p-10 border border-dashed border-white/10 bg-[#1A1A1A] text-center">
        <AlertTriangle size={28} className="mx-auto text-[#D4AF37] mb-4" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {t("onboarding.disabledTitle")}
        </p>
        <p className="text-[11px] text-slate-500 mt-3 max-w-lg mx-auto leading-relaxed">
          {t("onboarding.disabledBody")}
        </p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-10 border border-dashed border-white/10 bg-[#1A1A1A] text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {t("onboarding.errors.loadFailed")}
        </p>
        <Button onClick={load} className="mt-6 bg-white/10 hover:bg-white/20 text-white rounded-none h-11 px-6 text-[10px] font-black uppercase tracking-widest">
          {t("onboarding.retry")}
        </Button>
      </div>
    );
  }

  const tone = paymentTone(status.entitlement);
  const amount = status.entitlement.amountCents > 0
    ? formatUsd(status.entitlement.amountCents / 100)
    : planName
    ? formatUsd((status.plans.find((p) => p.id === status.entitlement.planId)?.priceCents ?? 0) / 100)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">
          {t("onboarding.eyebrow")}
        </span>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
          {t("onboarding.title")}
        </h2>
        <p className="text-slate-500 text-[12px] mt-2 max-w-2xl leading-relaxed">
          {t("onboarding.intro")}
        </p>
      </div>

      {/* Payment status — server-derived, never from the URL. */}
      <div className={cn("p-6 border", paymentToneClass[tone])}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {tone === "active"
              ? <ShieldCheck size={20} />
              : tone === "pending"
              ? <Clock size={20} />
              : <AlertTriangle size={20} />}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest">
                {t(`onboarding.payment.${tone}`)}
              </p>
              {planName && (
                <p className="text-[11px] text-slate-300 mt-1">
                  {planName}{amount ? ` · ${amount}` : ""}
                </p>
              )}
            </div>
          </div>
          {tone !== "active" && (
            <Button asChild className="bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-11 px-6 text-[10px] font-black uppercase tracking-widest">
              <Link to="/pricing">{t("onboarding.goToPricing")}</Link>
            </Button>
          )}
        </div>
        {status.entitlement.state !== "active" && status.entitlement.state !== "pending" && status.entitlement.state !== "none" && (
          <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
            {t(`onboarding.payment.${status.entitlement.state}`)}
          </p>
        )}
      </div>

      {/* Onboarding instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <BadgeCheck size={18} />, title: t("onboarding.step1Title"), body: t("onboarding.step1Body") },
          { icon: <Link2 size={18} />, title: t("onboarding.step2Title"), body: t("onboarding.step2Body") },
          { icon: <ShieldCheck size={18} />, title: t("onboarding.step3Title"), body: t("onboarding.step3Body") },
        ].map((step, i) => (
          <div key={i} className="p-6 bg-[#1A1A1A] border border-white/10">
            <div className="text-[#D4AF37] mb-3">{step.icon}</div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white mb-2">{step.title}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>

      {/* No-password notice */}
      <div className="p-5 border border-[#D4AF37]/30 bg-[#D4AF37]/5 flex items-start gap-3">
        <ShieldAlert className="text-[#D4AF37] shrink-0 mt-0.5" size={18} aria-hidden="true" />
        <p className="text-[11px] text-slate-300 leading-relaxed">{t("onboarding.noPasswordNotice")}</p>
      </div>

      {/* Current link status */}
      {link && (
        <div className={cn("p-6 border", toneClass[statusTone(link.status)])}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StatusIcon status={link.status} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest">
                  {t(`onboarding.status.${link.status}`)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {firmName(link.firm)} · {link.plan_id} · {link.account_login}
                </p>
              </div>
            </div>
            {(link.status === "approved" || link.status === "suspended") && (
              <Button
                onClick={disconnect}
                disabled={disconnecting}
                className="bg-white/10 hover:bg-white/20 text-white rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest"
              >
                {disconnecting ? <Loader2 size={14} className="me-2 animate-spin" /> : <Unplug size={14} className="me-2" />}
                {t("onboarding.disconnectCta")}
              </Button>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            {t(`onboarding.statusDesc.${link.status}`)}
          </p>
          {link.suspendedByPayment && (
            <p className="text-[10px] text-orange-300 mt-2 leading-relaxed">
              {t("onboarding.statusDesc.suspendedByPayment")}
            </p>
          )}
          {(link.operator_note || link.suspension_reason) && (
            <p className="text-[11px] text-slate-300 mt-3 p-3 bg-black/30 border border-white/10">
              <span className="font-bold uppercase tracking-widest text-[9px] block mb-1">
                {t("onboarding.operatorNote")}
              </span>
              {link.operator_note ?? link.suspension_reason}
            </p>
          )}
        </div>
      )}

      {/* Form */}
      {status.entitlement.active && showForm ? (
        <form onSubmit={submit} className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            {t("onboarding.formTitle")}
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t("onboarding.firmLabel")}
            </label>
            <select
              value={firmId}
              onChange={(e) => setFirmId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 h-14 px-4 text-[12px] font-bold uppercase tracking-widest text-white outline-none appearance-none"
            >
              {status.firms.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#1A1A1A]">{f.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t("onboarding.accountLoginLabel")}
            </label>
            <Input
              value={accountLogin}
              onChange={(e) => setAccountLogin(e.target.value)}
              placeholder={t("onboarding.accountLoginPlaceholder")}
              className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white"
            />
            <p className="text-[9px] text-slate-500">{t("onboarding.accountLoginHint")}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t("onboarding.noteLabel")}
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("onboarding.notePlaceholder")}
              className="bg-white/5 border-white/10 rounded-none min-h-[100px] text-[13px] text-white"
            />
          </div>

          {/* Disclosures + mandatory acknowledgements */}
          <div className="space-y-4 p-6 bg-white/[0.02] border border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white">
              {t("onboarding.disclosuresTitle")}
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {t("onboarding.disclosuresIntro")}
            </p>
            {ACK_KEYS.map((key) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={acks[key]}
                  onCheckedChange={(v) =>
                    setAcks((prev) => ({ ...prev, [key]: v === true }))
                  }
                  className="mt-0.5 border-white/30 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-black"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  {t(`onboarding.confirm.${key}`)}
                </span>
              </label>
            ))}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
          >
            {submitting ? <Loader2 size={16} className="me-2 animate-spin" /> : <Send size={16} className="me-2" />}
            {t("onboarding.submit")}
          </Button>

          <p className="text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-4">
            {t("onboarding.draftNotice")}
          </p>
        </form>
      ) : status.entitlement.active && !showForm ? (
        <div className="p-10 border border-dashed border-white/10 bg-[#1A1A1A] text-center">
          <Clock size={28} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
            {t("onboarding.pendingHint")}
          </p>
        </div>
      ) : null}

      {/* Execution capability is off. Stated honestly, no hidden promise. */}
      {!status.executionEnabled && (
        <p className="text-[10px] text-slate-600 leading-relaxed">
          {t("onboarding.executionDisabledNote")}
        </p>
      )}

      <p className="text-[10px] text-slate-600 leading-relaxed">
        {t("onboarding.providerNotice")}{" "}
        <Link to="/disclaimer" className="text-[#D4AF37] hover:underline inline-flex items-center gap-1">
          {t("onboarding.riskLink")} <ExternalLink size={10} />
        </Link>
      </p>
    </div>
  );
};

export default OnboardingView;
