import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Panel, EmptyState } from "@/components/terminal/ui";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/terminalFormat";
import type { TerminalOrder } from "@/hooks/useTradovateTerminal";

/**
 * Working / open orders. `order/list` carries identity + status only; quantity
 * and price are joined from `orderVersion/list` server-side. A missing value
 * renders as "—" — never a fabricated number. Tradovate order lists are
 * session-scoped and reset at the daily session close, which the panel notes.
 */
const OpenOrders = ({
  orders,
  locale,
  unavailable,
  loading,
}: {
  orders: TerminalOrder[];
  locale: string;
  unavailable?: boolean;
  loading?: boolean;
}) => {
  const { t } = useTranslation();
  const working = orders.filter((o) => o.isWorking);

  return (
    <Panel title={t("terminal.ordersTitle")}>
      {loading ? (
        <div className="space-y-2" role="status" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : unavailable ? (
        <EmptyState title={t("terminal.ordersUnavailable")} />
      ) : working.length === 0 ? (
        <EmptyState title={t("terminal.ordersEmpty")} hint={t("terminal.ordersSessionHint")} />
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                <th scope="col" className="text-start py-3">{t("terminal.colInstrument")}</th>
                <th scope="col" className="text-start py-3">{t("terminal.colSide")}</th>
                <th scope="col" className="text-start py-3">{t("terminal.colType")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colQty")}</th>
                <th scope="col" className="text-end py-3">{t("terminal.colPrice")}</th>
                <th scope="col" className="text-start py-3">{t("terminal.colStatus")}</th>
                <th scope="col" className="text-start py-3">{t("terminal.colTime")}</th>
              </tr>
            </thead>
            <tbody>
              {working.map((o) => (
                <tr key={o.orderId} className="border-b border-white/5">
                  <td className="py-3 text-[11px] font-bold uppercase tracking-widest text-white">
                    {o.symbol || o.root || (o.contractId ?? "—")}
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-widest",
                        o.action === "Buy" ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {o.action ? t(`terminal.action.${o.action}`) : "—"}
                    </span>
                  </td>
                  <td className="py-3 text-[10px] text-slate-400">
                    {o.orderType ? t(`terminal.orderType.${o.orderType}`, { defaultValue: o.orderType }) : "—"}
                  </td>
                  <td className="py-3 text-end text-[11px] tabular-nums text-slate-300">
                    {o.quantity === null ? "—" : formatNumber(o.quantity, locale)}
                  </td>
                  <td className="py-3 text-end text-[11px] tabular-nums text-slate-300">
                    {formatPrice(o.price ?? o.stopPrice, locale)}
                  </td>
                  <td className="py-3 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    {t(`terminal.orderStatus.${o.ordStatus}`, { defaultValue: o.ordStatus })}
                  </td>
                  <td className="py-3 text-[10px] text-slate-500">
                    {formatDateTime(o.timestamp, locale)}
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

export default OpenOrders;
