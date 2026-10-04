// ============================================================================
// TradovateConnectPanel — in-dashboard connect modal (black/gold).
//
// Opened from the empty state's "Connect to Tradovate" button. The password
// goes straight to the tradovate-connect Edge Function over HTTPS: it is never
// stored client-side, never returned, never logged. On success the parent is
// told to refresh, the first sync runs server-side, and the view fills with
// trades via Realtime.
//
// DEMO ONLY for now: the panel offers no environment switch. The server also
// enforces this (TRADOVATE_ALLOWED_ENVIRONMENTS), so a crafted "live" request
// is rejected even though the UI never sends one.
//
// The user signs in with their Tradovate username/password; the accounts that
// belong to that login come back from the server. One account auto-completes;
// with several, the first ACTIVE one is preselected and the user confirms. The
// user is never asked to type an account id.
//
// The panel also lists existing connections and can disconnect them (which
// deletes the stored credentials server-side).
// ============================================================================

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Plug,
  ShieldCheck,
  Unplug,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { useTradovateConnection } from "@/hooks/useTradovateConnection";
import {
  classifyConnectError,
  type ConnectErrorCode,
} from "@/lib/tradovateConnectError";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface AccountOption {
  id: number;
  name: string;
  simulation?: boolean;
  active?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called after a successful connect or disconnect so the view reloads. */
  onChanged: () => void;
}

const TradovateConnectPanel = ({ open, onClose, onChanged }: Props) => {
  const { t } = useTranslation();
  const { integrations, refresh } = useTradovateConnection(open);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [cid, setCid] = useState("");
  const [sec, setSec] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<ConnectErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Never leave a typed password in memory after the panel closes.
  useEffect(() => {
    if (!open) {
      setPassword("");
      setSec("");
      setCid("");
      setShowPassword(false);
      setShowAdvanced(false);
      setErrorCode(null);
      setErrorMessage(null);
      setAccounts([]);
      setSelectedAccountId(null);
      setPending(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const authHeader = async (): Promise<Record<string, string>> => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const submit = async (accountId?: number) => {
    if (!isSupabaseConfigured()) {
      showError(t("connectTradovate.errors.unavailable"));
      return;
    }
    if (!name.trim() || !password) {
      setErrorCode("missing_credentials");
      setErrorMessage(null);
      return;
    }
    setSubmitting(true);
    setErrorCode(null);
    setErrorMessage(null);
    // A fresh attempt discards any previous account list.
    if (accountId === undefined) {
      setAccounts([]);
      setSelectedAccountId(null);
      setPending(false);
    }
    try {
      const res = await fetch(functionsUrl("tradovate-connect"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({
          // DEMO ONLY for now. The server enforces this too
          // (TRADOVATE_ALLOWED_ENVIRONMENTS); the UI never offers live.
          environment: "demo",
          name,
          password,
          cid: cid || undefined,
          sec: sec || undefined,
          accountId: accountId ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (data?.code === "account_selection_required") {
        const list: AccountOption[] = Array.isArray(data.accounts) ? data.accounts : [];
        setAccounts(list);
        // Preselect the account the server chose (first active), else the first.
        const preselect = typeof data.preselectAccountId === "number"
          ? data.preselectAccountId
          : list[0]?.id ?? null;
        setSelectedAccountId(preselect);
        setPending(true);
        return;
      }
      if (!res.ok || !data?.ok) {
        // Classify from OUR HTTP status + the server code, so a missing/broken
        // Edge Function (404/5xx) is never blamed on Tradovate or the user, and
        // a deliberate kill switch (503 feature_disabled) is not "broken".
        setErrorCode(classifyConnectError({
          status: res.status,
          serverCode: typeof data?.code === "string" ? data.code : null,
          online: navigator.onLine,
        }));
        setErrorMessage(typeof data?.message === "string" ? data.message : null);
        return;
      }
      // Success — clear secrets from memory immediately.
      setPassword("");
      setSec("");
      setPending(false);
      setAccounts([]);
      setSelectedAccountId(null);
      showSuccess(t("connectTradovate.connectedToast"));
      await refresh();
      onChanged();
      onClose();
    } catch {
      // fetch() threw: our Edge Function could not be reached. Blame the user's
      // internet only when the browser actually reports being offline.
      setErrorCode(classifyConnectError({
        networkError: true,
        online: navigator.onLine,
      }));
      setErrorMessage(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setDisconnecting(true);
    try {
      const res = await fetch(functionsUrl("tradovate-disconnect"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({ integrationId }),
      });
      if (!res.ok) throw new Error("disconnect_failed");
      showSuccess(t("connectTradovate.disconnectedToast"));
      await refresh();
      onChanged();
    } catch {
      showError(t("connectTradovate.errors.disconnect"));
    } finally {
      setDisconnecting(false);
    }
  };

  const errorText = (() => {
    if (!errorCode) return null;
    const key = `connectTradovate.errors.${errorCode}`;
    const translated = t(key);
    if (translated === key) return errorMessage || t("connectTradovate.errors.unexpected");
    return translated;
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t("connectTradovate.title")}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#121212] border border-[#C5A059]/30 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 md:p-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#C5A059]/30 bg-[#C5A059]/5 mb-4">
              <ShieldCheck size={14} className="text-[#C5A059]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                {t("connectTradovate.badge")}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">
              {t("connectTradovate.title")}
            </h2>
            <p className="text-slate-400 text-[12px] mt-3 max-w-xl leading-relaxed">
              {t("connectTradovate.subtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t("connectTradovate.close")}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
            {/* Environment: DEMO ONLY. No selector — the server enforces this too. */}
            <div className="mb-7">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t("connectTradovate.environmentLabel")}
              </label>
              <div className="mt-3 p-4 border border-[#C5A059]/30 bg-[#C5A059]/5 flex items-start gap-3">
                <ShieldCheck size={16} className="text-[#C5A059] mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest block text-[#C5A059]">
                    {t("connectTradovate.environment.demo")}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">
                    {t("connectTradovate.demoOnlyNotice")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <Field icon={<User size={16} />} label={t("connectTradovate.usernameLabel")}>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  placeholder={t("connectTradovate.usernamePlaceholder")}
                  className="pl-11 bg-white/5 border-white/10 rounded-none h-14 text-white placeholder:text-slate-700 focus:border-[#C5A059]"
                />
              </Field>

              <Field icon={<Lock size={16} />} label={t("connectTradovate.passwordLabel")}>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder={t("connectTradovate.passwordPlaceholder")}
                  className="pl-11 pr-11 bg-white/5 border-white/10 rounded-none h-14 text-white placeholder:text-slate-700 focus:border-[#C5A059]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label={t("connectTradovate.togglePassword")}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </Field>

              {/* Advanced: only needed when Tradovate issues a per-app key.
                  Normal users never see this. The app's own cid/sec are server
                  secrets, so the default flow is username + password only. */}
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300"
                  aria-expanded={showAdvanced}
                >
                  <ChevronDown
                    size={12}
                    className={cn("transition-transform", showAdvanced && "rotate-180")}
                  />
                  {t("connectTradovate.advancedToggle")}
                </button>
                {showAdvanced && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field icon={<KeyRound size={16} />} label={t("connectTradovate.cidLabel")}>
                      <Input
                        value={cid}
                        onChange={(e) => setCid(e.target.value)}
                        autoComplete="off"
                        placeholder={t("connectTradovate.cidPlaceholder")}
                        className="pl-11 bg-white/5 border-white/10 rounded-none h-14 text-white placeholder:text-slate-700 focus:border-[#C5A059]"
                      />
                    </Field>
                    <Field icon={<KeyRound size={16} />} label={t("connectTradovate.secLabel")}>
                      <Input
                        type="password"
                        value={sec}
                        onChange={(e) => setSec(e.target.value)}
                        autoComplete="new-password"
                        placeholder={t("connectTradovate.secPlaceholder")}
                        className="pl-11 bg-white/5 border-white/10 rounded-none h-14 text-white placeholder:text-slate-700 focus:border-[#C5A059]"
                      />
                    </Field>
                    <p className="md:col-span-2 text-[10px] text-slate-500 leading-relaxed">
                      {t("connectTradovate.advancedHint")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error states. "not_enabled" is a deliberate switch, so it is shown
                in a neutral/amber tone — disabled is not "broken". */}
            {errorCode && (
              <div
                className={cn(
                  "mt-6 p-4 border flex items-start gap-3",
                  errorCode === "not_enabled"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-red-500/30 bg-red-500/5",
                )}
              >
                {errorCode === "rate_limited" || errorCode === "circuit_open" || errorCode === "not_enabled"
                  ? <Clock size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  : <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />}
                <div>
                  <p
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-widest",
                      errorCode === "not_enabled" ? "text-amber-300" : "text-red-300",
                    )}
                  >
                    {t(`connectTradovate.errors.${errorCode}Title`, {
                      defaultValue: t("connectTradovate.errors.title"),
                    })}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{errorText}</p>
                  {(errorCode === "invalid_credentials" || errorCode === "api_disabled") && (
                    <p className="text-[10px] text-slate-500 mt-2">
                      {t("connectTradovate.errors.retryHint")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Account selection (multiple accounts). The first ACTIVE account is
                preselected by the server; the user confirms or changes it. The
                user never types an account id. */}
            {pending && accounts.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t("connectTradovate.selectAccount")}
                </p>
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAccountId(a.id)}
                    disabled={submitting}
                    aria-pressed={selectedAccountId === a.id}
                    className={cn(
                      "w-full p-4 border text-left flex items-center justify-between transition-all",
                      selectedAccountId === a.id
                        ? "border-[#C5A059] bg-[#C5A059]/5"
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {selectedAccountId === a.id
                        ? <CheckCircle2 size={14} className="text-[#C5A059]" />
                        : <span className="inline-block w-[14px]" />}
                      <span className="text-[12px] font-bold uppercase tracking-widest">{a.name}</span>
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {a.active === false
                        ? t("connectTradovate.accountInactive")
                        : t("connectTradovate.accountActive")}
                    </span>
                  </button>
                ))}
                <Button
                  onClick={() => selectedAccountId !== null && submit(selectedAccountId)}
                  disabled={submitting || selectedAccountId === null}
                  className="w-full mt-2 bg-[#C5A059] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] disabled:opacity-50"
                >
                  {submitting
                    ? <Loader2 className="animate-spin" />
                    : <><Plug size={16} className="mr-2" /> {t("connectTradovate.confirmAccount")}</>}
                </Button>
              </div>
            )}

            {!pending && (
              <Button
                onClick={() => submit()}
                disabled={submitting}
                className="w-full mt-7 bg-[#C5A059] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {submitting
                  ? <Loader2 className="animate-spin" />
                  : <><Plug size={16} className="mr-2" /> {t("connectTradovate.connectButton")}</>}
              </Button>
            )}

            {/* Trust notice */}
            <div className="mt-5 p-4 bg-[#C5A059]/[0.04] border border-[#C5A059]/20 flex items-start gap-3">
              <ShieldCheck size={16} className="text-[#C5A059] mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {t("connectTradovate.trustNotice")}
              </p>
            </div>
          </div>

          {/* Existing connections */}
          <div className="p-6 md:p-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
              {t("connectTradovate.connectionsTitle")}
            </h3>
            {integrations.length === 0 ? (
              <p className="text-[11px] text-slate-500">{t("connectTradovate.noConnections")}</p>
            ) : (
              <div className="space-y-3">
                {integrations.map((i) => (
                  <div key={i.id} className="p-4 bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-widest">
                        {i.label || i.accountSpec || `#${i.accountId}`}
                      </span>
                      <StatusPill status={i.status} />
                    </div>
                    <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-widest">
                      {t(`connectTradovate.environment.${i.environment}`)} · {i.accountSpec}
                    </p>
                    <button
                      onClick={() => handleDisconnect(i.id)}
                      disabled={disconnecting}
                      className="mt-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      <Unplug size={12} /> {t("connectTradovate.disconnect")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const { t } = useTranslation();
  const map: Record<string, { color: string; icon: React.ReactNode; key: string }> = {
    connected: {
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
      icon: <CheckCircle2 size={11} />,
      key: "statusConnected",
    },
    expired: {
      color: "text-amber-400 border-amber-500/30 bg-amber-500/5",
      icon: <Clock size={11} />,
      key: "statusExpired",
    },
    api_disabled: {
      color: "text-red-400 border-red-500/30 bg-red-500/5",
      icon: <AlertCircle size={11} />,
      key: "statusApiDisabled",
    },
    invalid_credentials: {
      color: "text-red-400 border-red-500/30 bg-red-500/5",
      icon: <AlertCircle size={11} />,
      key: "statusInvalidCredentials",
    },
    pending: {
      color: "text-slate-300 border-white/20 bg-white/5",
      icon: <Clock size={11} />,
      key: "statusPending",
    },
  };
  const cfg = map[status] ?? {
    color: "text-slate-300 border-white/20 bg-white/5",
    icon: <Clock size={11} />,
    key: "statusPending",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 border text-[8px] font-bold uppercase tracking-widest", cfg.color)}>
      {cfg.icon} {t(`connectTradovate.${cfg.key}`)}
    </span>
  );
}

export default TradovateConnectPanel;
