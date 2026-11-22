import { useTranslation } from "react-i18next";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  busy: boolean;
  disabled: boolean;
  onContinue: () => void;
}

/**
 * Card payment. Braxel never renders a card field: the customer continues to
 * Stripe's hosted Checkout, and the server confirms the payment only from a
 * verified webhook (or the reconcile recovery path).
 */
export default function CardPaymentPanel({ busy, disabled, onContinue }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-3">
        <CreditCard size={18} className="text-[#C5A059]" aria-hidden="true" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
          {t("checkout.card")}
        </h3>
      </div>

      <p className="flex items-start gap-2 text-[10px] leading-relaxed text-slate-400">
        <Lock size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-500" />
        {t("checkoutPage.card.secureNote")}
      </p>

      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
        {t("checkout.securePayment")}
      </p>

      <Button
        type="button"
        onClick={onContinue}
        disabled={busy || disabled}
        aria-busy={busy}
        className="h-12 w-full rounded-none bg-[#C5A059] text-[11px] font-black uppercase tracking-[0.2em] text-[#05070A] hover:bg-[#C5A059]/85 focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070A] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {busy ? t("checkout.redirecting") : t("checkoutPage.card.continue")}
      </Button>
    </div>
  );
}
