"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Plug,
  ShieldCheck,
  Unplug,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { functionsUrl, isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { useTradovateConnection } from "@/hooks/useTradovateConnection";
import { isTradovateSkipAllowed } from "@/lib/tradovateFlag";
import { postGatePath } from "@/lib/tradovate/guard";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type Environment = "demo" | "live";

interface AccountOption {
  id: number;
  name: string;
  simulation?: boolean;
}

/** Server error codes mapped to a UI state, so the message is never generic. */
type GateErrorCode =
  | "invalid_credentials"
  | "api_disabled"
  | "rate_limited"
  | "circuit_open"
  | "transport"
  | "unexpected"
  | "missing_credentials"
  | "invalid_environment"
  | "encryption_not_configured"
  | null;

const ConnectTradovate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/dashboard";

  const { loading, required, connected, integrations, refresh } =
    useTradovateConnection(true);

  const [environment, setEnvironment] = useState<Environment>("demo");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [cid, setCid] = useState("");
  const [sec, setSec] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<GateErrorCode>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [pending, setPending] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Auto-skip: a returning user with a valid connection goes straight on.
  useEffect(() => {
    if (!loading && (!required || connected)) {
      navigate(postGatePath({ loading, required, connected }, from), { replace: true });
    }
  }, [loading, required, connected, from, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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
    try {
      const res = await fetch(functionsUrl("tradovate-connect"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({
          environment,
          name,
          password,
          cid: cid || undefined,
          sec: sec || undefined,
          accountId: accountId ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (data?.code === "account_selection_required") {
        setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
        setPending(true);
        return;
      }
      if (!res.ok || !data?.ok) {
        setErrorCode((data?.code as GateErrorCode) ?? "unexpected");
        setErrorMessage(typeof data?.message === "string" ? data.message : null);
        return;
      }
      // Success — clear secrets from memory immediately.
      setPassword("");
      setSec("");
      showSuccess(t("connectTradovate.connectedToast"));
      await refresh();
      navigate(postGatePath({ loading: false, required: true, connected: true }, from), {
        replace: true,
      });
    } catch {
      setErrorCode("transport");
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
    } catch {
      showError(t("connectTradovate.errors.disconnect"));
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSkip = () => {
    if (!isTradovateSkipAllowed()) return;
    navigate("/dashboard", { replace: true });
  };

  const errorText = (() => {
    if (!errorCode) return null;
    const key = `connectTradovate.errors.${errorCode}`;
    const translated = t(key);
    // Fall back to the server's own message when we have no specific string.
    if (translated === key) return errorMessage || t("connectTradovate.errors.unexpected");
    return translated;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#C5A059] selection:text-black">
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-3.5">
            <img src="/logo-white.svg" alt="Braxel Markets" className="h-10 w-auto object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tighter text-white">BRAXEL</span>
              <span className="text-[#C5A059] text-[8px] font-bold tracking-[0.2em]">MARKETS</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white"
          >
            <LogOut size={14} /> {t("connectTradovate.signOut")}
          </button>
        </div>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#C5A059]/30 bg-[#C5A059]/5 mb-5">
            <ShieldCheck size={14} className="text-[#C5A059]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
              {t("connectTradovate.badge")}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            {t("connectTradovate.title")}
          </h1>
          <p className="text-slate-400 text-sm mt-4 max-w-2xl leading-relaxed">
            {t("connectTradovate.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 bg-[#1A1A1A] border border-white/10 p-8">
            {/* Environment switch */}
            <div className="mb-7">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t("connectTradovate.environmentLabel")}
              </label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {(["demo", "live"] as Environment[]).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={cn(
                      "p-4 border text-left transition-all",
                      environment === env
                        ? "border-[#C5A059] bg-[#C5A059]/5"
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]",
                    )}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest block">
                      {t(`connectTradovate.environment.${env}`)}
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      {t(`connectTradovate.environment.${env}Desc`)}
                    </span>
                  </button>
                ))}
              </div>
              {environment === "live" && (
                <div className="mt-3 flex items-start gap-2 text-[10px] text-amber-400/90">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <span>{t("connectTradovate.liveWarning")}</span>
                </div>
              )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              </div>
            </div>

            {/* Error states */}
            {errorCode && (
              <div className="mt-6 p-4 border border-red-500/30 bg-red-500/5 flex items-start gap-3">
                {errorCode === "rate_limited" || errorCode === "circuit_open"
                  ? <Clock size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  : <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-red-300">
                    {t(`connectTradovate.errors.${errorCode}Title`, {
                      defaultValue: t("connectTradovate.errors.title"),
                    })}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{errorText}</p>
                </div>
              </div>
            )}

            {/* Account selection (multiple accounts) */}
            {pending && accounts.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t("connectTradovate.selectAccount")}
                </p>
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => submit(a.id)}
                    disabled={submitting}
                    className="w-full p-4 border border-white/10 hover:border-[#C5A059] bg-white/[0.02] text-left flex items-center justify-between"
                  >
                    <span className="text-[12px] font-bold uppercase tracking-widest">{a.name}</span>
                    <span className="text-[9px] text-slate-500">
                      {a.simulation
                        ? t("connectTradovate.environment.demo")
                        : t("connectTradovate.environment.live")}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <Button
              onClick={() => submit()}
              disabled={submitting}
              className="w-full mt-7 bg-[#C5A059] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {submitting
                ? <Loader2 className="animate-spin" />
                : <><Plug size={16} className="mr-2" /> {t("connectTradovate.connectButton")}</>}
            </Button>

            <p className="text-[9px] text-slate-600 mt-4 leading-relaxed">
              {t("connectTradovate.securityNote")}
            </p>

            {isTradovateSkipAllowed() && (
              <button
                onClick={handleSkip}
                className="w-full mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white"
              >
                {t("connectTradovate.skip")}
              </button>
            )}
          </div>

          {/* Existing connections */}
          <div className="bg-[#1A1A1A] border border-white/10 p-6">
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
                      className="mt-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300"
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

export default ConnectTradovate;
