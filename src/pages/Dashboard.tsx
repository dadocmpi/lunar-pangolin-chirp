"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  LayoutDashboard, 
  Wallet, 
  User, 
  ShieldCheck, 
  Loader2, 
  LogOut,
  ArrowUpRight,
  History,
  Save,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('services');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Withdrawal Form State
  const [withdrawalData, setWithdrawalData] = useState({
    accountId: '',
    amount: '',
    iban: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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
        .eq('user_id', user.id);
      
      setServices(servicesData || []);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData || { first_name: user.user_metadata?.full_name || '', last_name: '' });

    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      showSuccess("Profile updated successfully.");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedService = services.find(s => s.account_id === withdrawalData.accountId);
    if (!selectedService) {
      showError("Please select a valid account.");
      return;
    }

    if (parseFloat(withdrawalData.amount) > parseFloat(selectedService.balance)) {
      showError("Insufficient balance.");
      return;
    }

    setActionLoading(true);
    try {
      // Call the secure edge function
      const { data, error } = await supabase.functions.invoke('withdrawal-notification', {
        body: {
          accountId: withdrawalData.accountId,
          amount: withdrawalData.amount,
          iban: withdrawalData.iban,
          name: `${profile.first_name} ${profile.last_name}`,
          email: user.email
        }
      });

      if (error) throw error;

      showSuccess("Withdrawal request submitted for review.");
      setWithdrawalData({ accountId: '', amount: '', iban: '' });
    } catch (error: any) {
      showError(error.message || "Failed to process withdrawal.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />
      
      <div className="container mx-auto px-8 pt-[140px] pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-2">
            <div className="p-6 bg-[#080B12] border border-white/10 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#C5A059] rounded-full flex items-center justify-center text-black font-bold">
                  {profile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold uppercase tracking-widest truncate">{profile?.first_name || 'Investor'}</p>
                  <p className="text-[9px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-green-500 uppercase tracking-widest">
                <ShieldCheck size={12} /> Verified Account
              </div>
            </div>

            {[
              { id: 'services', label: 'My Services', icon: <LayoutDashboard size={18} /> },
              { id: 'withdraw', label: 'Withdrawal', icon: <Wallet size={18} /> },
              { id: 'profile', label: 'Profile Settings', icon: <User size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all border-l-2",
                  activeView === item.id 
                    ? "bg-white/5 border-[#C5A059] text-white" 
                    : "border-transparent text-slate-500 hover:text-white hover:bg-white/[0.02]"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-[2px] text-red-500 hover:bg-red-500/5 transition-all border-l-2 border-transparent mt-8"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeView === 'services' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Portfolio</span>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Active <span className="text-[#C5A059]">Services</span></h2>
                  </div>
                  <Button onClick={() => navigate('/pricing')} className="bg-white text-black hover:bg-slate-200 rounded-none h-12 text-[10px] font-black uppercase tracking-widest">
                    New Allocation <ArrowUpRight size={16} className="ml-2" />
                  </Button>
                </div>

                {services.length === 0 ? (
                  <div className="p-20 border border-dashed border-white/10 bg-white/[0.01] text-center">
                    <AlertCircle className="mx-auto text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">No active investment plans found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="bg-[#080B12] border border-white/10 p-8 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <ShieldCheck size={80} />
                        </div>
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h3 className="text-xl font-bold uppercase tracking-tight mb-1">{service.plan_name}</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">ID: {service.account_id}</p>
                          </div>
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[9px] font-bold uppercase tracking-widest border border-green-500/20">
                            {service.status}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Current Balance</p>
                          <p className="text-3xl font-serif font-bold text-[#C5A059]">${parseFloat(service.balance).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeView === 'withdraw' && (
              <div className="max-w-2xl space-y-8">
                <div>
                  <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Liquidity</span>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Request <span className="text-[#C5A059]">Withdrawal</span></h2>
                </div>

                <form onSubmit={handleWithdrawal} className="bg-[#080B12] border border-white/10 p-10 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Account</label>
                    <select 
                      required
                      value={withdrawalData.accountId}
                      onChange={(e) => setWithdrawalData({...withdrawalData, accountId: e.target.value})}
                      className="w-full bg-white/5 border-white/10 rounded-none h-14 px-4 text-[12px] font-bold uppercase tracking-widest text-white focus:border-[#C5A059] outline-none appearance-none"
                    >
                      <option value="" className="bg-black">Choose an account</option>
                      {services.map(s => (
                        <option key={s.id} value={s.account_id} className="bg-black">
                          {s.plan_name} - ${parseFloat(s.balance).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount (USD)</label>
                    <Input 
                      required
                      type="number"
                      value={withdrawalData.amount}
                      onChange={(e) => setWithdrawalData({...withdrawalData, amount: e.target.value})}
                      placeholder="0.00"
                      className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white focus:border-[#C5A059]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IBAN / Bank Details</label>
                    <Input 
                      required
                      value={withdrawalData.iban}
                      onChange={(e) => setWithdrawalData({...withdrawalData, iban: e.target.value})}
                      placeholder="Enter your IBAN for transfer"
                      className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white focus:border-[#C5A059]"
                    />
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 flex gap-4">
                    <History className="text-[#C5A059] shrink-0" size={20} />
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      Withdrawal requests are processed within 48 business hours. A 2% institutional processing fee may apply.
                    </p>
                  </div>

                  <Button 
                    disabled={actionLoading || services.length === 0}
                    className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : "SUBMIT WITHDRAWAL REQUEST"}
                  </Button>
                </form>
              </div>
            )}

            {activeView === 'profile' && (
              <div className="max-w-2xl space-y-8">
                <div>
                  <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Settings</span>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Profile <span className="text-[#C5A059]">Management</span></h2>
                </div>

                <form onSubmit={handleUpdateProfile} className="bg-[#080B12] border border-white/10 p-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                      <Input 
                        value={profile?.first_name || ''}
                        onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white focus:border-[#C5A059]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                      <Input 
                        value={profile?.last_name || ''}
                        onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                        className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <Input 
                      disabled
                      value={user?.email || ''}
                      className="bg-white/[0.02] border-white/5 rounded-none h-14 text-[14px] font-medium text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <Button 
                    disabled={actionLoading}
                    className="w-full bg-white text-black hover:bg-slate-200 rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> SAVE CHANGES</>}
                  </Button>
                </form>
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