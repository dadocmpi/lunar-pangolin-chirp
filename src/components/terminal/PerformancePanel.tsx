import React from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, EmptyState, MetricCard } from "@/components/terminal/ui";
import {
  formatMonth,
  formatNumber,
  formatPercent,
  formatRatio,
  formatSignedUsd,
  formatUsd,
  formatWeekday,
} from "@/lib/terminalFormat";
import { cn } from "@/lib/utils";
import type { PerformanceStats } from "@/lib/tradovate/performance";

/**
 * Performance statistics + equity curve + P&L calendar, all computed from the
 * user's REAL closed trades. With no closed trades the whole panel is an
 * explicit empty state — there is no sample curve and no invented metric.
 */
const PerformancePanel = ({
  stats,
  locale,
  loading,
}: {
  stats: PerformanceStats | null;
  locale: string;
  loading?: boolean;
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Panel title={t("terminal.performanceTitle")}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="status" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 animate-pulse" />
          ))}
        </div>
      </Panel>
    );
  }

  if (!stats || !stats.hasData) {
    return (
      <Panel title={t("terminal.performanceTitle")}>
        <EmptyState
          title={t("terminal.performanceEmpty")}
          hint={t("terminal.performanceEmptyHint")}
        />
      </Panel>
    );
  }

  const tone = (v: number | null): "positive" | "negative" | "neutral" | "muted" =>
    v === null ? "muted" : v > 0 ? "positive" : v < 0 ? "negative" : "neutral";

  const chartData = stats.equityCurve.map((p) => ({
    t: p.t,
    value: p.value,
    label: formatMonth(p.t.slice(0, 7), locale),
  }));

  // P&L calendar: last 12 weeks, Monday-first, built from real daily PnL.
  const calendar = buildCalendar(stats, 12);

  return (
    <div className="space-y-8">
      <Panel title={t("terminal.performanceTitle")}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label={t("terminal.totalNet")} value={formatSignedUsd(stats.totalNet, locale)} tone={tone(stats.totalNet)} />
          <MetricCard label={t("terminal.winRate")} value={formatPercent(stats.winRate, locale)} />
          <MetricCard label={t("terminal.profitFactor")} value={formatRatio(stats.profitFactor, locale)} />
          <MetricCard label={t("terminal.maxDrawdown")} value={stats.maxDrawdown === null ? "—" : formatUsd(stats.maxDrawdown, locale)} tone="negative" />
          <MetricCard label={t("terminal.avgWin")} value={stats.avgWin === null ? "—" : formatSignedUsd(stats.avgWin, locale)} tone={tone(stats.avgWin)} />
          <MetricCard label={t("terminal.avgLoss")} value={stats.avgLoss === null ? "—" : formatSignedUsd(stats.avgLoss, locale)} tone={tone(stats.avgLoss)} />
          <MetricCard label={t("terminal.bestTrade")} value={stats.bestTrade === null ? "—" : formatSignedUsd(stats.bestTrade, locale)} tone={tone(stats.bestTrade)} />
          <MetricCard label={t("terminal.worstTrade")} value={stats.worstTrade === null ? "—" : formatSignedUsd(stats.worstTrade, locale)} tone={tone(stats.worstTrade)} />
          <MetricCard label={t("terminal.wins")} value={formatNumber(stats.wins, locale)} tone="positive" />
          <MetricCard label={t("terminal.losses")} value={formatNumber(stats.losses, locale)} tone="negative" />
          <MetricCard label={t("terminal.closedTrades")} value={formatNumber(stats.closedTrades, locale)} />
          <MetricCard label={t("terminal.totalCommission")} value={formatSignedUsd(-Math.abs(stats.totalCommission), locale)} tone="muted" />
        </div>
      </Panel>

      <Panel title={t("terminal.equityCurveTitle")}>
        <div className="h-[280px] w-full" role="img" aria-label={t("terminal.equityCurveAria")}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C5A059" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
              <XAxis dataKey="label" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#475569"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatNumber(Number(v), locale)}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#05070A", border: "1px solid #ffffff10", fontSize: "10px" }}
                itemStyle={{ color: "#C5A059" }}
                formatter={(v: number) => [formatUsd(Number(v), locale), t("terminal.totalNet")]}
              />
              <Area type="monotone" dataKey="value" stroke="#C5A059" strokeWidth={2} fillOpacity={1} fill="url(#equityFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title={t("terminal.calendarTitle")}>
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="inline-grid grid-flow-col gap-1 min-w-[640px]">
            {calendar.weeks.map((week, wi) => (
              <div key={wi} className="grid grid-rows-5 gap-1">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={
                      cell
                        ? `${cell.date}: ${formatSignedUsd(cell.pnl, locale)} · ${t("terminal.calendarTrades", { count: cell.trades })}`
                        : undefined
                    }
                    className={cn(
                      "w-6 h-6 border",
                      !cell && "bg-white/[0.02] border-white/5",
                      cell && cell.pnl > 0 && "bg-emerald-500/70 border-emerald-400/40",
                      cell && cell.pnl < 0 && "bg-red-500/70 border-red-400/40",
                      cell && cell.pnl === 0 && "bg-white/10 border-white/10",
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-emerald-500/70" /> {t("terminal.calendarProfit")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500/70" /> {t("terminal.calendarLoss")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-white/[0.02] border border-white/10" /> {t("terminal.calendarNone")}
          </span>
        </div>
      </Panel>
    </div>
  );
};

interface CalendarCell {
  date: string;
  pnl: number;
  trades: number;
}

/** Build Monday-first calendar weeks (oldest left) from real daily PnL. */
function buildCalendar(stats: PerformanceStats, weeks: number): { weeks: CalendarCell[][] } {
  const byDate = new Map(stats.calendar.map((c) => [c.date, c]));
  const today = new Date();
  const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const dayNum = (utcToday.getUTCDay() + 6) % 7; // Mon=0
  const thisMonday = new Date(utcToday);
  thisMonday.setUTCDate(thisMonday.getUTCDate() - dayNum);

  const out: CalendarCell[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const col: CalendarCell[] = [];
    for (let d = 0; d < 5; d++) {
      const day = new Date(thisMonday);
      day.setUTCDate(thisMonday.getUTCDate() - w * 7 + d);
      const key = day.toISOString().slice(0, 10);
      const hit = byDate.get(key);
      col.push(hit ? { date: key, pnl: hit.pnl, trades: hit.trades } : ({ date: key, pnl: NaN, trades: 0 } as unknown as CalendarCell));
    }
    out.push(col);
  }
  // Replace NaN placeholders (no trading that day) with a null-like sentinel.
  return {
    weeks: out.map((week) => week.map((c) => (Number.isFinite(c.pnl) ? c : (null as unknown as CalendarCell)))),
  };
}

export default PerformancePanel;
