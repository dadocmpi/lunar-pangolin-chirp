"use client";

import React from 'react';
import { ShieldAlert, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Fail-closed gate for payments.
 *
 * Rendered when VITE_PAYMENTS_ENABLED is not set to the string "true".
 * No payment buttons, forms, or checkout flow are rendered.
 *
 * This is NOT test-mode UI. It is the production default.
 * Test mode is a separate runtime concern enabled by PAYMENTS_ENABLED = "true".
 */
export const PaymentsDisabledNotice = () => {
  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="p-6 border border-yellow-700/50 bg-yellow-950/20 text-yellow-300 text-[10px] font-bold uppercase tracking-widest flex items-start gap-4">
        <ShieldAlert size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="mb-2">Payments are currently disabled.</p>
          <p className="text-yellow-400/70 normal-case tracking-normal font-medium">
            The payment system is not yet active. To enable payments, contact the operator at{" "}
            <a
              href="mailto:marketsbraxel@ouvidor.net"
              className="underline hover:text-yellow-300"
            >
              marketsbraxel@ouvidor.net
            </a>
            .
          </p>
        </div>
      </div>

      <div className="p-8 bg-[#080B12] border border-white/10 text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto">
          Payment processing is managed exclusively by the platform operator. If you
          have questions about a pending allocation, please contact support.
        </p>

        <div className="mt-8">
          <Link
            to="/pricing"
            className="inline-block px-8 py-4 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            View Investment Plans
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentsDisabledNotice;