// ============================================================================
// TradovateTrades — trades + reconstructed PnL for the connected account.
//
// Reads the read-only tradovate-data Edge Function (scoped to the verified
// user). Subscribes to Supabase Realtime on trades/fills so the list refreshes
// when the scheduled poller writes new rows — this is the live-update path,
// not a server WebSocket.
// ============================================================================

import React, { useCallback, useEffect, useState } from "react";
import { Activity, Loader2, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
      </div>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">
            {t("tradovate.eyebrow")}
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
            {t("tradovate.title")}
          </h2>
        </div>
        <Button
          onClick={load}
          className="bg-white/10 hover:bg-white/20 text-white rounded-none h-11 text-[10px] font-black uppercase tracking-widest"
        >
          <RefreshCw size={14} className="mr-2" /> {t("tradovate.refresh")}
        </Button>
      </div>

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
