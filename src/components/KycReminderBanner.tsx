// ============================================================================
// KycReminderBanner — non-blocking KYC reminder shown at the top of the
// terminal. It NEVER blocks: it is a clickable reminder that deep-links to the
// KYC settings tab. Only withdrawals require verification (enforced
// server-side); everything else in the terminal stays fully usable.
//
// The banner can be dismissed for the current browser session (sessionStorage),
// so it stays out of the way once acknowledged without hiding the requirement
// permanently.
// ============================================================================

import React, { useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type KycBannerStatus = "pending" | "submitted" | "approved" | "rejected";

const DISMISS_KEY = "braxel-kyc-banner-dismissed";

interface Props {
  status: KycBannerStatus;
  onOpen: () => void;
}

const KycReminderBanner = ({ status, onOpen }: Props) => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (status === "approved") return null;
  if (dismissed) return null;

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Session storage unavailable (private mode); the banner just reappears.
    }
  };

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
    <div className={cn("w-full p-4 flex items-center gap-4 border transition-colors", tone)}>
      <button
        onClick={onOpen}
        className="flex flex-1 items-center gap-4 text-start min-w-0"
      >
        <AlertTriangle size={18} className={cn("shrink-0", text)} aria-hidden="true" />
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
        <ArrowUpRight size={16} className="shrink-0 text-slate-500" aria-hidden="true" />
      </button>
      <button
        onClick={dismiss}
        aria-label={t('dashboard.dismissBanner')}
        className="shrink-0 text-slate-500 hover:text-white p-1"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

export default KycReminderBanner;
