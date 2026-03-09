"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      showError("Erro: Supabase não configurado. Clique no botão 'Add Supabase' acima para configurar.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      showSuccess("Conta criada com sucesso! Verifique seu e-mail para confirmar.");
      navigate('/login');
    } catch (error: any) {
      showError(error.message || "Erro ao criar conta.");
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
            O Futuro do <br /><span className="text-[#C5A059]">Investimento</span>
          </h2>
          <ul className="space-y-6">
            {[
              "Algoritmos de nível institucional",
              "Proteção de capital avançada",
              "Execução em milissegundos",
              "Transparência total de operações"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                <ShieldCheck className="text-[#C5A059]" size={20} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="relative z-10 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          © 2026 Braxel Markets. Institutional Infrastructure.
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
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Acesso</span>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Criar Conta</h1>
            <p className="text-slate-500 text-xs mt-2">Inicie sua jornada no mercado institucional.</p>
          </div>
          
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="SEU NOME" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[11px] font-bold tracking-widest text-white placeholder:text-slate-700 focus:border-[#C5A059] transition-colors" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL@EXEMPLO.COM" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[11px] font-bold tracking-widest text-white placeholder:text-slate-700 focus:border-[#C5A059] transition-colors" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <Input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-12 bg-white/5 border-white/10 rounded-none h-14 text-[11px] font-bold tracking-widest text-white placeholder:text-slate-700 focus:border-[#C5A059] transition-colors" 
                />
              </div>
            </div>
            
            <div className="flex items-start gap-3 py-2">
              <Checkbox id="terms" required className="mt-1 border-white/20 data-[state=checked]:bg-[#C5A059] data-[state=checked]:border-[#C5A059]" />
              <label htmlFor="terms" className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Eu concordo com os <Link to="/terms" className="text-[#C5A059] hover:underline">Termos</Link> e a <Link to="/privacy" className="text-[#C5A059] hover:underline">Privacidade</Link>.
              </label>
            </div>
            
            <Button 
              disabled={loading}
              className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em] transition-all border-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : "CRIAR MINHA CONTA"}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Já possui acesso? <Link to="/login" className="text-[#C5A059] hover:underline">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;