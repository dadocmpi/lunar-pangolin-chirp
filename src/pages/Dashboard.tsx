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

const Dashboard = () => {
  const [activeView, setActiveView] = useState('services');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // ... (restante da lógica de saque e perfil)

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      {/* Estrutura do Dashboard */}
      <div className="container mx-auto px-8 pt-[140px] pb-20">
        {/* ... (Sidebar e Conteúdo Principal) */}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;