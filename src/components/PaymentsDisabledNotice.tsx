"use client";

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Fail-closed gate for payments.
 *
 * Rendered when the payments flag is off. The rule lives in ONE place:
 * `src/lib/paymentsFlag.ts` — `isPaymentsEnabled()` is true when either
 * `VITE_PAYMENTS_ENABLED` (live) or `VITE_TEST_PAYMENT_MODE` (test) is "true".
 *
 * No payment buttons, forms, or checkout flow are rendered. This is NOT
 * test-mode UI; it is the production default.
 */
export const PaymentsDisabledNotice = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="p-6 border border-yellow-700/50 bg-yellow-950/20 text-yellow-300 text-[10px] font-bold uppercase tracking-widest flex items-start gap-4">
        <ShieldAlert size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="mb-2">{t('paymentsDisabled.title')}</p>
          <p className="text-yellow-400/70 normal-case tracking-normal font-medium">
            {t('paymentsDisabled.desc')}{" "}
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
          {t('paymentsDisabled.managedBy')}
        </p>

        <div className="mt-8">
          <Link
            to="/pricing"
            className="inline-block px-8 py-4 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            {t('paymentsDisabled.viewPlans')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentsDisabledNotice;