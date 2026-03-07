"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login = () => {
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
            Bem-vindo de volta à sua plataforma de investimento.
          </h2>
          <p className="text-slate-400 text-lg max-w-md">
            Acesse seu dashboard para monitorar suas operações e gerenciar seu capital com segurança.
          </p>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Entrar</h1>
            <p className="text-slate-500">Insira suas credenciais para acessar sua conta.</p>
          </div>
          
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input type="email" placeholder="seu@email.com" className="pl-12 rounded-xl border-slate-200 py-6" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700">Senha</label>
                <a href="#" className="text-xs text-sky-600 hover:underline font-medium">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input type="password" placeholder="••••••••" className="pl-12 rounded-xl border-slate-200 py-6" />
              </div>
            </div>
            
            <Button className="w-full bg-slate-900 hover:bg-sky-600 text-white rounded-xl py-7 font-bold text-lg transition-all">
              Entrar
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Não tem uma conta? <Link to="/register" className="text-sky-600 font-bold hover:underline">Criar conta</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;