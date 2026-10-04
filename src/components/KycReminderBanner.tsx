// ============================================================================
// KycReminderBanner — non-blocking KYC reminder shown at the top of the
// terminal. It NEVER blocks: it is a clickable reminder that deep-links to the
// KYC settings tab. Only withdrawals require verification (enforced
// server-side); everything else in the terminal stays fully usable.
// ============================================================================

import React from "react";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type KycBannerStatus = "pending" | "submitted" | "approved" | "rejected";

interface Props {
  status: KycBannerStatus;
  onOpen: () => void;
}

const KycReminderBanner = ({ status, onOpen }: Props) => {
  const { t } = useTranslation();
  if (status === "approved") return null;

  const tone =
    status === "submitted"
      ? "bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/60"
      : status === "rejected"
      ? "bg-red-500/10 border-red-500/30 hover:border-red-500/60"
      : "bg-[#D4AF37]/10 border-[#D4AF37]/30 hover:border-[#D4AF37]/60";

  const text =
    status === "submitted"
      ? "text-yellow-500"
      : status === "rejected"
      ? "text-red-500"
      : "text-[#D4AF37]";

  return (
    <button onClick={onOpen} className={cn("w-full text-left p-4 flex items-center gap-4 border transition-colors", tone)}>
      <AlertTriangle size={18} className={cn("shrink-0", text)} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-[10px] font-bold uppercase tracking-widest", text)}>
          {status === "submitted"
            ? t('dashboard.kyc.underReview')
            : status === "rejected"
            ? t('dashboard.kyc.rejected')
            : t('dashboard.kyc.optionalTitle')}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">{t('dashboard.kycBannerHint')}</p>
      </div>
      <ArrowUpRight size={16} className="shrink-0 text-slate-500" />
    </button>
  );
};

export default KycReminderBanner;
