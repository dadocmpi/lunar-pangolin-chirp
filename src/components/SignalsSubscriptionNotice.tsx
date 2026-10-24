// ============================================================================
// SignalsSubscriptionNotice — the monthly-fee state for an approved activation.
//
// Shown inside the "Plan active" onboarding. The plan is ACTIVE only when the
// Stripe webhook has confirmed payment; otherwise the customer sees the reason
// and a way to pay (or pay again), plus the billing portal to update the card
// or cancel. The browser cannot activate the plan: it only opens Stripe.
// ============================================================================

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivationConfig } from "@/lib/activationConfig";
import { formatUsd } from "@/lib/plans";
import { openBillingPortal, startSignalsSubscription } from "@/lib/signalsBilling";
import {
  isPlanActive,
  resolveSubscriptionStatus,
  subscriptionTone,
} from "@/lib/subscriptionStatus";
import { showError } from "@/utils/toast";
import { cn } from "@/lib/utils";

interface Props {
  subscriptionStatus: unknown;
}

const toneClass: Record<ReturnType<typeof subscriptionTone>, string> = {
  active: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
  pending: "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]",
  warning: "bg-orange-500/10 border-orange-500/30 text-orange-400",
};

const SignalsSubscriptionNotice = ({ subscriptionStatus }: Props) => {
  const { t } = useTranslation();
  const { config } = useActivationConfig();
  const [busy, setBusy] = useState<"pay" | "portal" | null>(null);

  const status = resolveSubscriptionStatus(subscriptionStatus);
  const active = isPlanActive(status);

  const open = async (kind: "pay" | "portal") => {
    setBusy(kind);
    try {
      const result = kind === "pay"
        ? await startSignalsSubscription()
        : await openBillingPortal();
      if (!result.ok) {
        const error = result.error ?? "unknown";
        if (error === "already_active") {
          showError(t("subscription.errors.alreadyActive"));
        } else if (error === "no_activation" || error === "not_approved") {
          showError(t("subscription.errors.notApproved"));
        } else if (error === "payments_disabled" || error === "feature_disabled") {
          showError(t("subscription.errors.disabled"));
        } else if (error === "unauthorized") {
          showError(t("subscription.errors.unauthorized"));
        } else {
          showError(t("subscription.errors.failed"));
        }
        return;
      }
      if (result.url) window.location.href = result.url;
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={cn("p-6 border", toneClass[subscriptionTone(status)])}>
      <div className="flex items-center gap-3 mb-2">
        <CreditCard size={16} aria-hidden="true" />
        <p className="text-[11px] font-bold uppercase tracking-widest">
          {t(`subscription.status.${status}`)}
        </p>
      </div>
      <p className="text-[11px] text-slate-300 leading-relaxed max-w-2xl">
        {active ? t("subscription.activeBody") : t("subscription.inactiveBody")}
      </p>

      {config.plan.priceCents > 0 && (
        <p className="text-[11px] text-slate-400 mt-2">
          {config.plan.name || t("planActive.planFallback")} · {formatUsd(config.plan.priceCents / 100)}
          <span className="text-slate-500">{t("accounts.perMonth")}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-3 mt-4">
        {!active && (
          <Button
            onClick={() => open("pay")}
            disabled={busy !== null}
            className="bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest"
          >
            {busy === "pay" ? <Loader2 size={14} className="me-2 animate-spin" /> : <CreditCard size={14} className="me-2" />}
            {status === "none" ? t("subscription.subscribe") : t("subscription.resume")}
          </Button>
        )}
        <Button
          onClick={() => open("portal")}
          disabled={busy !== null}
          variant="outline"
          className="rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest border-white/20 text-white hover:bg-white/10"
        >
          {busy === "portal" ? <Loader2 size={14} className="me-2 animate-spin" /> : <Settings2 size={14} className="me-2" />}
          {t("subscription.manage")}
        </Button>
      </div>
    </div>
  );
};

export default SignalsSubscriptionNotice;
