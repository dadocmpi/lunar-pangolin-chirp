"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      showError("Erro: Supabase não configurado. Clique no botão 'Add Supabase' acima.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showSuccess("Login realizado com sucesso!");
      navigate('/dashboard');
    } catch (error: any) {
      showError(error.message || "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#05070A]">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-black p-12 flex-col justify-between relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5A059]/10 to-transparent opacity-50" />
        
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white flex items-center justify-center text-black font-serif text-xl border border-[#C5A059]/50">
            B
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-white">
              BRAXEL
            </span>
            <span className="text-[#C5A059] text-[8px] font-bold tracking-[0.2em]">MARKETS</span>
          </div>
        </Link>
        
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white mb-8 leading-tight uppercase tracking-tighter">
            Bem-vindo de <br /><span className="text-[#C5A059]">Volta</span>
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
            Acesse sua infraestrutura de investimento e monitore sua performance em tempo real.
          </p>
        </div>
        
        <div className="relative z-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Braxel Markets. Secure Access.
        </div>
      </div>
      
      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-white flex items-center justify-center text-black font-bold text-lg">
              B
            </div>
            <span className="text-lg font-black tracking-tighter text-white">
              BRAXEL <span className="text-[#C5A059]">MARKETS</span>
            </span>
          </Link>
          
          <div className="mb-10">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Segurança</span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Entrar</h1>
            <p className="text-slate-500 text-xs mt-2">Insira suas credenciais de acesso.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059] transition-colors" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Senha</label>
                <a href="#" className="text-[9px] text-[#C5A059] hover:underline font-bold uppercase tracking-widest">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[14px] font-medium text-white placeholder:text-slate-700 focus:border-[#C5A059] transition-colors" 
                />
              </div>
            </div>
            
            <Button 
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : "ACESSAR CONTA"}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Não possui conta? <Link to="/register" className="text-[#C5A059] hover:underline">Criar conta</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;