import { useTranslation } from "react-i18next";
import { AlertTriangle, Bitcoin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CheckoutStatusBadge from "@/components/CheckoutStatusBadge";
import CheckoutNotice from "@/components/checkout/CheckoutNotice";
import CopyButton from "@/components/checkout/CopyButton";
import { formatUsd } from "@/lib/plans";
import type { CheckoutCryptoNetwork, CheckoutResponse } from "@/lib/checkout";
import type { CheckoutPaymentStatus } from "@/hooks/usePaymentStatus";

interface Props {
  networks: CheckoutCryptoNetwork[];
  selectedNetwork: string | null;
  onSelectNetwork: (id: string) => void;
  onCreate: () => void;
  busy: boolean;
  disabled: boolean;
  response: CheckoutResponse | null;
  status: CheckoutPaymentStatus | null;
}

/**
 * Crypto payment. Only networks the server reports as configured can be
 * selected, and the deposit address is shown only when the server returns one.
 * There is no client-side "paid" action: confirmation is server-side.
 */
export default function CryptoPaymentPanel({
  networks,
  selectedNetwork,
  onSelectNetwork,
  onCreate,
  busy,
  disabled,
  response,
  status,
}: Props) {
  const { t } = useTranslation();
  const payment = response?.payment ?? null;

  return (
    <div className="space-y-4 border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-3">
        <Bitcoin size={18} className="text-[#C5A059]" aria-hidden="true" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">
          {t("checkout.crypto")}
        </h3>
      </div>

      <CheckoutNotice tone="warning">
        <p className="flex items-start gap-2">
          <AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          {t("checkoutPage.crypto.wrongNetworkWarning")}
        </p>
      </CheckoutNotice>

      {networks.length === 0 ? (
        <p className="text-[11px] leading-relaxed text-slate-400">
          {t("checkoutPage.crypto.noConfiguredAsset")}
        </p>
      ) : (
        <div className="space-y-2">
          <label
            htmlFor="checkout-crypto-network"
            className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
          >
            {t("checkoutPage.crypto.assetLabel")}
          </label>
          <select
            id="checkout-crypto-network"
            value={selectedNetwork ?? ""}
            onChange={(e) => onSelectNetwork(e.target.value)}
            className="h-12 w-full rounded-none border border-white/10 bg-[#0B0E14] px-3 text-[13px] font-medium text-white focus-visible:border-[#C5A059] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/60"
          >
            {networks.map((n) => (
              <option key={n.id} value={n.id}>
                {n.symbol} · {n.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {networks.length > 0 && !payment && (
        <Button
          type="button"
          onClick={onCreate}
          disabled={busy || disabled || !selectedNetwork}
          aria-busy={busy}
          className="h-12 w-full rounded-none bg-[#C5A059] text-[11px] font-black uppercase tracking-[0.2em] text-[#05070A] hover:bg-[#C5A059]/85 focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {t("checkoutPage.crypto.createInstruction")}
        </Button>
      )}

      {payment && (
        <div className="space-y-3">
          {status && (
            <CheckoutStatusBadge status={status} />
          )}

          {response?.deposit_address && (
            <div className="space-y-2 border border-white/10 bg-[#05070A] p-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {t("checkout.yourAddress")}
              </p>
              <p className="break-all font-mono text-[11px] text-slate-200">
                {response.deposit_address}
              </p>
              <CopyButton value={response.deposit_address} labelKey="checkoutPage.copy" />
            </div>
          )}

          <dl className="grid grid-cols-1 gap-2 text-[10px] sm:grid-cols-3">
            <div className="border border-white/10 p-3">
              <dt className="font-bold uppercase tracking-widest text-slate-500">
                {t("checkoutPage.crypto.networkLabel")}
              </dt>
              <dd className="mt-1 text-slate-200">{payment.network ?? "—"}</dd>
            </div>
            <div className="border border-white/10 p-3">
              <dt className="font-bold uppercase tracking-widest text-slate-500">
                {t("checkout.amountToPay")}
              </dt>
              <dd className="mt-1 text-slate-200">{formatUsd(payment.amount_cents / 100)}</dd>
            </div>
            <div className="border border-white/10 p-3">
              <dt className="font-bold uppercase tracking-widest text-slate-500">
                {t("checkoutPage.currencyLabel")}
              </dt>
              <dd className="mt-1 text-slate-200">{payment.currency ?? "USD"}</dd>
            </div>
          </dl>

          {response?.expires_at && (
            <p className="text-[10px] text-slate-500">
              {t("checkoutPage.crypto.expiryLabel")}: {response.expires_at}
            </p>
          )}

          <CheckoutNotice tone="pending">
            <p className="font-bold uppercase tracking-widest">
              {t("checkoutPage.crypto.pendingTitle")}
            </p>
            <p>{t("checkoutPage.crypto.pendingDesc")}</p>
          </CheckoutNotice>
        </div>
      )}
    </div>
  );
}
