"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PerformanceChart from '@/components/PerformanceChart';
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
  Hash,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('services');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('schema-db-changes')
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

      return () => { supabase.removeChannel(channel); };
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setProfile(profileData || { first_name: user.user_metadata?.full_name || '', last_name: '' });
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Mock data for demo purposes
  const mockTransactions = [
    { id: 1, type: 'withdrawal', amount: 500, status: 'completed', date: '2026-06-10', hash: '0x7a3f...e92b' },
    { id: 2, type: 'withdrawal', amount: 1200, status: 'pending', date: '2026-06-14', hash: '' },
    { id: 3, type: 'deposit', amount: 5000, status: 'completed', date: '2026-06-01', hash: '0x2c1d...a47f' },
  ];

  const mockAuditLog = [
    { id: 1, asset: 'BTC/USDT', type: 'LONG', entry: '67,420.50', exit: '67,890.20', profit: '+0.70%', time: '2026-06-14 14:32', status: 'closed' },
    { id: 2, asset: 'ETH/USDT', type: 'SHORT', entry: '3,842.10', exit: '3,801.50', profit: '+1.06%', time: '2026-06-14 13:18', status: 'closed' },
    { id: 3, asset: 'SOL/USDT', type: 'LONG', entry: '178.90', exit: '-', profit: '+0.34%', time: '2026-06-14 15:01', status: 'open' },
    { id: 4, asset: 'BTC/USDT', type: 'LONG', entry: '66,800.00', exit: '67,150.30', profit: '+0.52%', time: '2026-06-13 22:45', status: 'closed' },
    { id: 5, asset: 'XRP/USDT', type: 'SHORT', entry: '0.5240', exit: '0.5180', profit: '+1.15%', time: '2026-06-13 19:10', status: 'closed' },
  ];

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
              <div className="flex items-center gap-2 text-[8px] font-bold text-emerald-500 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> {t('dashboard.verifiedAccount')}
              </div>
            </div>

            {[
              { id: 'services', label: t('nav.dashboard'), icon: <LayoutDashboard size={18} /> },
              { id: 'performance', label: 'Performance', icon: <BarChart3 size={18} /> },
              { id: 'withdraw', label: t('dashboard.withdraw'), icon: <Wallet size={18} /> },
              { id: 'auditlog', label: 'Audit Log', icon: <Activity size={18} /> },
              { id: 'kyc', label: 'KYC', icon: <FileText size={18} /> },
              { id: 'security', label: 'Security', icon: <Shield size={18} /> },
              { id: 'profile', label: t('dashboard.settings'), icon: <User size={18} /> },
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
          <main className="flex-1 min-w-0">
            {/* Dashboard Overview */}
            {activeView === 'services' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.portfolio')}</span>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t('dashboard.activeServices')}</h2>
                  </div>
                  <Button onClick={() => navigate('/pricing')} className="bg-[#D4AF37] text-black hover:bg-[#B08D48] rounded-none h-12 text-[10px] font-black uppercase tracking-widest">
                    {t('dashboard.newAllocation')} <ArrowUpRight size={16} className="ml-2" />
                  </Button>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.balance')}</p>
                    <p className="text-xl md:text-2xl font-serif font-bold text-white">
                      ${services.reduce((acc, s) => acc + parseFloat(s.balance || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Total Profit</p>
                    <p className="text-xl md:text-2xl font-serif font-bold text-emerald-500">+12.4%</p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Drawdown</p>
                    <p className="text-xl md:text-2xl font-serif font-bold text-yellow-500">-2.1%</p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.activeAlgos')}</p>
                    <p className="text-xl md:text-2xl font-serif font-bold text-white">{services.length}</p>
                  </div>
                </div>

                {/* Chart */}
                <PerformanceChart />

                {/* Service Cards */}
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
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">ID: {service.account_id}</p>
                          </div>
                          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-bold uppercase tracking-widest">
                            {service.status}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('dashboard.balance')}</p>
                          <p className="text-2xl font-serif font-bold text-[#D4AF37]">${parseFloat(service.balance).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Performance View */}
            {activeView === 'performance' && (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Analytics</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Performance Dashboard</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.balance')}</p>
                    <p className="text-xl font-serif font-bold text-white">${services.reduce((acc, s) => acc + parseFloat(s.balance || 0), 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={12} className="text-emerald-500" />
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Total Profit</p>
                    </div>
                    <p className="text-xl font-serif font-bold text-emerald-500">+$3,240.00</p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown size={12} className="text-yellow-500" />
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Max Drawdown</p>
                    </div>
                    <p className="text-xl font-serif font-bold text-yellow-500">-4.2%</p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">Assets in Operation</p>
                    <p className="text-xl font-serif font-bold text-white">BTC, ETH, SOL</p>
                  </div>
                </div>

                <PerformanceChart />

                <div className="bg-[#1A1A1A] border border-white/10 p-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-6">Monthly Returns</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                      const returns = [2.1, 1.8, -0.4, 3.2, 2.8, 1.9];
                      const val = returns[i];
                      return (
                        <div key={month} className="text-center p-4 bg-white/[0.02] border border-white/5">
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{month}</p>
                          <p className={cn("text-sm font-bold", val >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {val >= 0 ? '+' : ''}{val}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Withdrawal View */}
            {activeView === 'withdraw' && (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.liquidity')}</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t('dashboard.requestWithdraw')}</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <form className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-4">New Withdrawal Request</h3>
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
                      <Input placeholder="0.00" className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wallet / IBAN</label>
                      <Input placeholder="Crypto wallet address or IBAN" className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network</label>
                      <select className="w-full bg-white/5 border border-white/10 h-14 px-4 text-[12px] font-bold uppercase tracking-widest text-white outline-none appearance-none">
                        <option className="bg-[#1A1A1A]">ERC-20 (Ethereum)</option>
                        <option className="bg-[#1A1A1A]">TRC-20 (Tron)</option>
                        <option className="bg-[#1A1A1A]">BEP-20 (BSC)</option>
                        <option className="bg-[#1A1A1A]">Bank Transfer (SWIFT)</option>
                      </select>
                    </div>

                    <Button className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]">
                      {t('dashboard.btnWithdraw')}
                    </Button>
                  </form>

                  {/* Transaction History */}
                  <div className="bg-[#1A1A1A] border border-white/10 p-8">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">Transaction History</h3>
                    <div className="space-y-4">
                      {mockTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-4">
                            {tx.status === 'completed' ? (
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : (
                              <Clock size={16} className="text-yellow-500" />
                            )}
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest">{tx.type}</p>
                              <p className="text-[9px] text-slate-500">{tx.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn("text-sm font-bold", tx.type === 'withdrawal' ? "text-red-400" : "text-emerald-500")}>
                              {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                            </p>
                            {tx.hash && (
                              <div className="flex items-center gap-1 text-[8px] text-slate-500 mt-1">
                                <Hash size={10} /> {tx.hash}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Log View */}
            {activeView === 'auditlog' && (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Operations</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Audit Log</h2>
                  <p className="text-slate-500 text-[12px] mt-2">All algorithmic orders executed on your account.</p>
                </div>

                <div className="bg-[#1A1A1A] border border-white/10 overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">Asset</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">Type</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">Entry</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">Exit</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">Profit</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">Time</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAuditLog.map((op) => (
                        <tr key={op.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-[11px] font-bold text-white">{op.asset}</td>
                          <td className="p-4">
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-1", op.type === 'LONG' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-400 bg-red-500/10')}>
                              {op.type}
                            </span>
                          </td>
                          <td className="p-4 text-[11px] text-slate-300 font-mono">${op.entry}</td>
                          <td className="p-4 text-[11px] text-slate-300 font-mono">{op.exit === '-' ? '—' : `$${op.exit}`}</td>
                          <td className="p-4 text-[11px] font-bold text-emerald-500">{op.profit}</td>
                          <td className="p-4 text-[10px] text-slate-500">{op.time}</td>
                          <td className="p-4">
                            <span className={cn("text-[9px] font-bold uppercase tracking-widest", op.status === 'open' ? 'text-[#D4AF37]' : 'text-slate-500')}>
                              {op.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* KYC View */}
            {activeView === 'kyc' && (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Verification</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">KYC Verification</h2>
                  <p className="text-slate-500 text-[12px] mt-2">Complete identity verification to unlock all platform features.</p>
                </div>

                {/* KYC Status Banner */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 flex items-center gap-4">
                  <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">Verification Approved</p>
                    <p className="text-[10px] text-slate-400 mt-1">Your identity has been verified. All features are unlocked.</p>
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest">Identity Document</h4>
                        <p className="text-[9px] text-emerald-500 uppercase tracking-widest">Approved</p>
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-white/10 p-8 text-center">
                      <Upload size={24} className="mx-auto text-slate-600 mb-3" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Passport or ID Card</p>
                      <p className="text-[9px] text-slate-600 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest">Proof of Address</h4>
                        <p className="text-[9px] text-emerald-500 uppercase tracking-widest">Approved</p>
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-white/10 p-8 text-center">
                      <Upload size={24} className="mx-auto text-slate-600 mb-3" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Utility Bill or Bank Statement</p>
                      <p className="text-[9px] text-slate-600 mt-1">Dated within last 3 months</p>
                    </div>
                  </div>
                </div>

                {/* Verification Steps */}
                <div className="bg-[#1A1A1A] border border-white/10 p-8">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">Verification Steps</h3>
                  <div className="space-y-4">
                    {[
                      { step: 'Email Verification', status: 'approved' },
                      { step: 'Identity Document Upload', status: 'approved' },
                      { step: 'Proof of Address', status: 'approved' },
                      { step: 'Account Activation', status: 'approved' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5">
                        {item.status === 'approved' && <CheckCircle2 size={16} className="text-emerald-500" />}
                        {item.status === 'pending' && <Clock size={16} className="text-yellow-500" />}
                        {item.status === 'rejected' && <XCircle size={16} className="text-red-500" />}
                        <span className="text-[11px] font-bold uppercase tracking-widest">{item.step}</span>
                        <span className={cn("ml-auto text-[9px] font-bold uppercase tracking-widest",
                          item.status === 'approved' ? 'text-emerald-500' : item.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                        )}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Security / 2FA View */}
            {activeView === 'security' && (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Protection</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Account Security</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Add an extra layer of security to your account. Use an authenticator app like Google Authenticator or Authy.
                    </p>

                    <div className="bg-white/[0.02] border border-white/5 p-6 text-center">
                      <div className="w-32 h-32 mx-auto bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <p className="text-[9px] text-slate-500 uppercase">QR Code</p>
                      </div>
                      <p className="text-[9px] text-slate-500">Scan with your authenticator app</p>
                    </div>

                    <Input placeholder="Enter 6-digit code" className="bg-white/5 border-white/10 rounded-none h-14 text-center text-[18px] font-mono tracking-[0.5em] text-white" />

                    <Button className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-12 font-black text-[10px] uppercase tracking-widest">
                      {t('dashboard.enable2FA')}
                    </Button>
                  </div>

                  {/* Email Verification */}
                  <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest">Email Verification</h4>
                        <p className="text-[9px] text-emerald-500 uppercase tracking-widest">Verified</p>
                      </div>
                    </div>

                    <p className="text-slate-500 text-[12px] leading-relaxed">
                      Your email address has been confirmed. You will receive notifications about account activity and withdrawals.
                    </p>

                    <div className="p-4 bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Verified Email</p>
                      <p className="text-[12px] text-white">{user?.email}</p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Log</h5>
                      {[
                        { event: 'Login from new device', time: '2 hours ago' },
                        { event: 'Password changed', time: '5 days ago' },
                        { event: 'Account created', time: '30 days ago' },
                      ].map((log, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] text-slate-300">{log.event}</span>
                          <span className="text-[9px] text-slate-500">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile View */}
            {activeView === 'profile' && (
              <div className="max-w-3xl space-y-12">
                <div className="space-y-8">
                  <div>
                    <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.settings')}</span>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{t('dashboard.profile')}</h2>
                  </div>

                  <form className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.firstName')}</label>
                        <Input value={profile?.first_name || ''} className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.lastName')}</label>
                        <Input value={profile?.last_name || ''} className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                      <Input value={user?.email || ''} disabled className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-slate-500" />
                    </div>

                    <Button className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]">
                      <Save size={16} className="mr-2" /> {t('dashboard.saveChanges')}
                    </Button>
                  </form>
                </div>
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
