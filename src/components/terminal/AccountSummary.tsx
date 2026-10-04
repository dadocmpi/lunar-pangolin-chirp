import React from "react";
import { useTranslation } from "react-i18next";
import { MetricCard, Panel, EmptyState } from "@/components/terminal/ui";
import { formatUsd, formatSignedUsd } from "@/lib/terminalFormat";
import type { TerminalBalance } from "@/hooks/useTradovateTerminal";

/**
 * Live account balance / margin panel. Every value is read from the provider's
 * cash-balance snapshot; a field the provider does not return renders as "—"
 * (never 0 and never a guess). When the whole snapshot is unavailable the
 * panel says so explicitly instead of showing zeros.
 */
const AccountSummary = ({
  balance,
  locale,
  unavailable,
}: {
  balance: TerminalBalance | null;
  locale: string;
  /** True when the snapshot call failed (distinct from "provider returned no balance"). */
  unavailable?: boolean;
}) => {
  const { t } = useTranslation();
  const dash = "—";

  if (!balance) {
    return (
      <Panel title={t("terminal.balanceTitle")}>
        <EmptyState
          title={unavailable ? t("terminal.balanceUnavailable") : t("terminal.balanceNoData")}
          hint={unavailable ? t("terminal.balanceUnavailableHint") : undefined}
        />
      </Panel>
    );
  }

  const usd = (v: number | null) => (v === null ? dash : formatUsd(v, locale));
  const signed = (v: number | null) =>
    v === null ? dash : formatSignedUsd(v, locale);
  const tone = (v: number | null): "positive" | "negative" | "neutral" | "muted" =>
    v === null ? "muted" : v > 0 ? "positive" : v < 0 ? "negative" : "neutral";

  return (
    <Panel title={t("terminal.balanceTitle")}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label={t("terminal.balance")} value={usd(balance.totalCashValue)} />
        <MetricCard label={t("terminal.netLiq")} value={usd(balance.netLiq)} />
        <MetricCard
          label={t("terminal.openPnl")}
          value={signed(balance.openPnL)}
          tone={tone(balance.openPnL)}
        />
        <MetricCard
          label={t("terminal.totalPnl")}
          value={signed(balance.totalPnL)}
          tone={tone(balance.totalPnL)}
        />
        <MetricCard label={t("terminal.initialMargin")} value={usd(balance.initialMargin)} />
        <MetricCard label={t("terminal.maintenanceMargin")} value={usd(balance.maintenanceMargin)} />
        <MetricCard
          label={t("terminal.realizedPnl")}
          value={signed(balance.realizedPnL)}
          tone={tone(balance.realizedPnL)}
        />
        <MetricCard
          label={t("terminal.weekRealizedPnl")}
          value={signed(balance.weekRealizedPnL)}
          tone={tone(balance.weekRealizedPnL)}
        />
      </div>
    </Panel>
  );
};

export default AccountSummary;
