"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const Register = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-sky-600/10 blur-[120px]" />
        
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-950 font-bold text-xl">
            B
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            BRAXEL <span className="text-sky-400">MARKETS</span>
          </span>
        </Link>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Comece sua jornada de investimento automatizado hoje.
          </h2>
          <ul className="space-y-4">
            {[
              "Acesso a algoritmos institucionais",
              "Gerenciamento de risco automatizado",
              "Dashboard de performance em tempo real",
              "Suporte especializado 24/7"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <ShieldCheck className="text-sky-400" size={20} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="relative z-10 text-slate-500 text-sm">
          © 2026 Braxel Markets. Todos os direitos reservados.
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="md:hidden flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              B
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              BRAXEL <span className="text-sky-600">MARKETS</span>
            </span>
          </Link>
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Criar Conta</h1>
            <p className="text-slate-500">Junte-se à Braxel Markets e comece a investir.</p>
          </div>
          
          <form className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input placeholder="Seu nome" className="pl-12 rounded-xl border-slate-200 py-6" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input type="email" placeholder="seu@email.com" className="pl-12 rounded-xl border-slate-200 py-6" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input type="password" placeholder="••••••••" className="pl-12 rounded-xl border-slate-200 py-6" />
              </div>
            </div>
            
            <div className="flex items-start gap-3 py-2">
              <Checkbox id="terms" className="mt-1 border-slate-300 data-[state=checked]:bg-sky-600" />
              <label htmlFor="terms" className="text-sm text-slate-500 leading-relaxed">
                Eu concordo com os <Link to="/terms" className="text-sky-600 font-bold hover:underline">Termos de Serviço</Link> e a <Link to="/privacy" className="text-sky-600 font-bold hover:underline">Política de Privacidade</Link>.
              </label>
            </div>
            
            <Button className="w-full bg-slate-900 hover:bg-sky-600 text-white rounded-xl py-7 font-bold text-lg transition-all">
              Criar Conta
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Já tem uma conta? <Link to="/login" className="text-sky-600 font-bold hover:underline">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;