"use client";

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ShieldCheck, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateAccountId } from '@/utils/idGenerator';
import { showError, showSuccess } from '@/utils/toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const plan = location.state?.plan;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError("Please login to continue with the purchase.");
        navigate('/login', { state: { from: location.pathname, plan } });
        return;
      }
      setUser(user);
      setLoading(false);
    };

    if (!plan) {
      navigate('/pricing');
      return;
    }

    checkUser();
  }, [plan, navigate, location]);

  const handlePaymentSuccess = async (details: any) => {
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

      showSuccess(`Payment successful! Your ${plan.name} plan is now active.`);
      navigate('/dashboard');
    } catch (error: any) {
      showError("Payment processed but failed to update account. Please contact support.");
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

  // Extrair valor numérico do preço (ex: "€70.00" -> "70.00")
  const numericPrice = plan.price.replace(/[^0-9.]/g, '');

  return (
    <div className="min-h-screen bg-[#05070A] text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />
      
      <div className="container mx-auto px-8 pt-[140px] pb-20">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[#C5A059] mb-12 transition-colors">
          <ArrowLeft size={14} /> Back to Plans
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Order Summary */}
          <div className="space-y-8">
            <div>
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Checkout</span>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Review your <br /><span className="text-[#C5A059]">Investment</span></h1>
            </div>

            <div className="bg-[#080B12] border border-white/10 p-8 space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-lg uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Institutional Allocation: {plan.accountSize} USD</p>
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
                <span className="text-[11px] font-bold uppercase tracking-widest text-white">Total to Pay</span>
                <span className="text-3xl font-serif font-bold text-white">{plan.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-white/[0.02] border border-dashed border-white/10">
              <ShieldCheck className="text-[#C5A059]" size={24} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
                Your transaction is protected by institutional-grade AES-256 encryption. Funds are managed through secure liquidity providers.
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#080B12] border border-white/10 p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">Payment Method</h2>
              <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <Lock size={12} /> Secure Payment
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Complete your purchase using PayPal. You can pay with your PayPal balance or linked credit/debit cards.
              </p>

              <div className="relative z-0">
                <PayPalScriptProvider options={{ "client-id": "test" }}> {/* Substitua 'test' pelo seu Client ID real do PayPal */}
                  <PayPalButtons 
                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: numericPrice,
                              currency_code: "EUR"
                            },
                            description: `Braxel Markets - ${plan.name} Plan`
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const details = await actions.order?.capture();
                      handlePaymentSuccess(details);
                    }}
                    onError={(err) => {
                      showError("PayPal Checkout failed. Please try again.");
                      console.error(err);
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                By clicking "Pay", you agree to our Terms of Service and Financial Disclaimer.
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