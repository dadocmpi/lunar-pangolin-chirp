// ============================================================================
// OperatorAccountLinks — operator panel for managed-account link requests.
//
// Reads account_links under the operator RLS policy and sends every decision
// to account-link-review, which re-checks operator status and the customer's
// payment entitlement server-side. The client never decides authorization.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, X } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { LINK_STATUSES, type LinkStatus } from "@/lib/onboardingStatus";
import { useOnboardingConfig } from "@/lib/onboardingConfig";

interface Row {
  id: string;
  user_id: string;
  firm: string;
  plan_id: string;
  account_login: string;
  note: string | null;
  status: LinkStatus;
  operator_note: string | null;
  suspension_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

type Action = "start_review" | "approve" | "reject" | "suspend" | "disconnect";

const OPEN_STATUSES: LinkStatus[] = ["pending", "in_review", "approved", "suspended"];

const OperatorAccountLinks = () => {
  const { t } = useTranslation();
  const { config } = useOnboardingConfig();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [firmFilter, setFirmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [busy, setBusy] = useState<string | null>(null);
  const [detail, setDetail] = useState<Row | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase
      .from("account_links")
      .select("id, user_id, firm, plan_id, account_login, note, status, operator_note, suspension_reason, submitted_at, reviewed_at, created_at")
      .order("created_at", { ascending: false });
    if (firmFilter !== "all") query = query.eq("firm", firmFilter);
    if (statusFilter === "open") query = query.in("status", OPEN_STATUSES);
    else if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data, error } = await query;
    if (error) showError(t("operatorActivations.errors.load_failed"));
    setRows((data as Row[] | null) ?? []);
    setLoading(false);
  }, [firmFilter, statusFilter, t]);

  useEffect(() => {
    load();
  }, [load]);

  const firmOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of config.firms) map.set(f.id, f.name);
    for (const row of rows) if (!map.has(row.firm)) map.set(row.firm, row.firm);
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [config.firms, rows]);

  const openDetail = (row: Row) => {
    setNoteDraft(row.operator_note ?? row.suspension_reason ?? "");
    setDetail(row);
  };

  const review = async (row: Row, action: Action) => {
    if ((action === "reject" || action === "suspend") && !noteDraft.trim()) {
      showError(t("operatorActivations.errors.note_required"));
      return;
    }
    setBusy(row.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showError(t("operatorActivations.errors.unauthorized"));
        return;
      }
      const res = await fetch(functionsUrl("account-link-review"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: row.id, action, note: noteDraft.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json?.error === "invalid_transition") showError(t("operatorActivations.errors.invalid_transition"));
        else if (json?.error === "forbidden") showError(t("operatorActivations.errors.forbidden"));
        else if (json?.error === "payment_not_active") showError(t("operatorLinks.paymentNotActive"));
        else showError(t("operatorActivations.errors.action_failed"));
        return;
      }
      showSuccess(t("operatorActivations.action_done"));
      setDetail(null);
      await load();
    } catch {
      showError(t("operatorActivations.errors.action_failed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              {t("operatorLinks.title")}
            </h1>
            <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest">
              {t("operatorLinks.subtitle")}
            </p>
          </div>
          <Button onClick={load} className="bg-white/10 hover:bg-white/20 text-white rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest">
            <RefreshCw size={14} className="me-2" /> {t("operatorActivations.refresh")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {t("operatorActivations.filterFirm")}
            </label>
            <select
              value={firmFilter}
              onChange={(e) => setFirmFilter(e.target.value)}
              className="bg-white/5 border border-white/10 h-11 px-3 text-[11px] font-bold uppercase tracking-widest text-white outline-none"
            >
              <option value="all" className="bg-[#080B12]">{t("operatorActivations.allFirms")}</option>
              {firmOptions.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#080B12]">{f.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              {t("operatorActivations.filterStatus")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 h-11 px-3 text-[11px] font-bold uppercase tracking-widest text-white outline-none"
            >
              <option value="open" className="bg-[#080B12]">{t("operatorActivations.statusOpen")}</option>
              <option value="all" className="bg-[#080B12]">{t("operatorActivations.allStatuses")}</option>
              {LINK_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#080B12]">{t(`onboarding.status.${s}`)}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#C5A059]" size={32} />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10">
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
              {t("operatorLinks.noLinks")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="p-6 bg-[#080B12] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest">
                    {row.firm} · {row.plan_id}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {row.account_login} · {row.submitted_at ?? row.created_at}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border",
                    row.status === "approved"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : row.status === "rejected"
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : row.status === "suspended"
                      ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                      : row.status === "disconnected"
                      ? "bg-slate-500/10 border-slate-500/30 text-slate-400"
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
                  )}>
                    {t(`onboarding.status.${row.status}`)}
                  </span>
                  <Button onClick={() => openDetail(row)} className="bg-white/10 hover:bg-white/20 text-white rounded-none h-10 px-4 text-[9px] font-black uppercase tracking-widest">
                    {t("operatorLinks.open")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#080B12] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-bold uppercase tracking-widest">
                {t("operatorLinks.detailTitle")}
              </h2>
              <button onClick={() => setDetail(null)} aria-label={t("operatorLinks.close")}>
                <X size={18} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px]">
              <div className="p-4 bg-white/[0.02] border border-white/10">
                <p className="text-slate-500 uppercase tracking-widest mb-1">{t("operatorLinks.firmLabel")}</p>
                <p className="text-white">{detail.firm}</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/10">
                <p className="text-slate-500 uppercase tracking-widest mb-1">{t("operatorLinks.planLabel")}</p>
                <p className="text-white">{detail.plan_id}</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/10">
                <p className="text-slate-500 uppercase tracking-widest mb-1">{t("operatorLinks.accountLabel")}</p>
                <p className="text-white break-all">{detail.account_login}</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/10">
                <p className="text-slate-500 uppercase tracking-widest mb-1">{t("operatorLinks.submittedLabel")}</p>
                <p className="text-white">{detail.submitted_at ?? detail.created_at}</p>
              </div>
            </div>

            {detail.note && (
              <p className="text-[11px] text-slate-300 p-4 bg-white/[0.02] border border-white/10 whitespace-pre-wrap">
                {detail.note}
              </p>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                {t("operatorLinks.noteLabel")}
              </label>
              <Textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className="bg-white/5 border-white/10 rounded-none min-h-[90px] text-[12px] text-white"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {([
                ["start_review", "bg-white/10 hover:bg-white/20"],
                ["approve", "bg-emerald-600 hover:bg-emerald-500"],
                ["reject", "bg-red-600 hover:bg-red-500"],
                ["suspend", "bg-orange-600 hover:bg-orange-500"],
                ["disconnect", "bg-slate-600 hover:bg-slate-500"],
              ] as Array<[Action, string]>).map(([action, cls]) => (
                <Button
                  key={action}
                  onClick={() => review(detail, action)}
                  disabled={busy === detail.id}
                  className={cn("rounded-none h-10 px-4 text-[9px] font-black uppercase tracking-widest text-white", cls)}
                >
                  {busy === detail.id && <Loader2 size={12} className="me-2 animate-spin" />}
                  {t(`operatorLinks.actions.${action}`)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OperatorAccountLinks;
