import { useTranslation } from "react-i18next";
import { Clock, Landmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CheckoutStatusBadge from "@/components/CheckoutStatusBadge";
import CheckoutNotice from "@/components/checkout/CheckoutNotice";
import CopyButton from "@/components/checkout/CopyButton";
import { formatUsd } from "@/lib/plans";
import type { CheckoutResponse } from "@/lib/checkout";
import type { CheckoutPaymentStatus } from "@/hooks/usePaymentStatus";

interface Props {
  onCreate: () => void;
  busy: boolean;
  disabled: boolean;
  response: CheckoutResponse | null;
  status: CheckoutPaymentStatus | null;
}

/**
 * Bank transfer through Wise. The bank details come only from the server; the
 * customer never marks the payment as paid. Confirmation is a manual operator
 * action (or a verified provider event) and the UI says so.
 */
export default function BankTransferPanel({ onCreate, busy, disabled, response, status }: Props) {
  const { t } = useTranslation();
  const payment = response?.payment ?? null;
  const bank = response?.bank_details ?? null;

  const row = (labelKey: string, value: string, copyable = false) => (
    <div className="flex flex-col gap-1 border-b border-white/5 py-2 last:border-0">
      <dt className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
        {t(labelKey)}
      </dt>
      <dd className="flex flex-wrap items-center justify-between gap-2">
        <span className="break-all font-mono text-[11px] text-slate-200">{value}</span>
        {copyable && value ? <CopyButton value={value} /> : null}
      </dd>
    </div>
  );

  return (
    <div className="space-y-4 border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-3">
        <Landmark size={18} className="text-[#C5A059]" aria-hidden="true" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
          {t("checkout.wiseTransfer")}
        </h3>
      </div>

      <p className="flex items-start gap-2 text-[10px] leading-relaxed text-slate-400">
        <Clock size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-500" />
        {t("checkoutPage.bank.settlementNote")}
      </p>

      {!payment && (
        <Button
          type="button"
          onClick={onCreate}
          disabled={busy || disabled}
          aria-busy={busy}
          className="h-12 w-full rounded-none bg-[#C5A059] text-[11px] font-black uppercase tracking-[0.2em] text-[#05070A] hover:bg-[#C5A059]/85 focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {t("checkoutPage.bank.createInstruction")}
        </Button>
      )}

      {payment && (
        <div className="space-y-3">
          {status && <CheckoutStatusBadge status={status} />}

          {bank && (
            <dl className="border border-white/10 bg-[#05070A] px-3">
              {row("checkout.accountHolder", bank.holder_name)}
              {row("checkout.bankName", bank.bank_name)}
              {row("checkout.accountNumber", bank.account_number, true)}
              {bank.routing_number ? row("checkout.routingNumber", bank.routing_number) : null}
              {bank.swift ? row("checkout.swiftLabel", bank.swift) : null}
              {row("checkout.referenceLabel", bank.reference, true)}
            </dl>
          )}

          <dl className="grid grid-cols-1 gap-2 text-[10px] sm:grid-cols-2">
            <div className="border border-white/10 p-3">
              <dt className="font-bold uppercase tracking-widest text-slate-500">
                {t("checkout.amountToPay")}
              </dt>
              <dd className="mt-1 text-slate-200">{formatUsd(payment.amount_cents / 100)}</dd>
            </div>
            <div className="border border-white/10 p-3">
              <dt className="font-bold uppercase tracking-widest text-slate-500">
                {t("checkoutPage.currencyLabel")}
              </dt>
              <dd className="mt-1 text-slate-200">{payment.currency ?? "USD"}</dd>
            </div>
          </dl>

          {response?.expires_at && (
            <p className="text-[10px] text-slate-500">
              {t("checkoutPage.bank.expiryLabel")}: {response.expires_at}
            </p>
          )}

          <CheckoutNotice tone="pending">
            <p className="font-bold uppercase tracking-widest">
              {t("checkoutPage.bank.pendingTitle")}
            </p>
            <p>{t("checkoutPage.bank.pendingDesc")}</p>
          </CheckoutNotice>

          <p className="text-[9px] uppercase tracking-widest text-slate-600">
            {t("checkoutPage.bank.notPaidNotice")}
          </p>
        </div>
      )}
    </div>
  );
}
