"use client";

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  CreditCard, 
  UserPlus, 
  LogIn,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateAccountId } from '@/utils/idGenerator';
import { showError, showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const Checkout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const plan = location.state?.plan;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    if (!plan) {
      navigate('/pricing');
      return;
    }

    checkUser();
  }, [plan, navigate]);

  const handlePaymentSuccess = async (details: any) => {
    if (!user) return;
    
    try {
      const accountId = generateAccountId();
      const { error } = await supabase
        .from('services')
        .insert([{ 
          user_id: user.id, 
          plan_name: plan.name, 
          account_id: accountId,
          status: 'Active',
          balance: parseFloat(plan.accountSize.replace(/[^0-9.]/g, ''))
        }]);

      if (error) throw error;

      showSuccess(`Success! Your ${plan.name} plan is now active.`);
      navigate('/dashboard');
    } catch (error: any) {
      showError("Payment confirmed, but we couldn't update your dashboard. Please contact support.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C5A059]" size={48} />
      </div>
    );
  }

  const numericPrice = plan.price.replace(/[^0-9.]/g, '');

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />
      
      <div className="container mx-auto px-8 pt-[140px] pb-20">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] mb-12 transition-colors">
          <ArrowLeft size={14} /> {t('nav.pricing')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Coluna da Esquerda: Resumo do Plano */}
          <div className="space-y-8">
            <div>
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{t('checkout.summary')}</span>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Order <span className="text-[#C5A059]">Review</span></h1>
            </div>

            <div className="bg-[#080B12] border border-white/10 p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck size={120} />
              </div>
              
              <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-xl uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Institutional Infrastructure</p>
                </div>
                <span className="text-2xl font-serif font-bold text-[#C5A059]">{plan.price}</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Managed Capital</span>
                  <span className="text-white">{plan.accountSize} USD</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Setup Fee</span>
                  <span className="text-green-500">WAIVED</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Billing Cycle</span>
                  <span className="text-white">Monthly</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white">Total Due Today</span>
                <span className="text-3xl font-serif font-bold text-white">{plan.price}</span>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 flex gap-4">
              <ShieldAlert className="text-[#C5A059] shrink-0" size={20} />
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                By proceeding, you acknowledge that algorithmic trading involves risk. Braxel Markets provides the infrastructure; market results may vary.
              </p>
            </div>
          </div>

          {/* Coluna da Direita: Ações de Pagamento */}
          <div className="bg-[#080B12] border border-white/10 p-10 space-y-8">
            {!user ? (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-[#C5A059]">
                    <Lock size={24} />
                  </div>
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">{t('checkout.authRequired')}</h2>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                    {t('checkout.authDesc')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    onClick={() => navigate('/login', { state: { from: location.pathname, plan } })}
                    className="bg-white text-black hover:bg-slate-200 rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                  >
                    <LogIn size={16} className="mr-2" /> {t('checkout.btnLogin')}
                  </Button>
                  <Button 
                    onClick={() => navigate('/register', { state: { from: location.pathname, plan } })}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                  >
                    <UserPlus size={16} className="mr-2" /> {t('checkout.btnRegister')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Authenticated as {user.email}</span>
                  </div>
                </div>

                {!showPayPal ? (
                  <div className="space-y-6 animate-fadeInUp">
                    <div className="space-y-4">
                      <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">Confirm Your <span className="text-[#C5A059]">Allocation</span></h2>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
                        Click the button below to confirm your selection and proceed to the secure PayPal payment gateway.
                      </p>
                    </div>

                    <Button 
                      onClick={() => setShowPayPal(true)}
                      className="w-full bg-[#C5A059] hover:bg-[#B08D48] text-white rounded-none h-16 font-black text-[12px] uppercase tracking-[0.3em] transition-all group"
                    >
                      CONFIRM & PROCEED TO PAYMENT <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-fadeInUp">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">Secure Payment</h2>
                      <button 
                        onClick={() => setShowPayPal(false)}
                        className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                      >
                        Change Plan
                      </button>
                    </div>

                    <div className="relative z-0">
                      <PayPalScriptProvider options={{ clientId: "test" }}> 
                        <PayPalButtons 
                          style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                          createOrder={(data, actions) => {
                            return actions.order.create({
                              intent: "CAPTURE",
                              purchase_units: [
                                {
                                  amount: {
                                    value: numericPrice,
                                    currency_code: "EUR"
                                  },
                                  description: `Braxel Markets - ${plan.name} Investment Plan`
                                },
                              ],
                            });
                          }}
                          onApprove={async (data, actions) => {
                            const details = await actions.order?.capture();
                            handlePaymentSuccess(details);
                          }}
                        />
                      </PayPalScriptProvider>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      <Lock size={12} /> 256-bit SSL Secure Connection
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                Institutional Grade Security Infrastructure. <br />
                © 2026 Braxel Markets. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;