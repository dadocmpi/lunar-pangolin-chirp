import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Panel, EmptyState } from "@/components/terminal/ui";
import { cn } from "@/lib/utils";
import { formatNumber, formatPrice } from "@/lib/terminalFormat";
import type { TerminalPosition } from "@/hooks/useTradovateTerminal";

/**
 * Open positions read live from /position/list. `netPos` is signed; the side
 * and quantity are derived from it. A position with no resolved contract shows
 * the raw contract id — never a made-up symbol.
 */
const OpenPositions = ({
  positions,
  locale,
  unavailable,
  loading,
}: {
  positions: TerminalPosition[];
  locale: string;
  unavailable?: boolean;
  loading?: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Panel title={t("terminal.positionsTitle")}>
      {loading ? (
        <div className="space-y-2" role="status" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : unavailable ? (
        <EmptyState title={t("terminal.positionsUnavailable")} />
      ) : positions.length === 0 ? (
        <EmptyState title={t("terminal.positionsEmpty")} />
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                <th scope="col" className="text-start py-3">{t("terminal.colInstrument")}</th>
                <th scope="col" className="text-start py-3">{t("terminal.colSide")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colQty")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colAvgPrice")}</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p, i) => (
                <tr key={`${p.contractId}-${i}`} className="border-b border-white/5">
                  <td className="py-3 text-[11px] font-bold uppercase tracking-widest text-white">
                    {p.symbol || p.root || (p.contractId ?? "—")}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest",
                        p.side === "long" ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {p.side === "long" ? (
                        <TrendingUp size={12} aria-hidden="true" />
                      ) : (
                        <TrendingDown size={12} aria-hidden="true" />
                      )}
                      {t(`tradovate.side.${p.side}`)}
                    </span>
                  </td>
                  <td className="py-3 text-end text-[11px] tabular-nums text-slate-300">
                    {formatNumber(p.quantity, locale)}
                  </td>
                  <td className="py-3 text-end text-[11px] tabular-nums text-slate-300">
                    {formatPrice(p.avgPrice, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};

export default OpenPositions;
