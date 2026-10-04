// ============================================================================
// Screenshot harness for the combined-branch dashboard.
//
// NOT part of the app bundle: `preview/*.html` is only consumed by the local
// screenshot tooling, never by the Vite app entry (index.html). It mounts the
// REAL KycReminderBanner and TradovateConnectCard (plus a static shell that
// mirrors Dashboard.tsx markup) so a headless capture shows the actual
// non-blocking KYC banner + the visible "Connect to Tradovate" card.
// ============================================================================

import React from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Plug,
  Settings,
  Wallet,
} from "lucide-react";
import "../globals.css";
import "../i18n";
import i18n from "i18next";
import KycReminderBanner from "../components/KycReminderBanner";
import TradovateConnectCard from "../components/TradovateConnectCard";

type Status = "pending" | "submitted" | "rejected" | "approved";
const params = new URLSearchParams(location.search);
const status = (params.get("status") as Status) || "pending";

const Shell = () => {
  const { t } = useTranslation();
  const nav = [
    { id: "services", label: t('nav.dashboard'), icon: <LayoutDashboard size={18} /> },
    { id: "tradovate", label: t('nav.tradovate'), icon: <Plug size={18} /> },
    { id: "performance", label: t('dashboard.navPerformance'), icon: <BarChart3 size={18} /> },
    { id: "withdraw", label: t('dashboard.withdraw'), icon: <Wallet size={18} /> },
    { id: "auditlog", label: t('dashboard.navAuditLog'), icon: <Activity size={18} /> },
    { id: "settings", label: t('dashboard.settings'), icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex">
      <aside className="w-64 border-r border-white/5 bg-[#0A0A0A] p-6 shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#D4AF37] flex items-center justify-center font-black text-black">B</div>
          <span className="font-black tracking-tighter uppercase">Braxel</span>
        </div>
        <div className="p-4 bg-[#1A1A1A] border border-white/10 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-sm">J</div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold uppercase tracking-widest truncate">Joao Silva</p>
              <p className="text-[9px] text-slate-500 truncate">joao@email.com</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
            <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
            <span className="text-[#D4AF37]">{t('dashboard.kycBadgeRequired')}</span>
          </div>
        </div>
        {nav.map((item, i) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-[2px] border-l-2 ${
              i === 0 ? "bg-white/5 border-[#D4AF37] text-white" : "border-transparent text-slate-500"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </aside>

      <main className="flex-1 min-w-0 p-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">
              {t('dashboard.portfolio')}
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              {t('dashboard.activeServices')}
            </h2>
          </div>
          <button className="bg-[#D4AF37] text-black h-12 px-6 text-[10px] font-black uppercase tracking-widest">
            {t('dashboard.newAllocation')}
          </button>
        </div>

        <KycReminderBanner status={status} onOpen={() => {}} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { k: t('dashboard.balance'), v: "$25,000.00" },
            { k: t('dashboard.totalProfit'), v: "+12.4%", c: "text-emerald-500" },
            { k: t('dashboard.drawdown'), v: "-2.1%", c: "text-yellow-500" },
            { k: t('dashboard.activeAlgos'), v: "1" },
          ].map((m) => (
            <div key={m.k} className="bg-[#1A1A1A] border border-white/10 p-6">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{m.k}</p>
              <p className={`text-xl md:text-2xl font-serif font-bold ${m.c || "text-white"}`}>{m.v}</p>
            </div>
          ))}
        </div>

        <TradovateConnectCard defaultOpen={params.get("panel") === "1"} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1A1A1A] border border-white/10 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold uppercase tracking-tight mb-1">Growth Plan</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">ID: BX-2045</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-bold uppercase tracking-widest">
                active
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('dashboard.balance')}</p>
            <p className="text-2xl font-serif font-bold text-[#D4AF37]">$25,000.00</p>
          </div>
        </div>
      </main>
    </div>
  );
};

const lng = params.get("lng");
if (lng) i18n.changeLanguage(lng);

createRoot(document.getElementById("root")!).render(<Shell />);

setTimeout(() => {
  document.body.setAttribute("data-ready", "true");
}, 600);
