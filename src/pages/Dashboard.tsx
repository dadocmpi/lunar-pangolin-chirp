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
  AlertCircle
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
  const [actionLoading, setActionLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const [withdrawalData, setWithdrawalData] = useState({ accountId: '', amount: '', iban: '' });

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

      const { data: servicesData } = await supabase.from('services').select('*').eq('user_id', user.id);
      setServices(servicesData || []);

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
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

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />
      
      <div className="container mx-auto px-8 pt-[140px] pb-20">
        <div className="flex flex-col lg:flex-row gap-12">
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
            </div>

            {[
              { id: 'services', label: t('nav.dashboard'), icon: <LayoutDashboard size={18} /> },
              { id: 'withdraw', label: t('dashboard.withdraw'), icon: <Wallet size={18} /> },
              { id: 'profile', label: t('dashboard.settings'), icon: <User size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-[2px] transition-all border-l-2",
                  activeView === item.id ? "bg-white/5 border-[#C5A059] text-white" : "border-transparent text-slate-500 hover:text-white"
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

          <main className="flex-1">
            {activeView === 'services' && (
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.portfolio')}</span>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">{t('dashboard.activeServices')}</h2>
                  </div>
                  <Button onClick={() => navigate('/pricing')} className="bg-white text-black hover:bg-slate-200 rounded-none h-12 text-[10px] font-black uppercase tracking-widest">
                    {t('dashboard.newAllocation')} <ArrowUpRight size={16} className="ml-2" />
                  </Button>
                </div>

                {services.length === 0 ? (
                  <div className="p-20 border border-dashed border-white/10 bg-white/[0.01] text-center">
                    <AlertCircle className="mx-auto text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">{t('dashboard.noServices')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div key={service.id} className="bg-[#080B12] border border-white/10 p-8 relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h3 className="text-xl font-bold uppercase tracking-tight mb-1">{service.plan_name}</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">ID: {service.account_id}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('dashboard.balance')}</p>
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
                  <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.liquidity')}</span>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{t('dashboard.requestWithdraw')}</h2>
                </div>

                <form className="bg-[#080B12] border border-white/10 p-10 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.selectAccount')}</label>
                    <select className="w-full bg-white/5 border-white/10 rounded-none h-14 px-4 text-[12px] font-bold uppercase tracking-widest text-white outline-none appearance-none">
                      <option value="" className="bg-black">Choose an account</option>
                      {services.map(s => (
                        <option key={s.id} value={s.account_id} className="bg-black">{s.plan_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.amount')}</label>
                    <Input placeholder="0.00" className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.iban')}</label>
                    <Input placeholder="Enter your IBAN" className="bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white" />
                  </div>

                  <Button className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]">
                    {t('dashboard.btnWithdraw')}
                  </Button>
                </form>
              </div>
            )}

            {activeView === 'profile' && (
              <div className="max-w-2xl space-y-8">
                <div>
                  <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('dashboard.settings')}</span>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">{t('dashboard.profile')}</h2>
                </div>

                <form className="bg-[#080B12] border border-white/10 p-10 space-y-6">
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

                  <Button className="w-full bg-white text-black hover:bg-slate-200 rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]">
                    <Save size={16} className="mr-2" /> {t('dashboard.saveChanges')}
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