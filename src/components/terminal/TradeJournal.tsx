import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Panel, EmptyState } from "@/components/terminal/ui";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPrice,
  formatSignedUsd,
} from "@/lib/terminalFormat";
import type { TerminalTrade } from "@/hooks/useTradovateTerminal";

/**
 * Closed-trade journal reconstructed from real fills. Entry, exit, duration,
 * fees and net PnL all come from the user's own trades. Open trades are listed
 * separately by the positions panel, so the journal only shows closed ones.
 */
const TradeJournal = ({
  trades,
  locale,
  loading,
}: {
  trades: TerminalTrade[];
  locale: string;
  loading?: boolean;
}) => {
  const { t } = useTranslation();
  const closed = trades.filter((tr) => tr.status === "closed");

  const durationSec = (tr: TerminalTrade): number | null => {
    if (!tr.closed_at) return null;
    const a = Date.parse(tr.opened_at);
    const b = Date.parse(tr.closed_at);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    return Math.max(0, (b - a) / 1000);
  };

  const units = {
    h: t("terminal.duration.h"),
    m: t("terminal.duration.m"),
    s: t("terminal.duration.s"),
  };

  return (
    <Panel title={t("terminal.journalTitle")}>
      {loading ? (
        <div className="space-y-2" role="status" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : closed.length === 0 ? (
        <EmptyState title={t("terminal.journalEmpty")} hint={t("terminal.journalEmptyHint")} />
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[860px]">
            <caption className="sr-only">{t("terminal.journalTitle")}</caption>
            <thead>
              <tr className="border-b border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                <th scope="col" className="text-start py-3">{t("terminal.colInstrument")}</th>
                <th scope="col" className="text-start py-3">{t("terminal.colSide")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colQty")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colEntry")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colExit")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colDuration")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colFees")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colNet")}</th>
                <th scope="col" className="text-start py-3">{t("terminal.colClosedAt")}</th>
              </tr>
            </thead>
            <tbody>
              {closed.map((tr) => {
                const secs = durationSec(tr);
                return (
                  <tr key={tr.id} className="border-b border-white/5">
                    <td className="py-3 text-[11px] font-bold uppercase tracking-widest text-white">
                      {tr.symbol || tr.root_symbol}
                    </td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-widest",
                          tr.side === "long" ? "text-emerald-400" : "text-red-400",
                        )}
                      >
                        {t(`tradovate.side.${tr.side}`)}
                      </span>
                    </td>
                    <td className="py-3 text-end text-[11px] tabular-nums text-slate-300">
                      {formatNumber(tr.quantity, locale)}
                    </td>
                    <td className="py-3 text-end text-[11px] tabular-nums text-slate-300">
                      {formatPrice(tr.entry_price, locale)}
                    </td>
                    <td className="py-3 text-end text-[11px] tabular-nums text-slate-300">
                      {formatPrice(tr.exit_price, locale)}
                    </td>
                    <td className="py-3 text-end text-[11px] tabular-nums text-slate-400">
                      {secs === null ? "—" : formatDuration(secs, locale, units)}
                    </td>
                    <td className="py-3 text-end text-[11px] tabular-nums text-slate-400">
                      {formatSignedUsd(-Math.abs(Number(tr.commission)), locale)}
                    </td>
                    <td
                      className={cn(
                        "py-3 text-end text-[11px] font-bold tabular-nums",
                        Number(tr.net_pnl) >= 0 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {formatSignedUsd(Number(tr.net_pnl), locale)}
                    </td>
                    <td className="py-3 text-[10px] text-slate-500">
                      {formatDateTime(tr.closed_at, locale)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};

export default TradeJournal;
