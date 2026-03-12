"use client";

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ShieldCheck, Lock, ArrowLeft, Loader2, CheckCircle2, CreditCard, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateAccountId } from '@/utils/idGenerator';
import { showError, showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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
          balance: plan.accountSize
        }]);

      if (error) throw error;

      showSuccess(`Success! Your ${plan.name} plan is now active.`);
      navigate('/dashboard');
    } catch (error: any) {
      showError("Payment confirmed, but we couldn't update your dashboard. Contact support.");
      console.error(error);
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
          <ArrowLeft size={14} /> Back to Investment Plans
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Resumo do Pedido */}
          <div className="space-y-8">
            <div>
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Order Summary</span>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Finalize your <br /><span className="text-[#C5A059]">Allocation</span></h1>
            </div>

            <div className="bg-[#080B12] border border-white/10 p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck size={120} />
              </div>
              
              <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-xl uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Managed Capital: {plan.accountSize} USD</p>
                </div>
                <span className="text-2xl font-serif font-bold text-[#C5A059]">{plan.price}</span>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <CheckCircle2 size={14} className="text-[#C5A059]" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white">Total Amount</span>
                <span className="text-3xl font-serif font-bold text-white">{plan.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-white/[0.02] border border-dashed border-white/10">
              <ShieldCheck className="text-[#C5A059] shrink-0" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                Institutional-grade security. Your payment is processed through encrypted channels and your capital is protected by our risk protocols.
              </p>
            </div>
          </div>

          {/* Método de Pagamento ou Login */}
          <div className="bg-[#080B12] border border-white/10 p-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="text-[#C5A059]" size={20} />
                <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">Secure Checkout</h2>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <Lock size={12} /> SSL Encrypted
              </div>
            </div>

            {!user ? (
              <div className="space-y-8 py-4">
                <div className="p-6 bg-[#C5A059]/5 border border-[#C5A059]/20 text-center">
                  <p className="text-[11px] font-bold text-[#C5A059] uppercase tracking-widest mb-2">Authentication Required</p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest leading-relaxed">
                    Please login or create an account to link this investment plan to your profile.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    onClick={() => navigate('/login', { state: { from: location.pathname, plan } })}
                    className="bg-white text-black hover:bg-slate-200 rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                  >
                    <LogIn size={16} className="mr-2" /> Login to Account
                  </Button>
                  <Button 
                    onClick={() => navigate('/register', { state: { from: location.pathname, plan } })}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 rounded-none h-14 font-black text-[11px] uppercase tracking-[0.2em]"
                  >
                    <UserPlus size={16} className="mr-2" /> Create New Account
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-center">
                  <p className="text-[11px] font-bold text-green-500 uppercase tracking-widest">
                    Logged in as {user.email}
                  </p>
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
                      onError={(err) => {
                        showError("PayPal transaction failed. Please try again.");
                        console.error(err);
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                By completing this purchase, you authorize Braxel Markets to deploy algorithmic strategies on your behalf. All investments carry risk.
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