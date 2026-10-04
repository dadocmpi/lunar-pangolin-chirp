// ============================================================================
// TradovateTrades — in-dashboard Tradovate view.
//
// No blocking gate. The dashboard always loads. This view decides between:
//   * empty state  -> "Connect to Tradovate" opens the connect panel,
//   * connected    -> trades + reconstructed PnL, with a "Manage connection"
//                     button (disconnect lives in the same panel).
//
// Data comes from the read-only tradovate-data Edge Function (scoped to the
// verified user). A Supabase Realtime subscription on trades/fills refreshes
// the list when the scheduled poller writes new rows — this is the live-update
// path, not a server WebSocket.
// ============================================================================

import React, { useCallback, useEffect, useState } from "react";
import { Activity, Loader2, Plug, RefreshCw, Settings2, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { useTradovateConnection } from "@/hooks/useTradovateConnection";
import TradovateConnectPanel from "@/components/TradovateConnectPanel";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Trade {
  id: string;
  account_id: number | null;
  root_symbol: string;
  symbol: string | null;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  opened_at: string;
  closed_at: string | null;
  realized_pnl: number;
  commission: number;
  net_pnl: number;
  status: "open" | "closed";
}

interface Summary {
  netPnl: number;
  grossPnl: number;
  commission: number;
  openTrades: number;
  closedTrades: number;
  byAccount: Array<{ accountId: number | null; netPnl: number; trades: number }>;
}

const EMPTY_SUMMARY: Summary = {
  netPnl: 0,
  grossPnl: 0,
  commission: 0,
  openTrades: 0,
  closedTrades: 0,
  byAccount: [],
};

const TradovateTrades = () => {
  const { t } = useTranslation();
  const connection = useTradovateConnection(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch(functionsUrl("tradovate-data"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        setError("data_failed");
        return;
      }
      const data = await res.json();
      setTrades(Array.isArray(data.trades) ? data.trades : []);
      setSummary(data.summary ?? EMPTY_SUMMARY);
    } catch {
      setError("data_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (!isSupabaseConfigured()) return;
    const channel = supabase
      .channel("tradovate-trades")
      .on("postgres_changes", { event: "*", schema: "public", table: "trades" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "tradovate_fills" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const refreshAll = useCallback(() => {
    connection.refresh();
    load();
  }, [connection, load]);

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

  if (connection.loading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  const active = connection.integrations[0] ?? null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">
            {t("tradovate.eyebrow")}
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
            {t("tradovate.title")}
          </h2>
          {active && (
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">
              {active.label || active.accountSpec} · {t(`connectTradovate.environment.${active.environment}`)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {connection.connected && (
            <Button
              onClick={() => setPanelOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-none h-11 text-[10px] font-black uppercase tracking-widest"
            >
              <Settings2 size={14} className="mr-2" /> {t("tradovate.manageConnection")}
            </Button>
          )}
          <Button
            onClick={refreshAll}
            disabled={!connection.connected}
            className="bg-white/10 hover:bg-white/20 text-white rounded-none h-11 text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
          >
            <RefreshCw size={14} className="mr-2" /> {t("tradovate.refresh")}
          </Button>
        </div>
      </div>

      {/* Empty state: no Tradovate account connected yet. */}
      {!connection.connected && (
        <div className="p-10 md:p-14 bg-[#1A1A1A] border border-[#D4AF37]/20 text-center">
          <div className="w-16 h-16 mx-auto bg-[#D4AF37]/10 flex items-center justify-center mb-6">
            <Plug size={28} className="text-[#D4AF37]" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight">
            {t("tradovate.emptyTitle")}
          </h3>
          <p className="text-[12px] text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">
            {t("tradovate.emptyBody")}
          </p>
          <Button
            onClick={() => setPanelOpen(true)}
            className="mt-8 bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 px-8 font-black text-[11px] uppercase tracking-[0.2em]"
          >
            <Plug size={16} className="mr-2" /> {t("tradovate.connectCta")}
          </Button>
          <p className="text-[10px] text-slate-600 mt-5">{t("tradovate.emptyHint")}</p>
        </div>
      )}

      {connection.connected && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric label={t("tradovate.netPnl")} value={fmt(summary.netPnl)} positive={summary.netPnl >= 0} />
            <Metric label={t("tradovate.grossPnl")} value={fmt(summary.grossPnl)} positive={summary.grossPnl >= 0} />
            <Metric label={t("tradovate.commission")} value={fmt(summary.commission)} />
            <Metric
              label={t("tradovate.openClosed")}
              value={`${summary.openTrades} / ${summary.closedTrades}`}
            />
          </div>

          {error && (
            <div className="p-6 bg-[#1A1A1A] border border-red-500/20 text-[11px] text-red-300">
              {t("tradovate.loadError")}
            </div>
          )}

          {!error && trades.length === 0 && (
            <div className="p-12 bg-[#1A1A1A] border border-white/10 text-center">
              <Activity size={32} className="mx-auto text-slate-600 mb-4" />
              <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">
                {t("tradovate.noFills")}
              </p>
              <p className="text-[10px] text-slate-600 mt-2">{t("tradovate.noFillsHint")}</p>
            </div>
          )}

          {!error && trades.length > 0 && (
            <div className="bg-[#1A1A1A] border border-white/10 overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    <th className="text-left px-4 py-3">{t("tradovate.colInstrument")}</th>
                    <th className="text-left px-4 py-3">{t("tradovate.colSide")}</th>
                    <th className="text-right px-4 py-3">{t("tradovate.colQty")}</th>
                    <th className="text-right px-4 py-3">{t("tradovate.colEntry")}</th>
                    <th className="text-right px-4 py-3">{t("tradovate.colExit")}</th>
                    <th className="text-right px-4 py-3">{t("tradovate.colNet")}</th>
                    <th className="text-left px-4 py-3">{t("tradovate.colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((tr) => (
                    <tr key={tr.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest">
                        {tr.symbol || tr.root_symbol}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest",
                          tr.side === "long" ? "text-emerald-400" : "text-red-400",
                        )}>
                          {tr.side === "long" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {t(`tradovate.side.${tr.side}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[11px] text-slate-300">{tr.quantity}</td>
                      <td className="px-4 py-3 text-right text-[11px] text-slate-300">{tr.entry_price}</td>
                      <td className="px-4 py-3 text-right text-[11px] text-slate-300">{tr.exit_price ?? "—"}</td>
                      <td className={cn(
                        "px-4 py-3 text-right text-[11px] font-bold",
                        Number(tr.net_pnl) >= 0 ? "text-emerald-400" : "text-red-400",
                      )}>
                        {fmt(Number(tr.net_pnl))}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest",
                          tr.status === "closed" ? "text-slate-400" : "text-[#D4AF37]",
                        )}>
                          {t(`tradovate.status.${tr.status}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <TradovateConnectPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onChanged={refreshAll}
      />
    </div>
  );
};

function Metric({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="p-5 bg-[#1A1A1A] border border-white/10">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <p className={cn(
        "text-lg font-black tracking-tight",
        positive === undefined ? "text-white" : positive ? "text-emerald-400" : "text-red-400",
      )}>
        {value}
      </p>
    </div>
  );
}

export default TradovateTrades;
