"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaymentStatusResponse } from "@/hooks/usePaymentStatus";
import {
  formatCountdown,
  formatPaymentAmount,
  lifecycleLabelKey,
  lifecycleTone,
  methodLabelKey,
  nextActionLabelKey,
  remainingSeconds,
} from "@/lib/paymentLifecycle";

interface Props {
  response: PaymentStatusResponse | null;
  loading?: boolean;
  error?: string | null;
}

const TONE_CLASSES: Record<string, string> = {
  neutral: "border-slate-500/30 text-slate-300",
  progress: "border-blue-500/30 text-blue-300",
  success: "border-emerald-500/30 text-emerald-400",
  warning: "border-yellow-500/30 text-yellow-400",
  error: "border-red-500/30 text-red-400",
};

const PaymentLifecycleCard = ({ response, loading, error }: Props) => {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());

  const payment = response?.payment ?? null;
  const state = response?.lifecycle ?? null;

  const secondsLeft = useMemo(
    () => remainingSeconds(payment?.expires_at ?? null, now),
    [payment?.expires_at, now],
  );
  const showCountdown = Boolean(
    payment?.expires_at &&
      secondsLeft !== null &&
      secondsLeft > 0 &&
      (state === "created" || state === "pending" || state === "manual_review"),
  );

  useEffect(() => {
    if (!showCountdown) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [showCountdown]);

  if (loading) {
    return (
      <div className="flex items-center justify-center border border-white/10 bg-[#1A1A1A] p-10">
        <Loader2 className="animate-spin text-[#D4AF37]" size={24} aria-hidden="true" />
        <span className="sr-only">{t("paymentCard.loading")}</span>
      </div>
    );
  }

  if (!payment || !state) {
    return (
      <div className="border border-dashed border-white/10 bg-[#1A1A1A] p-8 text-center">
        <CreditCard className="mx-auto mb-4 text-slate-600" size={28} aria-hidden="true" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {error ? t("paymentCard.unavailable") : t("paymentCard.noPayments")}
        </p>
        <p className="mx-auto mt-2 max-w-md text-[11px] leading-relaxed text-slate-500">
          {t("paymentCard.noPaymentsHint")}
        </p>
        <Button asChild className="mt-6 h-11 rounded-none bg-[#C5A059] px-6 text-[10px] font-black uppercase tracking-widest text-[#05070A] hover:bg-[#C5A059]/85">
          <Link to="/pricing">{t("paymentCard.viewPlans")}</Link>
        </Button>
      </div>
    );
  }

  const tone = lifecycleTone(state);
  const isProcessing = response?.processing === true;
  const isActive = state === "active";

  return (
    <section className="border border-white/10 bg-[#1A1A1A]" aria-labelledby="payment-card-title">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-6">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
            {t("paymentCard.title")}
          </span>
          <h2 id="payment-card-title" className="mt-2 text-xl font-black uppercase tracking-tighter">
            {payment.plan_name ?? t("paymentCard.planFallback")}
          </h2>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
            {t("paymentCard.reference")}: <span className="text-slate-300 break-all">{payment.reference ?? payment.id}</span>
          </p>
        </div>
        <span className={cn("inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest", TONE_CLASSES[tone])}>
          {isProcessing && <Loader2 size={12} className="animate-spin" aria-hidden="true" />}
          {t(lifecycleLabelKey(state))}
        </span>
      </header>

      <dl className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2">
        <Row label={t("paymentCard.amount")} value={formatPaymentAmount(payment.amount_cents, payment.currency)} />
        <Row label={t("paymentCard.currency")} value={payment.currency} />
        <Row label={t("paymentCard.method")} value={t(methodLabelKey(payment.method))} />
        <Row label={t("paymentCard.created")} value={formatDateTime(payment.created_at)} />
        <Row label={t("paymentCard.updated")} value={formatDateTime(payment.updated_at)} />
      </dl>

      <div className="space-y-4 border-t border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {t("paymentCard.nextAction")}
            </p>
            <p className="mt-1 text-[12px] text-slate-200">
              {t(nextActionLabelKey(response?.next_action ?? "none"))}
            </p>
          </div>
          {showCountdown && (
            <div className="flex items-center gap-2 border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">
              <Clock size={13} aria-hidden="true" />
              {t("paymentCard.expiresIn", { time: formatCountdown(secondsLeft) })}
            </div>
          )}
        </div>

        {isActive && response?.activation && (
          <div className="space-y-3 border border-emerald-500/25 bg-emerald-500/[0.06] p-5">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={16} aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {t("paymentCard.activationActive")}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Row label={t("paymentCard.accountId")} value={response.activation.account_id} />
              <Row label={t("paymentCard.activationDate")} value={formatDateTime(response.activation.activated_at)} />
            </dl>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {t("paymentCard.nextStepsTitle")}
            </p>
            <ul className="space-y-2 ps-4">
              <li className="text-[11px] leading-relaxed text-slate-400">· {t("paymentCard.nextSteps.dashboard")}</li>
              <li className="text-[11px] leading-relaxed text-slate-400">· {t("paymentCard.nextSteps.provider")}</li>
              <li className="text-[11px] leading-relaxed text-slate-400">· {t("paymentCard.nextSteps.eligibility")}</li>
            </ul>
            <Button asChild className="h-11 rounded-none bg-[#C5A059] px-6 text-[10px] font-black uppercase tracking-widest text-[#05070A] hover:bg-[#C5A059]/85">
              <Link to="/dashboard">{t("paymentCard.openDashboard")}</Link>
            </Button>
          </div>
        )}

        <p className="flex items-start gap-2 border border-dashed border-white/10 p-3 text-[9px] uppercase leading-relaxed tracking-widest text-slate-600">
          <ShieldCheck size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t("paymentCard.serverTruthNote")}
        </p>
      </div>
    </section>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-white/5 pb-2">
    <dt className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</dt>
    <dd className="mt-1 text-[12px] text-slate-200 break-all">{value}</dd>
  </div>
);

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export default PaymentLifecycleCard;
