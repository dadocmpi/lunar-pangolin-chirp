import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plug, RefreshCw, Settings2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import TradovateConnectPanel from "@/components/TradovateConnectPanel";
import AccountSelector from "@/components/terminal/AccountSelector";
import AccountSummary from "@/components/terminal/AccountSummary";
import OpenPositions from "@/components/terminal/OpenPositions";
import OpenOrders from "@/components/terminal/OpenOrders";
import TradeJournal from "@/components/terminal/TradeJournal";
import PerformancePanel from "@/components/terminal/PerformancePanel";
import { SectionHeader, ErrorState, EmptyState, PanelSkeleton } from "@/components/terminal/ui";
import { useTradovateTerminal } from "@/hooks/useTradovateTerminal";
import { useLanguageLocale } from "@/hooks/useLanguageLocale";
import { formatRelative } from "@/lib/terminalFormat";
import { cn } from "@/lib/utils";

/**
 * TradingTerminal — the terminal's Tradovate view.
 *
 * All data is real and scoped to the verified user's linked Tradovate account:
 *   * live balance / positions / working orders (tradovate-dashboard),
 *   * reconstructed trades + fills + performance stats (tradovate-data),
 *   * real-time refresh via Supabase Realtime when the poller writes.
 *
 * Empty, loading, error-with-retry and "last synced" states are all explicit.
 * Nothing here fabricates a value: a field the provider omits shows "—".
 */
const TradingTerminal = () => {
  const { t } = useTranslation();
  const locale = useLanguageLocale();
  const terminal = useTradovateTerminal();
  const [panelOpen, setPanelOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await terminal.refresh(true);
    } finally {
      setRefreshing(false);
    }
  };

  const snapshotWarnings = terminal.snapshot?.warnings ?? [];
  const ordersUnavailable = snapshotWarnings.includes("orders") || snapshotWarnings.includes("unavailable");
  const positionsUnavailable = snapshotWarnings.includes("positions") || snapshotWarnings.includes("unavailable");
  const balanceUnavailable = snapshotWarnings.includes("balance") || snapshotWarnings.includes("unavailable");

  if (terminal.loading && !terminal.loaded) {
    return (
      <div className="space-y-8">
        <PanelSkeleton rows={2} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/5 animate-pulse" />
          ))}
        </div>
        <PanelSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow={t("tradovate.eyebrow")}
          title={t("terminal.title")}
          hint={terminal.connected ? t("terminal.subtitle") : undefined}
        />

        <div className="flex flex-wrap items-center gap-3">
          <AccountSelector
            accounts={terminal.accounts}
            selected={terminal.selected}
            onSelect={terminal.select}
            disabled={terminal.loading}
          />
          {terminal.connected && (
            <>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {t("terminal.lastSynced")}: {formatRelative(terminal.lastSyncedAt, locale)}
                {terminal.cached && ` · ${t("terminal.cached")}`}
              </span>
              <Button
                onClick={onRefresh}
                disabled={refreshing}
                className="bg-white/10 hover:bg-white/20 text-white rounded-none h-10 text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
              >
                <RefreshCw size={14} className={cn("me-2", refreshing && "animate-spin")} />
                {t("tradovate.refresh")}
              </Button>
              <Button
                onClick={() => setPanelOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-none h-10 text-[10px] font-black uppercase tracking-widest"
              >
                <Settings2 size={14} className="me-2" />
                {t("tradovate.manageConnection")}
              </Button>
            </>
          )}
        </div>
      </div>

      {!terminal.connected && (
        <div className="p-10 md:p-14 bg-[#1A1A1A] border border-[#D4AF37]/20 text-center">
          <div className="w-16 h-16 mx-auto bg-[#D4AF37]/10 flex items-center justify-center mb-6">
            <Plug size={28} className="text-[#D4AF37]" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight">{t("tradovate.emptyTitle")}</h3>
          <p className="text-[12px] text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">
            {t("tradovate.emptyBody")}
          </p>
          <Button
            onClick={() => setPanelOpen(true)}
            className="mt-8 bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 px-8 font-black text-[11px] uppercase tracking-[0.2em]"
          >
            <Plug size={16} className="me-2" />
            {t("tradovate.connectCta")}
          </Button>
          <p className="text-[10px] text-slate-600 mt-5">{t("tradovate.emptyHint")}</p>
        </div>
      )}

      {terminal.connected && terminal.error && (
        <ErrorState
          message={t("tradovate.loadError")}
          retryLabel={t("tradovate.refresh")}
          onRetry={onRefresh}
        />
      )}

      {terminal.connected && !terminal.error && (
        <>
          <AccountSummary balance={terminal.snapshot?.balance ?? null} locale={locale} unavailable={balanceUnavailable} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <OpenPositions
              positions={terminal.snapshot?.positions ?? []}
              locale={locale}
              unavailable={positionsUnavailable}
            />
            <OpenOrders
              orders={terminal.snapshot?.orders ?? []}
              locale={locale}
              unavailable={ordersUnavailable}
            />
          </div>

          {terminal.trades.length === 0 && !terminal.loading && (
            <div className="p-12 bg-[#1A1A1A] border border-white/10 text-center">
              <Activity size={32} className="mx-auto text-slate-600 mb-4" aria-hidden="true" />
              <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">
                {t("tradovate.noFills")}
              </p>
              <p className="text-[10px] text-slate-600 mt-2">{t("tradovate.noFillsHint")}</p>
            </div>
          )}

          <PerformancePanel stats={terminal.performance} locale={locale} loading={terminal.loading} />
          <TradeJournal trades={terminal.trades} locale={locale} loading={terminal.loading} />
        </>
      )}

      {!terminal.enabled && (
        <EmptyState title={t("terminal.disabled")} hint={t("terminal.disabledHint")} />
      )}

      <TradovateConnectPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onChanged={() => terminal.refresh(true)}
      />
    </div>
  );
};

export default TradingTerminal;
