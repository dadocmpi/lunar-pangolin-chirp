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
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { countriesData, getCountryByCode } from '@/data/kycData';

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('services');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // KYC state - NEW IMPROVED FLOW
  const [kycStatus, setKycStatus] = useState<'pending' | 'submitted' | 'approved' | 'rejected'>('pending');
  const [kycStep, setKycStep] = useState<'country' | 'method' | 'document' | 'review'>('country');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [kycDocument, setKycDocument] = useState<File | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Get current country data
  const countryData = selectedCountry ? getCountryByCode(selectedCountry) : null;
  const methodData = countryData?.methods.find(m => m.id === selectedMethod);

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
            const newKycStatus = (payload.new as any)?.kyc_status;
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

      // Check KYC status from profile metadata
      const kyc = (profileData as any)?.kyc_status;
      if (kyc === 'approved' || kyc === 'submitted' || kyc === 'rejected') {
        setKycStatus(kyc);
      } else {
        setKycStatus('pending');
      }
    } catch (error: any) {
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
      showSuccess(t('dashboard.profileUpdated'));
    } catch (err: any) {
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
      showSuccess(t('dashboard.confirmationLinkSent'));
    } catch (err: any) {
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
      showSuccess(t('dashboard.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      showError(t('dashboard.failedPassword'));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleKycSubmit = async () => {
    if (!kycDocument) {
      showError(t('dashboard.uploadDocument'));
      return;
    }
    if (!selectedCountry || !selectedMethod || !selectedDocument) {
      showError(t('dashboard.completeSteps'));
      return;
    }

    setSubmittingKyc(true);
    try {
      // Upload document to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${kycDocument.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, kycDocument);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // Continue anyway for demo - in production you might want to handle this differently
      }

      // Get public URL for the uploaded document
      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      // Save KYC data to profile
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          kyc_status: 'submitted',
          kyc_country: selectedCountry,
          kyc_method: selectedMethod,
          kyc_document_type: selectedDocument,
          kyc_document_url: urlData?.publicUrl || '',
          kyc_submitted_at: new Date().toISOString()
        } as any);

      if (error) throw error;

      setKycStatus('submitted');
      
      // Trigger email notification via edge function
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://ymzdxifedtjwkxkzfwqu.supabase.co'}/functions/v1/kyc-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            fullName: profile?.first_name + ' ' + profile?.last_name,
            email: user.email,
            country: selectedCountry,
            verificationMethod: selectedMethod,
            documentType: selectedDocument,
            documentUrl: urlData?.publicUrl || ''
          })
        });
      } catch (emailError) {
        console.error('Email notification error (non-blocking):', emailError);
      }

      showSuccess(t('dashboard.documentsSubmitted'));
    } catch (err: any) {
      showError(t('dashboard.failedDocuments'));
    } finally {
      setSubmittingKyc(false);
    }
  };

  // KYC step navigation
  const goToKycStep = (step: 'country' | 'method' | 'document' | 'review') => {
    setKycStep(step);
  };

  const canProceedToMethod = selectedCountry !== null;
  const canProceedToDocument = selectedMethod !== null;
  const canSubmit = kycDocument !== null && selectedDocument !== null;

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

  const mockSecurityLog = [
    { event: 'Login from new device', time: '2 hours ago' },
    { event: 'Password changed', time: '5 days ago' },
    { event: 'Account created', time: '30 days ago' },
  ];

  // KYC blocking overlay
  const isKycBlocking = kycStatus !== 'approved' && activeView !== 'settings';

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
        {/* KYC Required Banner */}
        {kycStatus !== 'approved' && (
          <div className={cn(
            "mb-8 p-6 flex items-center gap-4 border",
            kycStatus === 'submitted' ? "bg-yellow-500/10 border-yellow-500/20" : kycStatus === 'rejected' ? "bg-red-500/10 border-red-500/20" : "bg-[#D4AF37]/10 border-[#D4AF37]/20"
          )}>
            <AlertTriangle size={24} className={cn(
              "shrink-0",
              kycStatus === 'submitted' ? "text-yellow-500" : kycStatus === 'rejected' ? "text-red-500" : "text-[#D4AF37]"
            )} />
            <div className="flex-1">
              {kycStatus === 'pending' && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">{t('dashboard.kycRequired')}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{t('dashboard.kycRequiredDesc')}</p>
                </>
              )}
              {kycStatus === 'submitted' && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-500">{t('dashboard.kycUnderReview')}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{t('dashboard.kycUnderReviewDesc')}</p>
                </>
              )}
              {kycStatus === 'rejected' && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-red-500">{t('dashboard.kycRejected')}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{t('dashboard.kycRejectedDesc')}</p>
                </>
              )}
            </div>
            <Button
              onClick={() => { setActiveView('settings'); setSettingsTab('kyc'); }}
              className="bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-10 text-[9px] font-black uppercase tracking-widest shrink-0"
            >
              {kycStatus === 'rejected' ? t('dashboard.resubmitDocs') : t('dashboard.completeVerification')}
            </Button>
          </div>
        )}

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
                  <><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" /> <span className="text-yellow-500">KYC Under Review</span></>
                ) : (
                  <><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> <span className="text-red-500">KYC Required</span></>
                )}
              </div>
            </div>

            {[
              { id: 'services', label: t('nav.dashboard'), icon: <LayoutDashboard size={18} /> },
              { id: 'performance', label: 'Performance', icon: <BarChart3 size={18} /> },
              { id: 'withdraw', label: t('dashboard.withdraw'), icon: <Wallet size={18} /> },
              { id: 'auditlog', label: 'Audit Log', icon: <Activity size={18} /> },
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
            {/* KYC Blocking Overlay */}
            {isKycBlocking && (
              <div className="absolute inset-0 bg-[#121212]/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center p-12 max-w-md">
                  <Shield size={48} className="mx-auto text-[#D4AF37] mb-6" />
                  <h3 className="text-lg font-black uppercase tracking-tight mb-3">{t('dashboard.verificationRequired')}</h3>
                  <p className="text-slate-400 text-[12px] leading-relaxed mb-6">
                    Complete your KYC verification to access all platform features. This is a mandatory compliance requirement for all accounts.
                  </p>
                  <Button
                    onClick={() => { setActiveView('settings'); setSettingsTab('kyc'); }}
                    className="bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-12 text-[10px] font-black uppercase tracking-widest"
                  >
                    Go to Verification
                  </Button>
                </div>
              </div>
            )}

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
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.totalProfit')}</p>
                    <p className="text-xl md:text-2xl font-serif font-bold text-emerald-500">+12.4%</p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.drawdown')}</p>
                    <p className="text-xl md:text-2xl font-serif font-bold text-yellow-500">-2.1%</p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.activeAlgos')}</p>
                    <p className="text-xl md:text-2xl font-serif font-bold text-white">{services.length}</p>
                  </div>
                </div>

                <PerformanceChart />

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
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.analytics')}</span>
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
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{t('dashboard.totalProfit')}</p>
                    </div>
                    <p className="text-xl font-serif font-bold text-emerald-500">+$3,240.00</p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown size={12} className="text-yellow-500" />
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{t('dashboard.maxDrawdown')}</p>
                    </div>
                    <p className="text-xl font-serif font-bold text-yellow-500">-4.2%</p>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 p-6">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('dashboard.assetsInOperation')}</p>
                    <p className="text-xl font-serif font-bold text-white">BTC, ETH, SOL</p>
                  </div>
                </div>

                <PerformanceChart />

                <div className="bg-[#1A1A1A] border border-white/10 p-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-6">{t('dashboard.monthlyReturns')}</h3>
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
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.network')}</label>
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
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">{t('dashboard.transactionHistory')}</h3>
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
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.operations')}</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Audit Log</h2>
                  <p className="text-slate-500 text-[12px] mt-2">All algorithmic orders executed on your account.</p>
                </div>

                <div className="bg-[#1A1A1A] border border-white/10 overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.asset')}</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.type')}</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.entry')}</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.exit')}</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">Profit</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.time')}</th>
                        <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">{t('dashboard.status')}</th>
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

            {/* Settings View (Profile + KYC + Security) */}
            {activeView === 'settings' && (
              <div className="space-y-8">
                <div>
                  <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.settings')}</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Account Settings</h2>
                </div>

                {/* Settings Tabs */}
                <div className="flex border-b border-white/10">
                  {[
                    { id: 'profile', label: 'Profile', icon: <User size={14} /> },
                    { id: 'kyc', label: 'KYC Verification', icon: <FileText size={14} /> },
                    { id: 'security', label: 'Security', icon: <Shield size={14} /> },
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
                        <User size={16} className="text-[#D4AF37]" /> Personal Information
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
                        {savingProfile ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                        {t('dashboard.saveChanges')}
                      </Button>
                    </div>

                    {/* Email Change */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-8 space-y-6">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white flex items-center gap-3">
                        <Mail size={16} className="text-[#D4AF37]" /> Email Address
                      </h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Changing your email requires verification. A confirmation link will be sent to the new email address.
                      </p>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Email</label>
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
                            <Mail size={16} className="mr-2" /> {t('dashboard.sendConfirmationLink')}
                          </Button>
                        </>
                      ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">Confirmation Sent</p>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            A confirmation link has been sent to <span className="text-white font-bold">{editEmail}</span>. 
                            Please check your inbox and click the link to complete the email change.
                          </p>
                          <button
                            onClick={() => setEmailChangeRequested(false)}
                            className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest mt-4 hover:underline"
                          >
                            Try a different email
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* KYC Tab - NEW IMPROVED FLOW */}
                {settingsTab === 'kyc' && (
                  <div className="space-y-8">
                    {/* KYC Status Banner */}
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
                          {kycStatus === 'approved' ? 'Verification Approved' :
                           kycStatus === 'submitted' ? 'Documents Under Review' :
                           kycStatus === 'rejected' ? 'Verification Rejected' :
                           'Verification Required'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {kycStatus === 'approved' ? 'Your identity has been verified. All features are unlocked.' :
                           kycStatus === 'submitted' ? 'Our compliance team is reviewing your documents. This usually takes 24-48 hours.' :
                           kycStatus === 'rejected' ? 'Your documents were not accepted. Please resubmit with valid documentation.' :
                           'Complete identity verification to unlock all platform features.'}
                        </p>
                      </div>
                    </div>

                    {/* Verification Flow - Only show when not approved/submitted */}
                    {kycStatus !== 'approved' && kycStatus !== 'submitted' && (
                      <div className="bg-[#1A1A1A] border border-white/10 p-8">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-between mb-8">
                          {[
                            { id: 'country', label: 'Country', icon: Globe },
                            { id: 'method', label: 'Method', icon: CreditCard },
                            { id: 'document', label: 'Document', icon: FileText },
                            { id: 'review', label: 'Review', icon: CheckCircle2 },
                          ].map((step, i) => (
                            <React.Fragment key={step.id}>
                              <div className="flex flex-col items-center">
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                  kycStep === step.id ? "border-[#D4AF37] bg-[#D4AF37]/10" :
                                  (kycStep === 'method' && step.id === 'country') || 
                                  (kycStep === 'document' && (step.id === 'country' || step.id === 'method')) ||
                                  (kycStep === 'review' && (step.id === 'country' || step.id === 'method' || step.id === 'document'))
                                    ? "border-emerald-500 bg-emerald-500/10"
                                    : "border-white/10 bg-white/5"
                                )}>
                                  <step.icon size={16} className={cn(
                                    kycStep === step.id ? "text-[#D4AF37]" :
                                    (kycStep === 'method' && step.id === 'country') || 
                                    (kycStep === 'document' && (step.id === 'country' || step.id === 'method')) ||
                                    (kycStep === 'review' && (step.id === 'country' || step.id === 'method' || step.id === 'document'))
                                      ? "text-emerald-500" : "text-slate-500"
                                  )} />
                                </div>
                                <span className={cn("text-[9px] mt-2 font-bold uppercase tracking-wider",
                                  kycStep === step.id ? "text-[#D4AF37]" : "text-slate-500"
                                )}>{step.label}</span>
                              </div>
                              {i < 3 && (
                                <div className={cn(
                                  "flex-1 h-0.5 mx-2",
                                  (kycStep === 'method' && step.id === 'country') || 
                                  (kycStep === 'document' && step.id === 'method') ||
                                  (kycStep === 'review' && step.id === 'document')
                                    ? "bg-emerald-500" : "bg-white/10"
                                )} />
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Step 1: Select Country */}
                        {kycStep === 'country' && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-[14px] font-bold uppercase tracking-widest mb-2">Select Your Country</h3>
                              <p className="text-[11px] text-slate-400">Choose the country that issued your identity document.</p>
                            </div>
                            <div className="relative">
                              <button
                                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors"
                              >
                                <span className="text-[12px] font-medium">
                                  {selectedCountry ? `${getCountryByCode(selectedCountry)?.flag} ${getCountryByCode(selectedCountry)?.name}` : 'Select a country...'}
                                </span>
                                <ChevronDown size={16} className={cn("text-slate-400 transition-transform", countryDropdownOpen && "rotate-180")} />
                              </button>
                              {countryDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-white/10 max-h-64 overflow-y-auto">
                                  {countriesData.map((country) => (
                                    <button
                                      key={country.code}
                                      onClick={() => {
                                        setSelectedCountry(country.code);
                                        setSelectedMethod(null);
                                        setSelectedDocument(null);
                                        setCountryDropdownOpen(false);
                                      }}
                                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-left transition-colors"
                                    >
                                      <span className="text-lg">{country.flag}</span>
                                      <span className="text-[11px] font-medium text-white">{country.name}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={() => goToKycStep('method')}
                              disabled={!canProceedToMethod}
                              className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-12 font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                            >
                              Continue to Method Selection
                            </Button>
                          </div>
                        )}

                        {/* Step 2: Select Verification Method */}
                        {kycStep === 'method' && countryData && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <button onClick={() => goToKycStep('country')} className="text-slate-400 hover:text-white">
                                <ChevronLeft size={20} />
                              </button>
                              <div>
                                <h3 className="text-[14px] font-bold uppercase tracking-widest mb-2">Select Verification Method</h3>
                                <p className="text-[11px] text-slate-400">Choose how you want to verify your identity for {countryData.name}.</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {countryData.methods.map((method) => (
                                <button
                                  key={method.id}
                                  onClick={() => {
                                    setSelectedMethod(method.id);
                                    setSelectedDocument(null);
                                    goToKycStep('document');
                                  }}
                                  className={cn(
                                    "w-full p-4 border text-left transition-all",
                                    selectedMethod === method.id
                                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                                      : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                                  )}
                                >
                                  <span className="text-[12px] font-bold uppercase tracking-widest">{method.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Step 3: Select Document and Upload */}
                        {kycStep === 'document' && methodData && (
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <button onClick={() => goToKycStep('method')} className="text-slate-400 hover:text-white">
                                <ChevronLeft size={20} />
                              </button>
                              <div>
                                <h3 className="text-[14px] font-bold uppercase tracking-widest mb-2">Upload Your Document</h3>
                                <p className="text-[11px] text-slate-400">Select and upload one valid document from the options below.</p>
                              </div>
                            </div>
                            
                            {/* Document Type Selection */}
                            <div className="space-y-3">
                              {methodData.documents.map((doc) => (
                                <button
                                  key={doc.id}
                                  onClick={() => setSelectedDocument(doc.id)}
                                  className={cn(
                                    "w-full p-4 border text-left transition-all",
                                    selectedDocument === doc.id
                                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                                      : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                                  )}
                                >
                                  <span className="text-[12px] font-bold uppercase tracking-widest block">{doc.name}</span>
                                  <span className="text-[10px] text-slate-500 mt-1 block">{doc.description}</span>
                                </button>
                              ))}
                            </div>

                            {/* File Upload */}
                            {selectedDocument && (
                              <div className="mt-6">
                                <label className={cn(
                                  "block border-2 border-dashed p-8 text-center cursor-pointer transition-all",
                                  kycDocument ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 hover:border-[#D4AF37]/30"
                                )}>
                                  <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    className="hidden"
                                    onChange={(e) => setKycDocument(e.target.files?.[0] || null)}
                                  />
                                  {kycDocument ? (
                                    <div className="space-y-2">
                                      <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
                                      <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">{kycDocument.name}</p>
                                      <p className="text-[9px] text-slate-500">{(kycDocument.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <Upload size={32} className="mx-auto text-slate-600" />
                                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Click to upload or drag and drop</p>
                                      <p className="text-[9px] text-slate-600">PNG, JPG, PDF up to 10MB</p>
                                    </div>
                                  )}
                                </label>
                              </div>
                            )}

                            <Button
                              onClick={handleKycSubmit}
                              disabled={!canSubmit || submittingKyc}
                              className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] disabled:opacity-50"
                            >
                              {submittingKyc ? <Loader2 className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                              {submittingKyc ? 'Submitting...' : 'Submit for Verification'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification Steps - Simplified */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-8">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">Verification Progress</h3>
                      <div className="space-y-4">
                        {[
                          { step: 'Email Verification', status: user?.email_confirmed_at ? 'approved' : 'pending' },
                          { step: 'Identity Document', status: kycStatus === 'approved' ? 'approved' : kycStatus === 'submitted' ? 'submitted' : selectedCountry ? 'submitted' : 'pending' },
                          { step: 'Compliance Review', status: kycStatus === 'approved' ? 'approved' : kycStatus === 'submitted' ? 'submitted' : 'pending' },
                          { step: 'Account Activation', status: kycStatus === 'approved' ? 'approved' : 'pending' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5">
                            {item.status === 'approved' && <CheckCircle2 size={16} className="text-emerald-500" />}
                            {item.status === 'submitted' && <Clock size={16} className="text-yellow-500" />}
                            {item.status === 'pending' && <Clock size={16} className="text-slate-500" />}
                            {item.status === 'rejected' && <XCircle size={16} className="text-red-500" />}
                            <span className="text-[11px] font-bold uppercase tracking-widest">{item.step}</span>
                            <span className={cn("ml-auto text-[9px] font-bold uppercase tracking-widest",
                              item.status === 'approved' ? 'text-emerald-500' :
                              item.status === 'submitted' ? 'text-yellow-500' :
                              item.status === 'rejected' ? 'text-red-500' : 'text-slate-500'
                            )}>
                              {item.status === 'submitted' ? 'In Progress' : item.status === 'approved' ? 'Complete' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
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
                          Add an extra layer of security to your account. Use an authenticator app like Google Authenticator or Authy.
                        </p>

                        <div className="bg-white/[0.02] border border-white/5 p-6 text-center">
                          <div className="w-32 h-32 mx-auto bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                            <p className="text-[9px] text-slate-500 uppercase">QR Code</p>
                          </div>
                          <p className="text-[9px] text-slate-500">Scan with your authenticator app</p>
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
                            <h4 className="text-[11px] font-bold uppercase tracking-widest">Change Password</h4>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Update your credentials</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder={t('dashboard.minPasswordPlaceholder')}
                              className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm New Password</label>
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
                          {changingPassword ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Lock size={16} className="mr-2" />}
                          Update Password
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
                          <h4 className="text-[11px] font-bold uppercase tracking-widest">Email Verification</h4>
                          <p className="text-[9px] text-emerald-500 uppercase tracking-widest">Verified</p>
                        </div>
                      </div>

                      <div className="p-4 bg-white/[0.02] border border-white/5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Verified Email</p>
                        <p className="text-[12px] text-white">{user?.email}</p>
                      </div>
                    </div>

                    {/* Security Log */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-8">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-6">Security Activity Log</h3>
                      <div className="space-y-3">
                        {mockSecurityLog.map((log, i) => (
                          <div key={i} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5">
                            <span className="text-[10px] text-slate-300">{log.event}</span>
                            <span className="text-[9px] text-slate-500">{log.time}</span>
                          </div>
                        ))}
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
