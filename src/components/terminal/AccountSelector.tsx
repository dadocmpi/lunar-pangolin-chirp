import React from "react";
import { ChevronDown, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TerminalAccount } from "@/hooks/useTradovateTerminal";

/**
 * Server-driven account selector. A user can link several Tradovate accounts
 * (demo and, when enabled, live); the terminal always shows one account's data
 * at a time and this control switches between them. The label falls back to
 * the account spec, never to an invented name.
 */
const AccountSelector = ({
  accounts,
  selected,
  onSelect,
  disabled,
}: {
  accounts: TerminalAccount[];
  selected: TerminalAccount | null;
  onSelect: (integrationId: string) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  if (accounts.length === 0) return null;

  const labelOf = (a: TerminalAccount) => a.label || a.accountSpec || String(a.accountId);

  // A single account needs no control.
  if (accounts.length === 1) {
    return (
      <div className="inline-flex items-center gap-2 px-3 h-10 border border-white/10 bg-white/[0.02]">
        <Layers size={13} className="text-[#D4AF37]" aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
          {labelOf(accounts[0])}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
          {t(`connectTradovate.environment.${accounts[0].environment}`)}
        </span>
      </div>
    );
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("terminal.accountSelectorLabel")}</span>
      <Layers
        size={13}
        className="absolute start-3 text-[#D4AF37] pointer-events-none"
        aria-hidden="true"
      />
      <select
        value={selected?.integrationId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className="appearance-none h-10 ps-8 pe-9 bg-white/[0.02] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-200 outline-none focus:border-[#D4AF37]/60 disabled:opacity-50"
      >
        {accounts.map((a) => (
          <option key={a.integrationId} value={a.integrationId} className="bg-[#1A1A1A]">
            {labelOf(a)} · {t(`connectTradovate.environment.${a.environment}`)}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute end-3 text-slate-500 pointer-events-none"
        aria-hidden="true"
      />
    </label>
  );
};

export default AccountSelector;
