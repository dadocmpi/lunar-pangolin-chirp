"use client";

import { CheckoutPaymentStatus } from "@/hooks/usePaymentStatus";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LABEL: Record<CheckoutPaymentStatus, string> = {
  created:         "checkoutStatus.created",
  pending:         "checkoutStatus.pending",
  processing:      "checkoutStatus.processing",
  confirmed:       "checkoutStatus.confirmed",
  failed:          "checkoutStatus.failed",
  rejected:        "checkoutStatus.rejected",
  refunded:        "checkoutStatus.refunded",
  disputed:        "checkoutStatus.disputed",
  canceled:        "checkoutStatus.canceled",
  pending_manual:  "checkoutStatus.pending_manual",
};

const TONE: Record<CheckoutPaymentStatus, string> = {
  created:        "bg-slate-500/10 text-slate-300 border-slate-500/30",
  pending:        "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  processing:     "bg-blue-500/10 text-blue-300 border-blue-500/30",
  confirmed:      "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  failed:         "bg-red-500/10 text-red-300 border-red-500/30",
  rejected:       "bg-red-500/10 text-red-300 border-red-500/30",
  refunded:       "bg-orange-500/10 text-orange-300 border-orange-500/30",
  disputed:       "bg-orange-500/10 text-orange-300 border-orange-500/30",
  canceled:       "bg-slate-500/10 text-slate-300 border-slate-500/30",
  pending_manual: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
};

export function CheckoutStatusBadge({
  status,
  className,
}: {
  status: CheckoutPaymentStatus;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border",
        TONE[status],
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {t(LABEL[status])}
    </span>
  );
}

export default CheckoutStatusBadge;