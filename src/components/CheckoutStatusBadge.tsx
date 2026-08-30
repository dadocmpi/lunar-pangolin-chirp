"use client";

import { CheckoutPaymentStatus } from "@/hooks/usePaymentStatus";
import { cn } from "@/lib/utils";

const LABEL: Record<CheckoutPaymentStatus, string> = {
  created:         "Created",
  pending:         "Awaiting Payment",
  processing:      "Verifying On-Chain",
  confirmed:       "Confirmed",
  failed:          "Failed",
  rejected:        "Rejected",
  refunded:        "Refunded",
  disputed:        "Disputed",
  canceled:        "Canceled",
  pending_manual:  "Awaiting Manual Review",
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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border",
        TONE[status],
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {LABEL[status]}
    </span>
  );
}

export default CheckoutStatusBadge;