"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  LayoutDashboard, 
  Wallet, 
  User, 
  ExternalLink, 
  ShieldCheck, 
  Loader2, 
  LogOut,
  ArrowUpRight,
  History,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

type View = 'services' | 'withdraw' | 'profile';

const Dashboard = () => {
  const [activeView, setActiveView] = useState<View>('services');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

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

      // Fetch Services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id);
      
      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !pixKey) {
      showError("Preencha todos os campos de saque.");
      return;
    }
    showSuccess(`Solicitação de saque de R$ ${withdrawAmount} enviada para análise.`);
    setWithdrawAmount('');
    setPixKey('');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
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
      showSuccess("Perfil atualizado com sucesso!");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setUpdatingProfile(false);
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
    <div className="min-h-screen bg-[#05070A] text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-8 pt-32 pb-20">
        <div className="flex flex-col lg:row gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-2">
            <div className="p-6 bg-[#080B12] border border-white/10 mb-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Investidor</p>
              <p className="text-sm font-bold truncate">{profile?.first_name || user?.email}</p>
            </div>
            
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveView('services')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeView === 'services' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/5 text-slate-400'}`}
              >
                <LayoutDashboard size={16} /> Meus Serviços
              </button>
              <button 
                onClick={() => setActiveView('withdraw')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeView === 'withdraw' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/5 text-slate-400'}`}
              >
                <Wallet size={16} /> Saque
              </button>
              <button 
                onClick={() => setActiveView('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeView === 'profile' ? 'bg-[#C5A059] text-black' : 'hover:bg-white/5 text-slate-400'}`}
              >
                <User size={16} /> Perfil
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                <LogOut size={16} /> Sair
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            {activeView === 'services' && (
              <>
                <header>
                  <h1 className="text-3xl font-black uppercase tracking-tighter">Meus <span className="text-[#C5A059]">Investimentos</span></h1>
                  <p className="text-slate-500 text-xs mt-2">Gerencie suas contas e acompanhe seus IDs de operação.</p>
                </header>

                <div className="grid grid-cols-1 gap-4">
                  {services.length > 0 ? (
                    services.map((service) => (
                      <div key={service.id} className="bg-[#080B12] border border-white/10 p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-[#C5A059]/30 transition-colors">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-[#C5A059]">
                            <ShieldCheck size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">{service.plan_name}</h3>
                              <span className={`text-[8px] px-2 py-0.5 font-bold uppercase tracking-widest ${service.status === 'Ativo' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                {service.status}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 mt-1">
                              ID DA CONTA: <span className="text-white font-bold">{service.account_id}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-12">
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Saldo Atual</p>
                            <p className="text-xl font-black text-[#C5A059]">{service.balance}</p>
                          </div>
                          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest h-10 rounded-none">
                            Detalhes <ExternalLink size={12} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 bg-[#080B12] border border-white/10 text-center">
                      <p className="text-slate-500 text-sm mb-2 uppercase tracking-widest font-bold">Nenhum plano ativo</p>
                      <p className="text-slate-600 text-xs">Você ainda não possui investimentos em sua conta.</p>
                    </div>
                  )}
                </div>

                <div className="p-8 border border-dashed border-white/10 text-center bg-white/[0.02]">
                  <p className="text-slate-500 text-xs mb-4 uppercase tracking-widest font-bold">Deseja expandir seu capital?</p>
                  <Button 
                    onClick={() => navigate('/pricing')}
                    className="bg-white text-black hover:bg-slate-200 text-[10px] font-bold uppercase tracking-widest h-12 px-8 rounded-none transition-all"
                  >
                    Adquirir Novo Plano
                  </Button>
                </div>
              </>
            )}

            {activeView === 'withdraw' && (
              <>
                <header>
                  <h1 className="text-3xl font-black uppercase tracking-tighter">Solicitar <span className="text-[#C5A059]">Saque</span></h1>
                  <p className="text-slate-500 text-xs mt-2">Retire seus lucros de forma rápida e segura.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#080B12] border border-white/10 p-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6">Nova Solicitação</h3>
                    <form onSubmit={handleWithdraw} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Valor do Saque (EUR)</label>
                        <Input 
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00"
                          className="bg-white/5 border-white/10 rounded-none h-12 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Chave PIX ou Carteira</label>
                        <Input 
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          placeholder="Sua chave para recebimento"
                          className="bg-white/5 border-white/10 rounded-none h-12 text-sm font-bold"
                        />
                      </div>
                      <Button className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-black font-black text-[10px] uppercase tracking-widest h-12 rounded-none">
                        Confirmar Saque <ArrowUpRight size={16} className="ml-2" />
                      </Button>
                    </form>
                  </div>

                  <div className="bg-[#080B12] border border-white/10 p-8">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                      <History size={14} /> Histórico Recente
                    </h3>
                    <div className="space-y-4">
                      <p className="text-slate-600 text-[10px] uppercase tracking-widest text-center py-10">Nenhum saque realizado ainda.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeView === 'profile' && (
              <>
                <header>
                  <h1 className="text-3xl font-black uppercase tracking-tighter">Meu <span className="text-[#C5A059]">Perfil</span></h1>
                  <p className="text-slate-500 text-xs mt-2">Gerencie suas informações pessoais e segurança.</p>
                </header>

                <div className="bg-[#080B12] border border-white/10 p-8 max-w-2xl">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Primeiro Nome</label>
                        <Input 
                          value={profile?.first_name || ''}
                          onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                          className="bg-white/5 border-white/10 rounded-none h-12 text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sobrenome</label>
                        <Input 
                          value={profile?.last_name || ''}
                          onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                          className="bg-white/5 border-white/10 rounded-none h-12 text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">E-mail (Não alterável)</label>
                      <Input 
                        disabled
                        value={user?.email || ''}
                        className="bg-white/5 border-white/10 rounded-none h-12 text-sm font-bold opacity-50"
                      />
                    </div>
                    <Button 
                      disabled={updatingProfile}
                      className="bg-[#C5A059] hover:bg-[#B08D48] text-black font-black text-[10px] uppercase tracking-widest h-12 px-8 rounded-none"
                    >
                      {updatingProfile ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> Salvar Alterações</>}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;