// ============================================================================
// OperatorPayments — operator view for payments, activations and audit.
//
// Reads the operator-only `operator-payments` Edge Function (list + detail +
// append-only audit). Every action goes back through the same function, which
// re-checks app_metadata.operator server-side. The client never decides
// authorization.
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
import {
  formatPaymentAmount,
  lifecycleLabelKey,
  lifecycleTone,
  methodLabelKey,
  nextActionLabelKey,
  type PaymentLifecycleState,
  type PaymentNextAction,
} from "@/lib/paymentLifecycle";

interface ActivationSummary {
  id: string;
  status: "activation_pending" | "active" | "suspended" | "disconnected";
  account_id: string;
  plan_key: string;
  plan_name: string;
  activated_at: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
  disconnected_at: string | null;
  disconnected_reason: string | null;
  activation_email_sent_at: string | null;
  updated_at: string | null;
}

interface PaymentItem {
  id: string;
  user_id: string;
  customer_email: string | null;
  customer_name: string | null;
  plan_id: string | null;
  plan_name: string | null;
  amount_cents: number | null;
  currency: string | null;
  method: string | null;
  network: string | null;
  status: string;
  status_raw: string;
  lifecycle: PaymentLifecycleState;
  next_action: PaymentNextAction;
  created_at: string | null;
  updated_at: string | null;
  confirmed_at: string | null;
  activation: ActivationSummary | null;
}

interface AuditEvent {
  id: number;
  event_id: string;
  actor: string;
  actor_id: string | null;
  source: string;
  previous_status: string | null;
  new_status: string | null;
  reason: string;
  created_at: string;
}

type OperatorAction =
  | "approve_payment"
  | "reject_payment"
  | "request_info"
  | "activate"
  | "suspend"
  | "disconnect"
  | "reinstate";

const ACTION_LABEL_KEY: Record<OperatorAction, string> = {
  approve_payment: "operatorPayments.actions.approve_payment",
  reject_payment: "operatorPayments.actions.reject_payment",
  request_info: "operatorPayments.actions.request_info",
  activate: "operatorPayments.actions.activate",
  suspend: "operatorPayments.actions.suspend",
  disconnect: "operatorPayments.actions.disconnect",
  reinstate: "operatorPayments.actions.reinstate",
};

const ACTION_STYLE: Record<OperatorAction, string> = {
  approve_payment: "bg-emerald-600 hover:bg-emerald-500 text-white",
  reject_payment: "bg-red-600 hover:bg-red-500 text-white",
  request_info: "bg-orange-600 hover:bg-orange-500 text-white",
  activate: "bg-[#C5A059] hover:bg-[#C5A059]/85 text-[#05070A]",
  suspend: "bg-orange-500/20 hover:bg-orange-500/30 text-orange-300",
  disconnect: "bg-slate-600 hover:bg-slate-500 text-white",
  reinstate: "bg-emerald-600 hover:bg-emerald-500 text-white",
};

const TONE_CLASSES: Record<string, string> = {
  neutral: "border-slate-500/30 text-slate-300",
  progress: "border-blue-500/30 text-blue-300",
  success: "border-emerald-500/30 text-emerald-400",
  warning: "border-yellow-500/30 text-yellow-400",
  error: "border-red-500/30 text-red-400",
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

const OperatorPayments = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PaymentItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ payment: PaymentItem; audit: AuditEvent[] } | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showError(t("operatorPayments.errors.unauthorized"));
        return;
      }
      const res = await fetch(functionsUrl("operator-payments"), {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(t("operatorPayments.errors.load_failed"));
        return;
      }
      setRows((json?.payments as PaymentItem[] | undefined) ?? []);
    } catch {
      showError(t("operatorPayments.errors.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (payment: PaymentItem) => {
    setNoteDraft("");
    setDetail({ payment, audit: [] });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch(
        functionsUrl(`operator-payments?paymentId=${encodeURIComponent(payment.id)}`),
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      if (!res.ok) return;
      const json = await res.json().catch(() => ({}));
      setDetail({
        payment: (json?.payment as PaymentItem | undefined) ?? payment,
        audit: (json?.audit as AuditEvent[] | undefined) ?? [],
      });
    } catch {
      /* the decision buttons still work without the audit trail */
    }
  };

  const review = async (payment: PaymentItem, action: OperatorAction) => {
    const needsNote = action === "reject_payment" || action === "request_info" ||
      action === "suspend" || action === "disconnect";
    if (needsNote && !noteDraft.trim()) {
      showError(t("operatorPayments.errors.note_required"));
      return;
    }
    setBusy(payment.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showError(t("operatorPayments.errors.unauthorized"));
        return;
      }
      const res = await fetch(functionsUrl("operator-payments"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ paymentId: payment.id, action, note: noteDraft.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json?.error === "invalid_transition") showError(t("operatorPayments.errors.invalid_transition"));
        else if (json?.error === "forbidden") showError(t("operatorPayments.errors.forbidden"));
        else if (json?.error === "note_required") showError(t("operatorPayments.errors.note_required"));
        else showError(t("operatorPayments.errors.action_failed"));
        return;
      }
      showSuccess(t("operatorPayments.actionDone"));
      setDetail(null);
      await load();
    } catch {
      showError(t("operatorPayments.errors.action_failed"));
    } finally {
      setBusy(null);
    }
  };

  const visibleRows = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((row) => row.lifecycle === filter);
  }, [rows, filter]);

  const lifecycleOptions = useMemo(() => {
    const set = new Set<PaymentLifecycleState>();
    for (const row of rows) set.add(row.lifecycle);
    return [...set];
  }, [rows]);

  const actionsFor = (payment: PaymentItem): OperatorAction[] => {
    const raw = (payment.status_raw ?? "").toLowerCase();
    const actions: OperatorAction[] = [];
    const pendingish = ["pending_manual", "pending", "processing", "created"].includes(raw);
    if (pendingish) actions.push("approve_payment", "reject_payment");
    if (raw === "pending_manual") actions.push("request_info");
    if (raw === "confirmed" && !payment.activation) actions.push("activate");
    if (payment.activation?.status === "active") actions.push("suspend", "disconnect");
    if (payment.activation?.status === "suspended") actions.push("reinstate", "disconnect");
    if (payment.activation?.status === "disconnected") actions.push("reinstate");
    return actions;
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      <div className="container mx-auto px-4 pb-20 pt-[140px] md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter md:text-3xl">
              {t("operatorPayments.title")}
            </h1>
            <p className="mt-2 text-[10px] uppercase tracking-widest text-slate-400">
              {t("operatorPayments.subtitle")}
            </p>
          </div>
          <Button onClick={load} className="h-11 rounded-none bg-white/10 px-5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20">
            <RefreshCw size={14} className="me-2" aria-hidden="true" /> {t("operatorPayments.refresh")}
          </Button>
        </div>

        <div className="mb-8 space-y-1">
          <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            {t("operatorPayments.filterStatus")}
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-11 border border-white/10 bg-white/5 px-3 text-[11px] font-bold uppercase tracking-widest text-white outline-none"
          >
            <option value="all" className="bg-[#080B12]">{t("operatorPayments.allStatuses")}</option>
            {lifecycleOptions.map((state) => (
              <option key={state} value={state} className="bg-[#080B12]">
                {t(lifecycleLabelKey(state))}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#C5A059]" size={32} aria-hidden="true" />
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="border border-dashed border-white/10 py-16 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {t("operatorPayments.noRows")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-white/10">
            <table className="min-w-full text-start">
              <thead className="bg-white/5 text-[9px] uppercase tracking-widest text-slate-400">
                <tr>
                  <Th>{t("operatorPayments.customer")}</Th>
                  <Th>{t("operatorPayments.plan")}</Th>
                  <Th>{t("operatorPayments.method")}</Th>
                  <Th>{t("operatorPayments.amount")}</Th>
                  <Th>{t("operatorPayments.paymentStatus")}</Th>
                  <Th>{t("operatorPayments.activationStatus")}</Th>
                  <Th>{t("operatorPayments.accountId")}</Th>
                  <Th>{t("operatorPayments.updated")}</Th>
                  <Th>{t("operatorPayments.open")}</Th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} className="border-t border-white/5 text-[11px] text-slate-300">
                    <Td>
                      <div className="font-bold text-white">{row.customer_name ?? row.user_id.slice(0, 8)}</div>
                      <div className="text-[10px] text-slate-500">{row.customer_email ?? "—"}</div>
                    </Td>
                    <Td>{row.plan_name ?? row.plan_id ?? "—"}</Td>
                    <Td>{t(methodLabelKey(row.method))}</Td>
                    <Td>{formatPaymentAmount(row.amount_cents, row.currency)}</Td>
                    <Td>
                      <span className={cn("inline-block border px-2 py-1 text-[9px] font-bold uppercase tracking-widest", TONE_CLASSES[lifecycleTone(row.lifecycle)])}>
                        {t(lifecycleLabelKey(row.lifecycle))}
                      </span>
                    </Td>
                    <Td>{row.activation ? row.activation.status : "—"}</Td>
                    <Td className="break-all">{row.activation?.account_id ?? "—"}</Td>
                    <Td>{formatDateTime(row.updated_at)}</Td>
                    <Td>
                      <Button
                        onClick={() => openDetail(row)}
                        className="h-9 rounded-none bg-white/10 px-3 text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/20"
                      >
                        {t("operatorPayments.open")}
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-black/80 p-4">
          <div className="mt-16 w-full max-w-3xl border border-white/10 bg-[#0B0E14]">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h2 className="text-[11px] font-bold uppercase tracking-widest">
                {t("operatorPayments.detailTitle")}
              </h2>
              <button onClick={() => setDetail(null)} aria-label={t("operatorPayments.close")}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <Detail label={t("operatorPayments.customer")} value={detail.payment.customer_name ?? detail.payment.user_id} />
              <Detail label={t("operatorPayments.customerEmail")} value={detail.payment.customer_email ?? "—"} />
              <Detail label={t("operatorPayments.plan")} value={detail.payment.plan_name ?? detail.payment.plan_id ?? "—"} />
              <Detail label={t("operatorPayments.method")} value={t(methodLabelKey(detail.payment.method))} />
              <Detail label={t("operatorPayments.amount")} value={formatPaymentAmount(detail.payment.amount_cents, detail.payment.currency)} />
              <Detail label={t("operatorPayments.reference")} value={detail.payment.id} />
              <Detail label={t("operatorPayments.paymentStatus")} value={t(lifecycleLabelKey(detail.payment.lifecycle))} />
              <Detail label={t("operatorPayments.nextAction")} value={t(nextActionLabelKey(detail.payment.next_action))} />
              <Detail label={t("operatorPayments.activationStatus")} value={detail.payment.activation?.status ?? "—"} />
              <Detail label={t("operatorPayments.accountId")} value={detail.payment.activation?.account_id ?? "—"} />
              <Detail label={t("operatorPayments.created")} value={formatDateTime(detail.payment.created_at)} />
              <Detail label={t("operatorPayments.updated")} value={formatDateTime(detail.payment.updated_at)} />

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  {t("operatorPayments.note")}
                </label>
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  className="rounded-none border-white/10 bg-white/5 text-[13px] text-white"
                  placeholder={t("operatorPayments.notePlaceholder")}
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {actionsFor(detail.payment).map((action) => (
                  <Button
                    key={action}
                    disabled={busy === detail.payment.id}
                    onClick={() => review(detail.payment, action)}
                    className={cn("h-11 rounded-none px-5 text-[10px] font-black uppercase tracking-widest", ACTION_STYLE[action])}
                  >
                    {t(ACTION_LABEL_KEY[action])}
                  </Button>
                ))}
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  {t("operatorPayments.audit")}
                </p>
                {detail.audit.length === 0 ? (
                  <p className="text-[11px] text-slate-500">{t("operatorPayments.auditEmpty")}</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.audit.map((event) => (
                      <li key={event.id} className="border border-white/5 bg-white/[0.02] p-3">
                        <div className="flex flex-wrap justify-between gap-2 text-[10px] uppercase tracking-widest text-slate-400">
                          <span className="font-bold text-slate-200">{event.event_id}</span>
                          <span>{formatDateTime(event.created_at)}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">{event.reason}</p>
                        <p className="mt-1 text-[9px] uppercase tracking-widest text-slate-600">
                          {event.actor}{event.actor_id ? ` (${event.actor_id})` : ""} · {event.source} · {event.previous_status ?? "—"} → {event.new_status ?? "—"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="whitespace-nowrap px-4 py-3 text-start font-bold">{children}</th>
);
const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={cn("px-4 py-3 align-top", className)}>{children}</td>
);
const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
    <span className="break-all text-end text-[11px] text-slate-200">{value}</span>
  </div>
);

export default OperatorPayments;
