// ============================================================================
// TradovateWelcome — first-run SOFT gate for the dashboard.
//
// Shown in the main content area on first access when the user has no Tradovate
// connection and has not skipped. It is NOT a router guard: the sidebar and
// every other view stay reachable, and "Skip for now" dismisses it for good
// (persisted server-side). The primary button opens the existing
// TradovateConnectPanel (username, password, demo/live, trust notice).
// ============================================================================

import React, { useState } from "react";
import { ArrowRight, Lock, Plug, ShieldCheck, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import TradovateConnectPanel from "@/components/TradovateConnectPanel";
import { cn } from "@/lib/utils";

interface Props {
  /** Fired after a successful connect so the dashboard reloads with data. */
  onConnected: () => void;
  /** Persist "Skip for now" and reveal the normal dashboard. */
  onSkip: () => void | Promise<void>;
}

const TradovateWelcome = ({ onConnected, onSkip }: Props) => {
  const { t } = useTranslation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [skipping, setSkipping] = useState(false);

  const skip = async () => {
    setSkipping(true);
    try {
      await onSkip();
    } finally {
      setSkipping(false);
    }
  };

  const points = [
    { icon: <TrendingUp size={16} />, text: t("welcome.point1") },
    { icon: <ShieldCheck size={16} />, text: t("welcome.point2") },
    { icon: <Lock size={16} />, text: t("welcome.point3") },
  ];

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gradient-to-br from-[#1A1A1A] to-[#0B0B0B] border border-[#D4AF37]/30 p-10 md:p-14 text-center">
        <div className="w-16 h-16 mx-auto bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-8">
          <Plug size={28} className="text-[#D4AF37]" />
        </div>

        <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] block mb-3">
          {t("welcome.eyebrow")}
        </span>
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white">
          {t("welcome.title")}
        </h2>
        <p className="text-[12px] md:text-sm text-slate-400 mt-5 max-w-xl mx-auto leading-relaxed">
          {t("welcome.body")}
        </p>

        <ul className="mt-8 space-y-3 max-w-md mx-auto text-start">
          {points.map((p) => (
            <li key={p.text} className="flex items-start gap-3 text-[11px] text-slate-300 leading-relaxed">
              <span className="text-[#D4AF37] mt-0.5 shrink-0">{p.icon}</span>
              {p.text}
            </li>
          ))}
        </ul>

        <button
          onClick={() => setPanelOpen(true)}
          className="mt-10 w-full sm:w-auto h-14 px-10 bg-[#D4AF37] hover:bg-[#B08D48] text-black font-black text-[12px] uppercase tracking-[0.2em] inline-flex items-center justify-center gap-3 transition-colors"
        >
          {t("tradovate.connectCta")}
          <ArrowRight size={18} />
        </button>

        <div className="mt-6">
          <button
            onClick={skip}
            disabled={skipping}
            className={cn(
              "text-[11px] font-bold uppercase tracking-widest text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline transition-colors",
              skipping && "opacity-40",
            )}
          >
            {t("welcome.skip")}
          </button>
        </div>
      </div>

      <TradovateConnectPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onChanged={onConnected}
      />
    </div>
  );
};

export default TradovateWelcome;
