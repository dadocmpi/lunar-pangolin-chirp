"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TradingTerminal from '@/components/terminal/TradingTerminal';
import PerformancePanel from '@/components/terminal/PerformancePanel';
import TradovateConnectCard from '@/components/TradovateConnectCard';
import TradovateWelcome from '@/components/TradovateWelcome';
import KycReminderBanner from '@/components/KycReminderBanner';
import WithdrawalKycGate, { type KycStatus as WithdrawalKycStatus } from '@/components/WithdrawalKycGate';
import {
  LayoutDashboard,
  Wallet,
  User,
  Loader2,
  LogOut,
  ArrowUpRight,
  AlertCircle,
  Save,
  Smartphone,
  FileText,
  Activity,
  Shield,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  Settings,
  Mail,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  ChevronDown,
  ChevronLeft,
  Globe,
  CreditCard,
  Plug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { notifyOwner } from '@/lib/notifyOwner';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/hooks/useCurrency';
import { useTradovateConnection } from '@/hooks/useTradovateConnection';
import { useLanguageLocale } from '@/hooks/useLanguageLocale';
import { computePerformance } from '@/lib/tradovate/performance';
import {
  resolvePerformanceSummary,
  resolveTransactions,
  resolveAuditLog,
  type TradeLike,
  type WithdrawalLike,
} from '@/lib/dashboardData';

/** "2026-06" -> a short localized month label, e.g. "Jun 2026". */
function formatMonthLabel(key: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return key;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** ISO timestamp -> short localized date + time, or an em dash when absent. */
function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { convertPrice, currency } = useCurrency();
  const locale = useLanguageLocale();
  const [activeView, setActiveView] = useState('services');
  // First-run soft gate: drives the welcome screen on the default view only.
  const tradovate = useTradovateConnection(true);
  const [settingsTab, setSettingsTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  interface ServiceRecord {
    id: string;
    name?: string | null;
    description?: string | null;
    price?: number | null;
    plan_name?: string | null;
    account_id?: string | null;
    balance?: string | number | null;
    status?: string | null;
  }

  interface ProfileRecord {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    kyc_status?: "pending" | "submitted" | "approved" | "rejected" | null;
    kyc_country?: string | null;
    kyc_method?: string | null;
    kyc_document_type?: string | null;
    kyc_document_url?: string | null;
  }

  const [services, setServices] = useState<ServiceRecord[]>([]);
  // Real data for the performance view: closed trades (net PnL) and the user's
  // withdrawal requests. No mock/demo rows — empty stays empty.
  const [trades, setTrades] = useState<TradeLike[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalLike[]>([]);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string | null; email_confirmed_at?: string | null; user_metadata?: Record<string, unknown> | null } | null>(null);
  const navigate = useNavigate();

  // KYC state - NEW IMPROVED FLOW
  const [kycStatus, setKycStatus] = useState<'pending' | 'submitted' | 'approved' | 'rejected'>('pending');
  const [kycReviewReason, setKycReviewReason] = useState<string | null>(null);
  // Profile edit state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);
  const [emailConfirmCode, setEmailConfirmCode] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    // Dashboard needs auth to show anything. Without Supabase configured there
    // is no session to read, so fail closed to the unauthenticated state instead
    // of throwing from the client proxy.
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    fetchData();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to services changes (for portfolio updates)
      const servicesChannel = supabase
        .channel('services-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'services',
            filter: `user_id=eq.${user.id}`
          },
          () => { fetchData(); }
        )
        .subscribe();

      // Subscribe to profile changes (for real-time KYC status updates)
      const profileChannel = supabase
        .channel('profile-kyc-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            const newKycStatus = (payload.new as { kyc_status?: "pending" | "submitted" | "approved" | "rejected" | null } | null)?.kyc_status;
            if (newKycStatus) {
              setKycStatus(newKycStatus);
              if (newKycStatus === 'approved') {
                showSuccess(t('dashboard.identityVerified'));
              } else if (newKycStatus === 'rejected') {
                showError(t('dashboard.verificationRejected'));
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(servicesChannel);
        supabase.removeChannel(profileChannel);
      };
    };

    setupRealtime();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setServices(servicesData || []);

      // Real performance inputs. Both are owner-readable under RLS; a failure
      // must not blank the dashboard, so each is guarded and falls back to [].
      try {
        const { data: tradeData } = await supabase
          .from('trades')
          .select('root_symbol, symbol, side, quantity, entry_price, exit_price, opened_at, closed_at, net_pnl, status')
          .order('opened_at', { ascending: false });
        setTrades((tradeData as TradeLike[] | null) ?? []);
      } catch {
        setTrades([]);
      }

      try {
        const { data: withdrawalData } = await supabase
          .from('withdrawal_requests')
          .select('id, amount_cents, currency, method, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setWithdrawals((withdrawalData as WithdrawalLike[] | null) ?? []);
      } catch {
        setWithdrawals([]);
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const p = profileData || { first_name: user.user_metadata?.full_name || '', last_name: '' };
      setProfile(p);
      setEditFirstName(p.first_name || '');
      setEditLastName(p.last_name || '');
      setEditEmail(user.email || '');

      // KYC status: the latest submission wins over the profile fallback, so a
      // resubmission or a reviewer decision is reflected immediately.
      const { data: submission } = await supabase
        .from('kyc_submissions')
        .select('status, review_reason, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const fromProfile = (profileData as { kyc_status?: string | null } | null)?.kyc_status;
      const effective = (submission?.status as string | undefined) ??
        (fromProfile === 'approved' || fromProfile === 'submitted' || fromProfile === 'rejected'
          ? fromProfile
          : 'pending');
      setKycStatus(effective as 'pending' | 'submitted' | 'approved' | 'rejected');
      setKycReviewReason((submission?.review_reason as string | null) ?? null);
    } catch (error: unknown) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('sessionExpiry');
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, first_name: editFirstName, last_name: editLastName });

      if (error) throw error;

      setProfile({ ...profile, first_name: editFirstName, last_name: editLastName });
      await notifyOwner({
        type: 'conta',
        subject: 'Dados da conta alterados (perfil)',
        replyTo: user?.email,
        data: {
          email: user?.email,
          evento: 'profile_updated',
          nome: `${editFirstName} ${editLastName}`.trim(),
          origem: 'dashboard',
        },
      });
      showSuccess(t('dashboard.profileUpdated'));
    } catch (err: unknown) {
      showError(t('dashboard.failedUpdateProfile'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleEmailChange = async () => {
    if (editEmail === user?.email) {
      showError(t('dashboard.differentEmail'));
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ email: editEmail });
      if (error) throw error;
      setEmailChangeRequested(true);
      await notifyOwner({
        type: 'conta',
        subject: 'Alteração de e-mail solicitada',
        replyTo: editEmail,
        data: {
          email_atual: user?.email,
          novo_email: editEmail,
          evento: 'email_change_requested',
          origem: 'dashboard',
        },
      });
      showSuccess(t('dashboard.confirmationLinkSent'));
    } catch (err: unknown) {
      showError(t('dashboard.failedEmail'));
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      showError(t('dashboard.passwordsDoNotMatch'));
      return;
    }
    if (newPassword.length < 8) {
      showError(t('dashboard.passwordTooShort'));
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      await notifyOwner({
        type: 'conta',
        subject: 'Senha da conta alterada',
        replyTo: user?.email,
        data: {
          email: user?.email,
          evento: 'password_changed',
          origem: 'dashboard',
        },
      });
      showSuccess(t('dashboard.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      showError(t('dashboard.failedPassword'));
    } finally {
      setChangingPassword(false);
    }
  };


  // Derived, real view models. Every figure below comes from the user's own
  // rows; there is no hardcoded performance number and no demo fallback.
  const performance = useMemo(
    () => resolvePerformanceSummary({ services, trades }),
    [services, trades],
  );
  const transactions = useMemo(() => resolveTransactions(withdrawals), [withdrawals]);
  const auditLog = useMemo(() => resolveAuditLog(trades), [trades]);
  // Rich performance stats from the same real closed trades.
  const tradeStats = useMemo(() => computePerformance(trades), [trades]);

  // KYC no longer blocks the terminal. It is enforced only at withdrawal time
  // (server-side), and remains optional/voluntary in Settings.

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      <div className="container mx-auto px-4 md:px-8 pt-[140px] pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-2">
            <div className="p-6 bg-[#1A1A1A] border border-white/10 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {profile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold uppercase tracking-widest truncate">{profile?.first_name || t('dashboard.investor')}</p>
                  <p className="text-[9px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest">
                {kycStatus === 'approved' ? (
                  <><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> <span className="text-emerald-500">{t('dashboard.verifiedAccount')}</span></>
                ) : kycStatus === 'submitted' ? (
                  <><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" /> <span className="text-yellow-500">{t('dashboard.kycUnderReview')}</span></>
                ) : (
                  <><div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" /> <span className="text-[#D4AF37]">{t('dashboard.kycBadgeRequired')}</span></>
                )}
              </div>
            </div>

            {[
              { id: 'services', label: t('nav.dashboard'), icon: <LayoutDashboard size={18} /> },
              { id: 'tradovate', label: t('nav.tradovate'), icon: <Plug size={18} /> },
              { id: 'performance', label: t('dashboard.navPerformance'), icon: <BarChart3 size={18} /> },
              { id: 'withdraw', label: t('dashboard.withdraw'), icon: <Wallet size={18} /> },
              { id: 'auditlog', label: t('dashboard.navAuditLog'), icon: <Activity size={18} /> },
              { id: 'settings', label: t('dashboard.settings'), icon: <Settings size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all border-l-2",
                  activeView === item.id ? "bg-white/5 border-[#D4AF37] text-white" : "border-transparent text-slate-500 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-[2px] text-red-500 hover:bg-red-500/5 mt-8">
              <LogOut size={18} /> {t('nav.logout')}
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 relative">

            {/* Dashboard Overview */}
            {activeView === 'services' && (
              tradovate.enabled && tradovate.welcomeShow ? (
                /* First-run SOFT gate: full-content welcome/connect screen
                   BEFORE any dashboard content, only on the default view.
                   Not a router guard — the sidebar and every other view stay
                   reachable, and "Skip for now" persists server-side. */
                <TradovateWelcome
                  onConnected={tradovate.refresh}
                  onSkip={tradovate.skipWelcome}
                />
              ) : (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.portfolio')}</span>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t('dashboard.activeServices')}</h2>
                  </div>
                  <Button onClick={() => navigate('/pricing')} className="bg-[#D4AF37] text-black hover:bg-[#B08D48] rounded-none h-12 text-[10px] font-black uppercase tracking-widest">
                    {t('dashboard.newAllocation')} <ArrowUpRight size={16} className="ms-2" />
                  </Button>
                </div>

                {/* Prominent Tradovate connect entry point — the first thing
                    on the terminal. Username + password, no gate. */}
                <TradovateConnectCard />

                {/* Non-blocking KYC reminder. The terminal is fully usable
                    without it; only withdrawals require verification. */}
                <KycReminderBanner
                  status={kycStatus}
                  onOpen={() => { setActiveView('settings'); setSettingsTab('kyc'); }}
                />

                {/* Metrics Cards — every value is real or an explicit empty state. */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.balance')}</p>
                    <p className="text-xl md:text-2xl font-serif font-bold text-white">
                      {convertPrice(performance.totalBalance)}
                    </p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.totalProfit')}</p>
                    {performance.hasData ? (
                      <p className={cn("text-xl md:text-2xl font-serif font-bold", performance.totalProfit >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {performance.totalProfit >= 0 ? '+' : ''}{convertPrice(performance.totalProfit)}
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-slate-500 mt-1">{t('dashboard.noPerformanceData')}</p>
                    )}
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.drawdown')}</p>
                    {performance.hasData && performance.maxDrawdown !== null ? (
                      <p className="text-xl md:text-2xl font-serif font-bold text-yellow-500">
                        {convertPrice(performance.maxDrawdown)}
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-slate-500 mt-1">{t('dashboard.noPerformanceData')}</p>
                    )}
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.activeAlgos')}</p>
                    <p className="text-xl md:text-2xl font-serif font-bold text-white">{services.length}</p>
                  </div>
                </div>

                <PerformancePanel stats={tradeStats} locale={locale} />

                {services.length === 0 ? (
                  <div className="p-16 border border-dashed border-white/10 bg-[#1A1A1A] text-center">
                    <AlertCircle className="mx-auto text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('dashboard.noServices')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="bg-[#1A1A1A] border border-white/10 p-8 group hover:border-[#D4AF37]/30 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-lg font-bold uppercase tracking-tight mb-1">{service.plan_name}</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{t('dashboard.serviceId', { id: service.account_id })}</p>
                          </div>
                          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-bold uppercase tracking-widest">
                            {service.status}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('dashboard.balance')}</p>
                          <p className="text-2xl font-serif font-bold text-[#D4AF37]">{convertPrice(parseFloat(String(service.balance ?? 0)))}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )
            )}

            {/* Tradovate trading terminal — real data from the user's linked
                account (balance, positions, orders, journal, performance). */}
            {activeView === 'tradovate' && (
              <TradingTerminal />
            )}

            {/* Performance View — real stats computed from the user's trades */}
            {activeView === 'performance' && (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.analytics')}</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t('dashboard.performanceTitle')}</h2>
                </div>

                <PerformancePanel stats={tradeStats} locale={locale} />

                <div className="bg-[#1A1A1A] border border-white/10 p-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-6">{t('dashboard.monthlyReturns')}</h3>
                  {performance.monthlyReturns.length === 0 ? (
                    <div className="p-10 border border-dashed border-white/10 text-center">
                      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('dashboard.noPerformanceData')}</p>
                      <p className="text-slate-600 text-[10px] mt-2">{t('dashboard.noPerformanceDataHint')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                      {performance.monthlyReturns.map((r) => (
                        <div key={r.month} className="text-center p-4 bg-white/[0.02] border border-white/5">
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{formatMonthLabel(r.month)}</p>
                          <p className={cn("text-sm font-bold", r.value >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {r.value >= 0 ? '+' : ''}{convertPrice(r.value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Withdrawal View — KYC gate first, form only when approved */}
            {activeView === 'withdraw' && (
              kycStatus !== 'approved' ? (
                <WithdrawalKycGate
                  status={kycStatus as WithdrawalKycStatus}
                  reviewReason={kycReviewReason}
                  onApproved={() => setKycStatus('approved')}
                />
              ) : (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.liquidity')}</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t('dashboard.requestWithdraw')}</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <form className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-4">{t('dashboard.newWithdrawalRequest')}</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.selectAccount')}</label>
                      <select className="w-full bg-white/5 border border-white/10 h-14 px-4 text-[12px] font-bold uppercase tracking-widest text-white outline-none appearance-none">
                        <option value="" className="bg-[#1A1A1A]">{t('dashboard.selectAccount')}</option>
                        {services.map(s => (
                          <option key={s.id} value={s.account_id} className="bg-[#1A1A1A]">{s.plan_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.amount')}</label>
                      <Input placeholder={t('dashboard.withdrawalAmountPlaceholder')} className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.walletIban')}</label>
                      <Input placeholder={t('dashboard.withdrawalWalletPlaceholder')} className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.networkLabel')}</label>
                      <select className="w-full bg-white/5 border border-white/10 h-14 px-4 text-[12px] font-bold uppercase tracking-widest text-white outline-none appearance-none">
                        <option className="bg-[#1A1A1A]">{t('dashboard.network.erc20')}</option>
                        <option className="bg-[#1A1A1A]">{t('dashboard.network.trc20')}</option>
                        <option className="bg-[#1A1A1A]">{t('dashboard.network.bep20')}</option>
                        <option className="bg-[#1A1A1A]">{t('dashboard.network.bankSwift')}</option>
                      </select>
                    </div>

                    <Button className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]">
                      {t('dashboard.btnWithdraw')}
                    </Button>
                  </form>

                  {/* Transaction History */}
                  <div className="bg-[#1A1A1A] border border-white/10 p-8">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">{t('dashboard.transactionHistory')}</h3>
                    {transactions.length === 0 ? (
                      <div className="p-10 border border-dashed border-white/10 text-center">
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('dashboard.noTransactions')}</p>
                      </div>
                    ) : (
                    <div className="space-y-4">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-4">
                            {tx.status === 'completed' ? (
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : (
                              <Clock size={16} className="text-yellow-500" />
                            )}
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest">{t('dashboard.withdraw')}</p>
                              <p className="text-[9px] text-slate-500">{formatDateTime(tx.date)}</p>
                            </div>
                          </div>
                          <div className="text-end">
                            <p className="text-sm font-bold text-red-400">
                              -{convertPrice(tx.amount)}
                            </p>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">{tx.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                  </div>
                </div>
              </div>
              )
            )}

            {/* Audit Log View */}
            {activeView === 'auditlog' && (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.operations')}</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t('dashboard.auditLogTitle')}</h2>
                  <p className="text-slate-500 text-[12px] mt-2">{t('dashboard.auditLogDesc')}</p>
                </div>

                {auditLog.length === 0 ? (
                  <div className="p-12 border border-dashed border-white/10 bg-[#1A1A1A] text-center">
                    <Activity size={32} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('dashboard.noAuditLog')}</p>
                  </div>
                ) : (
                <div className="bg-[#1A1A1A] border border-white/10 overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-start p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.asset')}</th>
                        <th className="text-start p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.type')}</th>
                        <th className="text-start p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.entry')}</th>
                        <th className="text-start p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.exit')}</th>
                        <th className="text-start p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.profit')}</th>
                        <th className="text-start p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.time')}</th>
                        <th className="text-start p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.map((op) => (
                        <tr key={op.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-[11px] font-bold text-white">{op.asset}</td>
                          <td className="p-4">
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1", op.side === 'long' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-400 bg-red-500/10')}>
                              {t(`tradovate.side.${op.side}`)}
                            </span>
                          </td>
                          <td className="p-4 text-[11px] text-slate-300 font-mono">${op.entry}</td>
                          <td className="p-4 text-[11px] text-slate-300 font-mono">{op.exit === null ? '—' : `$${op.exit}`}</td>
                          <td className={cn("p-4 text-[11px] font-bold", op.netPnl >= 0 ? "text-emerald-500" : "text-red-400")}>
                            {op.netPnl >= 0 ? '+' : ''}{convertPrice(op.netPnl)}
                          </td>
                          <td className="p-4 text-[10px] text-slate-500">{formatDateTime(op.time)}</td>
                          <td className="p-4">
                            <span className={cn("text-[9px] font-bold uppercase tracking-widest", op.status === 'open' ? 'text-[#D4AF37]' : 'text-slate-500')}>
                              {t(`dashboard.${op.status}`)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            )}

            {/* Settings View (Profile + KYC + Security) */}
            {activeView === 'settings' && (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.settings')}</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t('dashboard.accountSettingsTitle')}</h2>
                </div>

                {/* Settings Tabs */}
                <div className="flex border-b border-white/10">
                  {[
                    { id: 'profile', label: t('dashboard.tabProfile'), icon: <User size={14} /> },
                    { id: 'kyc', label: t('dashboard.tabKycVerification'), icon: <FileText size={14} /> },
                    { id: 'security', label: t('dashboard.tabSecurity'), icon: <Shield size={14} /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 -mb-px",
                        settingsTab === tab.id ? "border-[#D4AF37] text-white" : "border-transparent text-slate-500 hover:text-white"
                      )}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Profile Tab */}
                {settingsTab === 'profile' && (
                  <div className="max-w-3xl space-y-8">
                    {/* Name Fields */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white flex items-center gap-3">
                        <User size={16} className="text-[#D4AF37]" /> {t('dashboard.personalInformation')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.firstName')}</label>
                          <Input
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.lastName')}</label>
                          <Input
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-12 font-black text-[10px] uppercase tracking-widest"
                      >
                        {savingProfile ? <Loader2 size={16} className="me-2 animate-spin" /> : <Save size={16} className="me-2" />}
                        {t('dashboard.saveChanges')}
                      </Button>
                    </div>

                    {/* Email Change */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white flex items-center gap-3">
                        <Mail size={16} className="text-[#D4AF37]" /> {t('dashboard.emailAddress')}
                      </h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {t('dashboard.emailChangeNotice')}
                      </p>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.currentEmail')}</label>
                        <div className="flex items-center gap-2 p-4 bg-white/[0.02] border border-white/5">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="text-[12px] text-white">{user?.email}</span>
                        </div>
                      </div>

                      {!emailChangeRequested ? (
                        <>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.newEmailLabel')}</label>
                            <Input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder={t('dashboard.newEmailPlaceholder')}
                              className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white"
                            />
                          </div>
                          <Button
                            onClick={handleEmailChange}
                            className="bg-white/10 hover:bg-white/20 text-white rounded-none h-12 font-black text-[10px] uppercase tracking-widest"
                          >
                            <Mail size={16} className="me-2" /> {t('dashboard.sendConfirmationLink')}
                          </Button>
                        </>
                      ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">{t('dashboard.confirmationSent')}</p>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {t('dashboard.emailChangeSentTo', { email: editEmail })}
                          </p>
                          <button
                            onClick={() => setEmailChangeRequested(false)}
                            className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest mt-4 hover:underline"
                          >
                            {t('dashboard.tryDifferentEmail')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* KYC Tab - NEW IMPROVED FLOW */}
                {settingsTab === 'kyc' && (
                  <div className="space-y-8">
                    {/* KYC status banner. Verification is only required to
                        request a withdrawal; the terminal never blocks on it. */}
                    <div className={cn(
                      "p-6 flex items-center gap-4 border",
                      kycStatus === 'approved' ? "bg-emerald-500/10 border-emerald-500/20" :
                      kycStatus === 'submitted' ? "bg-yellow-500/10 border-yellow-500/20" :
                      kycStatus === 'rejected' ? "bg-red-500/10 border-red-500/20" :
                      "bg-[#D4AF37]/10 border-[#D4AF37]/20"
                    )}>
                      {kycStatus === 'approved' && <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />}
                      {kycStatus === 'submitted' && <Clock size={24} className="text-yellow-500 shrink-0" />}
                      {kycStatus === 'rejected' && <XCircle size={24} className="text-red-500 shrink-0" />}
                      {kycStatus === 'pending' && <AlertTriangle size={24} className="text-[#D4AF37] shrink-0" />}
                      <div>
                        <p className={cn("text-[11px] font-bold uppercase tracking-widest",
                          kycStatus === 'approved' ? 'text-emerald-500' :
                          kycStatus === 'submitted' ? 'text-yellow-500' :
                          kycStatus === 'rejected' ? 'text-red-500' : 'text-[#D4AF37]'
                        )}>
                          {kycStatus === 'approved' ? t('dashboard.kyc.approved') :
                           kycStatus === 'submitted' ? t('dashboard.kyc.underReview') :
                           kycStatus === 'rejected' ? t('dashboard.kyc.rejected') :
                           t('dashboard.kyc.optionalTitle')}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {kycStatus === 'approved' ? t('dashboard.kyc.descApproved') :
                           kycStatus === 'submitted' ? t('dashboard.kyc.descSubmitted') :
                           kycStatus === 'rejected' ? t('dashboard.kyc.descRejected') :
                           t('dashboard.kycBannerHint')}
                        </p>
                      </div>
                    </div>

                    {/* One verification flow: the withdrawal gate. This tab
                        explains it and links there instead of duplicating it. */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                        {t('dashboard.kyc.tabInfoTitle')}
                      </h3>
                      <p className="text-[12px] text-slate-400 leading-relaxed">
                        {t('dashboard.kyc.tabInfoBody')}
                      </p>

                      <div className="bg-white/[0.02] border border-white/5 p-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">
                          {t('dashboard.kyc.progressTitle')}
                        </h4>
                        <div className="space-y-4">
                          {[
                            { step: t('dashboard.kyc.stepEmailVerification'), status: user?.email_confirmed_at ? 'approved' : 'pending' },
                            { step: t('dashboard.kyc.stepIdentityDocument'), status: kycStatus === 'approved' ? 'approved' : kycStatus === 'submitted' ? 'submitted' : 'pending' },
                            { step: t('dashboard.kyc.stepComplianceReview'), status: kycStatus === 'approved' ? 'approved' : kycStatus === 'submitted' ? 'submitted' : 'pending' },
                            { step: t('dashboard.kyc.stepAccountActivation'), status: kycStatus === 'approved' ? 'approved' : 'pending' },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5">
                              {item.status === 'approved' && <CheckCircle2 size={16} className="text-emerald-500" />}
                              {item.status === 'submitted' && <Clock size={16} className="text-yellow-500" />}
                              {item.status === 'pending' && <Clock size={16} className="text-slate-500" />}
                              <span className="text-[11px] font-bold uppercase tracking-widest">{item.step}</span>
                              <span className={cn("ms-auto text-[9px] font-bold uppercase tracking-widest",
                                item.status === 'approved' ? 'text-emerald-500' :
                                item.status === 'submitted' ? 'text-yellow-500' :
                                'text-slate-500'
                              )}>
                                {item.status === 'submitted' ? t('dashboard.kyc.statusInProgress') : item.status === 'approved' ? t('dashboard.kyc.statusComplete') : t('dashboard.kyc.statusPending')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {kycStatus !== 'approved' && (
                        <Button
                          onClick={() => setActiveView('withdraw')}
                          className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                        >
                          <FileText size={16} className="me-2" />
                          {t('dashboard.kyc.goToWithdrawal')}
                        </Button>
                      )}
                    </div>
                  </div>
                )}


                {/* Security Tab */}
                {settingsTab === 'security' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 2FA Module */}
                      <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#D4AF37]/10 flex items-center justify-center">
                            <Smartphone size={24} className="text-[#D4AF37]" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold uppercase tracking-widest">{t('dashboard.twoFactor')}</h4>
                            <p className="text-[9px] text-yellow-500 uppercase tracking-widest">{t('dashboard.notEnabled')}</p>
                          </div>
                        </div>

                        <p className="text-slate-500 text-[12px] leading-relaxed">
                          {t('dashboard.twoFactorDesc')}
                        </p>

                        <div className="bg-white/[0.02] border border-white/5 p-6 text-center">
                          <div className="w-32 h-32 mx-auto bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                            <p className="text-[9px] text-slate-500 uppercase">{t('dashboard.qrCode')}</p>
                          </div>
                          <p className="text-[9px] text-slate-500">{t('dashboard.kyc.scanAuthenticator')}</p>
                        </div>

                        <Input placeholder={t('dashboard.verificationCodePlaceholder')} className="bg-white/5 border-white/10 rounded-none h-14 text-center text-[18px] font-mono tracking-[0.5em] text-white" />

                        <Button className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-12 font-black text-[10px] uppercase tracking-widest">
                          {t('dashboard.enable2FA')}
                        </Button>
                      </div>

                      {/* Password Change */}
                      <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/5 flex items-center justify-center">
                            <KeyRound size={24} className="text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-[11px] font-bold uppercase tracking-widest">{t('dashboard.kyc.changePassword')}</h4>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t('dashboard.kyc.updateCredentials')}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.kyc.newPassword')}</label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder={t('dashboard.minPasswordPlaceholder')}
                              className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white pe-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.kyc.confirmNewPassword')}</label>
                          <Input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder={t('dashboard.confirmPasswordPlaceholder')}
                            className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white"
                          />
                        </div>

                        <Button
                          onClick={handleChangePassword}
                          disabled={changingPassword || !newPassword || !confirmNewPassword}
                          className="w-full bg-white/10 hover:bg-white/20 text-white rounded-none h-12 font-black text-[10px] uppercase tracking-widest"
                        >
                          {changingPassword ? <Loader2 size={16} className="me-2 animate-spin" /> : <Lock size={16} className="me-2" />}
                          {t('dashboard.updatePassword')}
                        </Button>
                      </div>
                    </div>

                    {/* Email Verification Status */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 size={24} className="text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest">{t('dashboard.kyc.emailVerification')}</h4>
                          <p className="text-[9px] text-emerald-500 uppercase tracking-widest">{t('dashboard.kyc.verified')}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('dashboard.kyc.verifiedEmail')}</p>
                        <p className="text-[12px] text-white">{user?.email}</p>
                      </div>
                    </div>

                    {/* Security Log */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-8">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">{t('dashboard.kyc.securityActivityLog')}</h3>
                      {/* No security-event feed exists yet. Rather than invent
                          "login from new device" rows, show an honest empty state. */}
                      <div className="p-8 border border-dashed border-white/10 text-center">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{t('dashboard.noSecurityEvents')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
