import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, RefreshCw, ShieldCheck } from "lucide-react";
import { formatUsd } from "@/lib/plans";

interface Props {
  planName: string;
  /** Canonical USD amount from the shared plan table. */
  amountUsd: number;
  currency: string;
  changePlanTo?: string;
}

/**
 * The order summary. Sticky only on large screens, where the viewport is tall
 * enough to keep it in view without trapping the form; on mobile it scrolls
 * with the page.
 */
export default function PlanSummaryCard({
  planName,
  amountUsd,
  currency,
  changePlanTo = "/pricing",
}: Props) {
  const { t } = useTranslation();

  return (
    <aside
      aria-labelledby="checkout-summary-title"
      className="self-start border border-white/10 bg-[#080B12] p-6 md:p-8 lg:sticky lg:top-28"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="checkout-summary-title"
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059]"
        >
          {t("checkout.summary")}
        </h2>
        <ShieldCheck size={18} className="text-[#C5A059]" aria-hidden="true" />
      </div>

      <dl className="mt-6 space-y-4 border-b border-white/5 pb-6">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t("checkoutPage.planLabel")}
          </dt>
          <dd className="text-sm font-bold uppercase tracking-wide text-white">
            {planName}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t("checkoutPage.intervalLabel")}
          </dt>
          <dd className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-300">
            <RefreshCw size={12} aria-hidden="true" />
            {t("checkout.billedMonthly")}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {t("checkoutPage.currencyLabel")}
          </dt>
          <dd className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
            {currency}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {t("checkout.amountToPay")}
        </span>
        <span className="font-serif text-3xl font-bold text-[#C5A059]">
          {formatUsd(amountUsd)}
        </span>
      </div>

      <p className="mt-4 text-[10px] leading-relaxed text-slate-500">
        {t("checkoutPage.recurringDisclosure")}
      </p>

      <Link
        to={changePlanTo}
        className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 underline-offset-4 transition-colors hover:text-[#C5A059] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B12]"
      >
        {t("checkoutPage.changePlan")}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </aside>
  );
}
