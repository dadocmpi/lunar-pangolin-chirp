// ============================================================================
// OperatorActivations — the operator panel for account-activation requests.
//
// Lists requests with filters by firm and status, shows the details and the
// receipt (via a short-lived signed URL minted by activation-review) and
// offers approve / reject / request-info buttons.
//
// Access control: the list is read under the operator RLS policy
// (auth.jwt() -> app_metadata ->> 'operator' = true) and every action goes
// through activation-review, which re-checks operator status server-side.
// The client never decides authorization.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, FileText, X } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { ACTIVATION_STATUSES, type ActivationStatus } from "@/lib/activationStatus";
import { useActivationConfig } from "@/lib/activationConfig";

interface Row {
  id: string;
  user_id: string;
  firm: string;
  plan_name: string;
  account_login: string;
  purchase_email: string;
  receipt_path: string | null;
  status: ActivationStatus;
  operator_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  strategy_confirmed_at: string | null;
}

const OperatorActivations = () => {
  const { t } = useTranslation();
  const { config } = useActivationConfig();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [firmFilter, setFirmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [busy, setBusy] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ row: Row; receiptUrl: string | null } | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase
      .from("account_activations")
      .select("id, user_id, firm, plan_name, account_login, purchase_email, receipt_path, status, operator_note, submitted_at, reviewed_at, created_at, strategy_confirmed_at")
      .order("created_at", { ascending: false });
    if (firmFilter !== "all") query = query.eq("firm", firmFilter);
    if (statusFilter === "open") query = query.in("status", ["pending", "in_review", "info_requested"]);
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

  const openDetail = async (row: Row) => {
    setNoteDraft(row.operator_note ?? "");
    setDetail({ row, receiptUrl: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(functionsUrl(`activation-review?id=${encodeURIComponent(row.id)}`), {
        method: "GET",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setDetail({ row, receiptUrl: json?.receiptUrl ?? null });
      }
    } catch {
      /* the receipt simply won't render; the decision buttons still work */
    }
  };

  const review = async (row: Row, action: "start_review" | "approve" | "reject" | "request_info") => {
    if ((action === "reject" || action === "request_info") && !noteDraft.trim()) {
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
      const res = await fetch(functionsUrl("activation-review"), {
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
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t("operatorActivations.activationsTitle")}</h1>
            <p className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest">{t("operatorActivations.activationsSubtitle")}</p>
          </div>
          <Button onClick={load} className="bg-white/10 hover:bg-white/20 text-white rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest">
            <RefreshCw size={14} className="me-2" /> {t("operatorActivations.refresh")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t("operatorActivations.filterFirm")}</label>
            <select
              value={firmFilter}
              onChange={(e) => setFirmFilter(e.target.value)}
              className="bg-white/5 border border-white/10 h-11 px-3 text-[11px] font-bold uppercase tracking-widest text-white outline-none"
            >
              <option value="all" className="bg-[#080B12]">{t("operatorActivations.allFirms")}</option>
              {/* Firm names come from the server config; a firm with no
                  configured affiliate link never appears. Any firm id already
                  present on a row is also offered so an old request stays
                  filterable. */}
              {firmOptions.map((f) => (
                <option key={f.id} value={f.id} className="bg-[#080B12]">{f.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t("operatorActivations.filterStatus")}</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 h-11 px-3 text-[11px] font-bold uppercase tracking-widest text-white outline-none"
            >
              <option value="open" className="bg-[#080B12]">{t("operatorActivations.statusOpen")}</option>
              <option value="all" className="bg-[#080B12]">{t("operatorActivations.allStatuses")}</option>
              {ACTIVATION_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#080B12]">{t(`activation.status.${s}`)}</option>
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
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{t("operatorActivations.noActivations")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="p-6 bg-[#080B12] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest">{row.firm} · {row.plan_name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{row.account_login} · {row.purchase_email}</p>
                  <p className="text-[9px] text-slate-600 mt-1">{row.submitted_at ?? row.created_at}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 text-[9px] font-bold uppercase tracking-widest border",
                    row.status === "approved" ? "border-emerald-500/30 text-emerald-500"
                      : row.status === "rejected" ? "border-red-500/30 text-red-500"
                      : row.status === "info_requested" ? "border-orange-500/30 text-orange-400"
                      : "border-yellow-500/30 text-yellow-500",
                  )}>
                    {t(`activation.status.${row.status}`)}
                  </span>
                  <Button onClick={() => openDetail(row)} className="bg-white/10 hover:bg-white/20 text-white rounded-none h-10 px-4 text-[10px] font-black uppercase tracking-widest">
                    {t("operatorActivations.review")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-[1200] bg-black/80 flex items-start justify-center overflow-y-auto p-4">
          <div className="w-full max-w-2xl bg-[#0B0E14] border border-white/10 mt-16">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-[11px] font-bold uppercase tracking-widest">{t("operatorActivations.detailTitle")}</h2>
              <button onClick={() => setDetail(null)} aria-label={t("operatorActivations.close")}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <Detail label={t("activation.firmLabel")} value={detail.row.firm} />
              <Detail label={t("activation.planNameLabel")} value={detail.row.plan_name} />
              <Detail label={t("activation.accountLoginLabel")} value={detail.row.account_login} />
              <Detail label={t("activation.purchaseEmailLabel")} value={detail.row.purchase_email} />

              {/* TradersPost strategy self-declaration (execution tool) */}
              <Detail
                label={t("planActive.traderspostTitle")}
                value={detail.row.strategy_confirmed_at
                  ? `${t("planActive.traderspostConfirmed")} · ${detail.row.strategy_confirmed_at}`
                  : "—"}
              />

              {/* Receipt */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t("activation.receiptLabel")}</p>
                {detail.receiptUrl ? (
                  detail.receiptUrl.toLowerCase().includes(".pdf") ? (
                    <a href={detail.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[11px] text-[#D4AF37] underline">
                      <FileText size={14} /> {t("operatorActivations.openReceipt")}
                    </a>
                  ) : (
                    <img src={detail.receiptUrl} alt={t("operatorActivations.receiptAlt")} className="max-h-80 border border-white/10" />
                  )
                ) : (
                  <p className="text-[11px] text-slate-500">{t("operatorActivations.receiptUnavailable")}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t("activation.operatorNote")}</label>
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-none text-[13px] text-white"
                  placeholder={t("operatorActivations.notePlaceholder")}
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {detail.row.status === "pending" && (
                  <Button
                    disabled={busy === detail.row.id}
                    onClick={() => review(detail.row, "start_review")}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest"
                  >
                    {t("operatorActivations.startReview")}
                  </Button>
                )}
                <Button
                  disabled={busy === detail.row.id}
                  onClick={() => review(detail.row, "approve")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest"
                >
                  {t("operatorActivations.approve")}
                </Button>
                <Button
                  disabled={busy === detail.row.id}
                  onClick={() => review(detail.row, "request_info")}
                  className="bg-orange-600 hover:bg-orange-500 text-white rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest"
                >
                  {t("operatorActivations.requestInfo")}
                </Button>
                <Button
                  disabled={busy === detail.row.id}
                  onClick={() => review(detail.row, "reject")}
                  className="bg-red-600 hover:bg-red-500 text-white rounded-none h-11 px-5 text-[10px] font-black uppercase tracking-widest"
                >
                  {t("operatorActivations.reject")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-[11px] text-slate-200 text-end break-all">{value}</span>
  </div>
);

export default OperatorActivations;
