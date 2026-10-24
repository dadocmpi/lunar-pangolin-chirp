// ============================================================================
// PlanActiveChecklist — the "Plan active" onboarding shown after an activation
// is approved.
//
// The customer executes the signals themselves in their own account, with a
// third-party tool. Braxel never operates the account. The tool setup content
// is a PLACEHOLDER (per-tool copy lives in i18n under `planActive.tools.*`);
// the risk notice is draft text pending legal review.
// ============================================================================

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Wrench, Radio, ShieldAlert, ExternalLink, Loader2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/plans";
import { useActivationConfig } from "@/lib/activationConfig";
import { confirmStrategySubscription } from "@/lib/strategyConfirm";
import { showError, showSuccess } from "@/utils/toast";
import type { ActivationRow } from "@/lib/activationStatus";
import { isPlanActive, resolveSubscriptionStatus } from "@/lib/subscriptionStatus";
import { cn } from "@/lib/utils";
import SignalsSubscriptionNotice from "@/components/SignalsSubscriptionNotice";

interface Props {
  activation: ActivationRow | null;
  firmName: string;
}

const PlanActiveChecklist = ({ activation, firmName }: Props) => {
  const { t } = useTranslation();
  const { config } = useActivationConfig();
  const [confirming, setConfirming] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(activation?.strategy_confirmed_at ?? null);

  const tools = (t("planActive.tools", { returnObjects: true }) as unknown as Array<{ name: string; steps: string[] }>);
  const steps = Array.isArray(tools) ? tools : [];

  // The plan is truly active only once the Stripe webhook confirmed payment.
  // An approved activation with an unpaid subscription shows the checklist as a
  // preview plus the subscription notice, never a false "active" badge.
  const subscriptionActive = isPlanActive(resolveSubscriptionStatus(activation?.subscription_status));

  const confirmStrategy = async () => {
    setConfirming(true);
    try {
      const result = await confirmStrategySubscription();
      if (!result.ok) {
        showError(t("planActive.traderspostConfirmError"));
        return;
      }
      setConfirmedAt(result.confirmedAt ?? new Date().toISOString());
      showSuccess(t("planActive.traderspostConfirmed"));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner: active only when the subscription payment is confirmed. */}
      <div className={cn(
        "p-8 border",
        subscriptionActive
          ? "border-emerald-500/30 bg-emerald-500/[0.06]"
          : "border-[#D4AF37]/30 bg-[#D4AF37]/[0.06]",
      )}>
        <div className="flex items-center gap-3 mb-2">
          {subscriptionActive
            ? <CheckCircle2 size={20} className="text-emerald-500" />
            : <Clock size={20} className="text-[#D4AF37]" />}
          <span className={cn(
            "text-[11px] font-black uppercase tracking-[0.3em]",
            subscriptionActive ? "text-emerald-500" : "text-[#D4AF37]",
          )}>
            {subscriptionActive ? t("planActive.badge") : t("planActive.approvedBadge")}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
          {config.plan.name || t("planActive.planFallback")}
        </h2>
        <p className="text-[12px] text-slate-400 mt-3 max-w-2xl leading-relaxed">{t("planActive.summary")}</p>
        {activation && (
          <p className="text-[10px] text-slate-500 mt-3 uppercase tracking-widest">
            {firmName} · {activation.plan_name} · {activation.account_login}
          </p>
        )}
        {config.plan.priceCents > 0 && (
          <p className="text-[11px] text-slate-400 mt-3">
            {formatUsd(config.plan.priceCents / 100)}<span className="text-slate-500">{t("accounts.perMonth")}</span>
          </p>
        )}
      </div>

      {/* Monthly fee: pay / resume / manage. Active only after webhook. */}
      <SignalsSubscriptionNotice subscriptionStatus={activation?.subscription_status} />

      {/* Checklist */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">{t("planActive.checklistTitle")}</h3>

        {/* Step 1: connect the execution tool */}
        <div className="p-6 bg-[#1A1A1A] border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Wrench size={16} className="text-[#D4AF37]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-white">{t("planActive.step1Title")}</p>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{t("planActive.step1Body")}</p>
          {steps.length > 0 && (
            <div className="space-y-3">
              {steps.map((tool, i) => (
                <div key={i} className="p-4 bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-2">{tool.name}</p>
                  <ul className="space-y-1.5">
                    {tool.steps.map((s, j) => (
                      <li key={j} className="text-[11px] text-slate-400 flex items-start gap-2">
                        <span className="text-[#D4AF37] mt-0.5">·</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* TradersPost: our strategy share link + the customer's confirmation.
              The link comes from config; when it is unset, no button is shown. */}
          <div className="mt-5 pt-5 border-t border-white/10 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-2">{t("planActive.traderspostTitle")}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">{t("planActive.traderspostBody")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {config.tradersPostShareUrl && (
                <a href={config.tradersPostShareUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-[#D4AF37] hover:bg-[#C5A059] text-black rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest">
                    <ExternalLink size={14} className="me-2" /> {t("planActive.traderspostSubscribe")}
                  </Button>
                </a>
              )}
              {confirmedAt ? (
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  <CheckCircle2 size={14} /> {t("planActive.traderspostConfirmed")}
                </span>
              ) : (
                <Button
                  disabled={confirming}
                  onClick={confirmStrategy}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest"
                >
                  {confirming && <Loader2 size={14} className="me-2 animate-spin" />}
                  {t("planActive.traderspostConfirm")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: how the signals arrive */}
        <div className="p-6 bg-[#1A1A1A] border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <Radio size={16} className="text-[#D4AF37]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-white">{t("planActive.step2Title")}</p>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{t("planActive.step2Body")}</p>
        </div>

        {/* Step 3: risk notice (draft) */}
        <div className="p-6 border border-yellow-900/30 bg-yellow-950/10">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert size={16} className="text-yellow-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-white">{t("planActive.step3Title")}</p>
          </div>
          <div className="mb-3 p-2 border border-yellow-700/40 bg-yellow-950/20 text-yellow-300 text-[9px] font-bold uppercase tracking-widest">
            {t("legalDraftBanner")}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{t("planActive.step3Body")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link to="/accounts">
          <Button className="bg-white/10 hover:bg-white/20 text-white rounded-none h-12 px-6 text-[10px] font-black uppercase tracking-widest">
            <ExternalLink size={14} className="me-2" /> {t("planActive.buyAnother")}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PlanActiveChecklist;
