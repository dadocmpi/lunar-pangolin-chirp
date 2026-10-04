// ============================================================================
// TradovateConnectCard — prominent connect entry point on the main dashboard.
//
// Shown in the Active Services view. Uses the shared connection hook and the
// existing connect panel (username + password -> tradovate-connect -> first
// sync runs server-side). No gate, no extra steps: one card, one click.
// ============================================================================

import React, { useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Plug } from "lucide-react";
import { useTranslation } from "react-i18next";
import TradovateConnectPanel from "@/components/TradovateConnectPanel";
import { useTradovateConnection } from "@/hooks/useTradovateConnection";
import { cn } from "@/lib/utils";

const TradovateConnectCard = ({ defaultOpen = false }: { defaultOpen?: boolean }) => {
  const { t } = useTranslation();
  const { loading, connected, integrations, refresh } = useTradovateConnection(true);
  const [open, setOpen] = useState(defaultOpen);

  const active = integrations.filter((i) => i.status === "connected");

  return (
    <>
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border border-[#D4AF37]/30 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
              <Plug className="text-[#D4AF37]" size={22} />
            </div>
            <div>
              <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] block mb-1">
                {t('tradovate.eyebrow')}
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight text-white">
                {loading
                  ? t('tradovate.emptyTitle')
                  : connected
                  ? t('tradovate.cardConnectedTitle')
                  : t('tradovate.emptyTitle')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed max-w-lg">
                {connected ? t('tradovate.cardConnectedBody') : t('tradovate.emptyBody')}
              </p>
              {connected && active.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {active.map((i) => (
                    <span
                      key={i.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold uppercase tracking-widest"
                    >
                      <CheckCircle2 size={11} />
                      {i.label || i.accountSpec || i.accountId} · {i.environment}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            disabled={loading}
            className={cn(
              "shrink-0 h-12 px-6 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors",
              connected
                ? "bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
                : "bg-[#D4AF37] text-black hover:bg-[#B08D48]",
              loading && "opacity-40",
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                {connected ? t('tradovate.manageConnection') : t('tradovate.connectCta')}
                <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <TradovateConnectPanel
        open={open}
        onClose={() => setOpen(false)}
        onChanged={refresh}
      />
    </>
  );
};

export default TradovateConnectCard;
