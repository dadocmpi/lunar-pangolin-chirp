import { useTranslation } from "react-i18next";
import { Bitcoin, Check, CreditCard, Landmark, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  methodReasonKey,
  resolveMethodAvailability,
  type CheckoutConfig,
  type CheckoutMethodId,
} from "@/lib/checkout";

const METHODS: Array<{
  id: CheckoutMethodId;
  labelKey: string;
  descKey: string;
  Icon: typeof CreditCard;
}> = [
  { id: "card", labelKey: "checkout.card", descKey: "checkout.cardDesc", Icon: CreditCard },
  { id: "crypto", labelKey: "checkout.crypto", descKey: "checkout.cryptoDesc", Icon: Bitcoin },
  { id: "bank", labelKey: "checkout.wiseTransfer", descKey: "checkout.wiseDesc", Icon: Landmark },
];

interface Props {
  config: CheckoutConfig | null;
  value: CheckoutMethodId | null;
  onChange: (method: CheckoutMethodId) => void;
}

/**
 * Lateral payment-method cards. Implemented as toggle buttons (not a radio
 * group) so plain Tab/Enter keyboard navigation works everywhere and the
 * selected state is exposed with `aria-pressed`.
 */
export default function PaymentMethodSelector({ config, value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="checkout-methods-title" className="space-y-4">
      <div className="space-y-2">
        <h2
          id="checkout-methods-title"
          className="text-[11px] font-bold uppercase tracking-[0.3em] text-white"
        >
          {t("checkout.selectPaymentMethod")}
        </h2>
        <p className="text-[10px] leading-relaxed text-slate-500">
          {t("checkoutPage.methodsDesc")}
        </p>
      </div>

      <div role="group" aria-labelledby="checkout-methods-title" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {METHODS.map(({ id, labelKey, descKey, Icon }) => {
          const availability = resolveMethodAvailability(config, id);
          const selected = value === id;
          const reasonKey = methodReasonKey(availability.reason);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              aria-disabled={!availability.available}
              disabled={!availability.available}
              onClick={() => onChange(id)}
              className={cn(
                "group relative flex h-full flex-col gap-3 border p-4 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070A]",
                selected
                  ? "border-[#C5A059] bg-[#C5A059]/10"
                  : "border-white/10 bg-white/[0.02] hover:border-[#C5A059]/60 hover:bg-white/[0.04]",
                !availability.available && "cursor-not-allowed opacity-50 hover:border-white/10 hover:bg-white/[0.02]",
              )}
            >
              <span className="flex items-center justify-between">
                <Icon
                  size={20}
                  aria-hidden="true"
                  className={selected ? "text-[#C5A059]" : "text-slate-400"}
                />
                {selected ? (
                  <Check size={16} className="text-[#C5A059]" aria-hidden="true" />
                ) : !availability.available ? (
                  <Lock size={14} className="text-slate-600" aria-hidden="true" />
                ) : null}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                {t(labelKey)}
              </span>
              <span className="text-[10px] leading-relaxed text-slate-500">{t(descKey)}</span>
              {!availability.available && reasonKey && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E4C88B]">
                  {t(reasonKey)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
