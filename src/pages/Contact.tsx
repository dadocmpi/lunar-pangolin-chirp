"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Send, Clock, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';
import { showSuccess, showError } from '@/utils/toast';
import { Link } from 'react-router-dom';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const Contact = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [captcha, setCaptcha] = useState({ q: '', a: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '' // Honeypot field
  });

  // Generate a simple math challenge on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ q: `${num1} + ${num2}`, a: num1 + num2 });
    setUserAnswer('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Honeypot check
    if (formData.website) {
      console.warn("Spam detected via honeypot.");
      return;
    }

    // 2. Captcha check
    if (parseInt(userAnswer) !== captcha.a) {
      showError(t('contact.incorrectAnswer'));
      generateCaptcha();
      return;
    }

    // 3. Rate limiting check
    if (cooldown) {
      showError(t('contact.waitMessage'));
      return;
    }

    setLoading(true);
    
    try {
      // Call the Supabase Edge Function to send email via Resend
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          to: 'marketsbraxel@ouvidor.net',
          subject: `[Contact Form] ${formData.subject} - from ${formData.name}`,
          html: `
            <h2>${t('contactEmail.newSubmission')}</h2>
            <p><strong>${t('contactEmail.name')}:</strong> ${formData.name}</p>
            <p><strong>${t('contactEmail.email')}:</strong> ${formData.email}</p>
            <p><strong>${t('contactEmail.subject')}:</strong> ${formData.subject}</p>
            <p><strong>${t('contactEmail.message')}:</strong></p>
            <p>${formData.message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>${t('contactEmail.sentFrom')} braxelmarkets.vercel.app</small></p>
          `,
          replyTo: formData.email
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      showSuccess(t('contact.messageSent'));
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
      generateCaptcha();

      setCooldown(true);
      setTimeout(() => setCooldown(false), 60000);
    } catch (error) {
      console.error('Email error:', error);
      showError(t('contact.messageFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      <Navbar />
      <MarketTicker />
      
      <section className="relative pt-[160px] pb-20 border-b border-white/5 bg-[linear-gradient(135deg,#000000_0%,#0a0e27_100%)]">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl animate-fadeInUp">
            <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em] mb-4 block">{t('contact.badge')}</span>
            <h1 className="font-serif text-[28px] md:text-[48px] font-bold leading-[1.1] mb-6 tracking-[-0.03em] uppercase">
              {t('contact.title')} <br />
              <span className="text-white">{t('contact.subtitle')}</span>
            </h1>
            <p className="font-sans text-[14px] md:text-[17px] text-slate-400 max-w-xl leading-relaxed">
              {t('contact.desc')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-8 py-24">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5 border border-white/5 overflow-hidden">
          <div className="p-12 md:p-16 bg-[#080B12] flex flex-col justify-center">
            <h2 className="text-[20px] md:text-[28px] font-serif font-bold tracking-tighter mb-12 uppercase">{t('contact.infoTitle')}</h2>
            <div className="space-y-10">
              <div className="flex items-start gap-6 group">
                <div className="text-[#D4AF37] mt-1 group-hover:scale-110 transition-transform"><Mail size={28} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[3px] text-white mb-2">E-mail</p>
                  <a href="mailto:marketsbraxel@ouvidor.net" className="text-slate-400 text-[14px] hover:text-[#D4AF37] transition-colors">marketsbraxel@ouvidor.net</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="text-[#D4AF37] mt-1 group-hover:scale-110 transition-transform"><Clock size={28} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[3px] text-white mb-2">{t('contact.supportHours')}</p>
                  <p className="text-slate-400 text-[14px]">{t('contact.institutionalSupport')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-12 md:p-16 bg-[#080B12]">
            <h2 className="text-[20px] font-serif font-bold uppercase tracking-tighter mb-10">{t('contact.formTitle')}</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Honeypot field - hidden from users */}
              <div className="hidden">
                <Input 
                  type="text" 
                  name="website" 
                  value={formData.website} 
                  onChange={(e) => setFormData({...formData, website: e.target.value})} 
                  tabIndex={-1} 
                  autoComplete="off" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={t('contact.placeholders.name')} 
                  className="bg-white/[0.03] border-white/10 rounded-none h-14 text-[11px] font-bold uppercase tracking-[2px] placeholder:text-slate-700 focus:border-[#D4AF37] transition-colors" 
                />
                <Input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={t('contact.placeholders.email')} 
                  className="bg-white/[0.03] border-white/10 rounded-none h-14 text-[11px] font-bold uppercase tracking-[2px] placeholder:text-slate-700 focus:border-[#D4AF37] transition-colors" 
                />
              </div>
              <Input 
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder={t('contact.placeholders.subject')} 
                className="bg-white/[0.03] border-white/10 rounded-none h-14 text-[11px] font-bold uppercase tracking-[2px] placeholder:text-slate-700 focus:border-[#D4AF37] transition-colors" 
              />
              <Textarea 
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder={t('contact.placeholders.message')} 
                className="bg-white/[0.03] border-white/10 rounded-none min-h-[160px] text-[11px] font-bold uppercase tracking-[2px] placeholder:text-slate-700 focus:border-[#D4AF37] transition-colors" 
              />

              {/* Simple Math Captcha */}
              <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/10">
                <ShieldCheck className="text-[#D4AF37]" size={20} />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t('contact.securityChallenge')}: {captcha.q} = ?</p>
                  <Input 
                    required
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={t('contact.securityAnswer')}
                    className="bg-black border-white/10 rounded-none h-10 text-[11px] font-bold uppercase tracking-[2px] focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Consent notice */}
              <div className="text-[9px] text-slate-500 italic">
                By submitting this form, you agree to our{' '}
                <Link to="/privacy" className="underline hover:text-[#D4AF37]">
                  Privacy Policy
                </Link>{' '}. We use your data only to respond to your inquiry and retain it for [RETENTION_PERIOD]. You can request access to or deletion of your data by contacting marketsbraxel@ouvidor.net.
              </div>

              <Button 
                disabled={loading || cooldown}
                className="w-full bg-[#D4AF37] hover:bg-[#B08D48] text-black rounded-none h-16 text-[12px] font-black uppercase tracking-[2px] transition-all border-none"
              >
                {loading ? <Loader2 className="animate-spin" /> : cooldown ? t('contact.cooldown') + "..." : t('contact.sendBtn')}
              </Button>
            </form>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;