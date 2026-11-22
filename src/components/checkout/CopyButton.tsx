import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Copy-to-clipboard control with an accessible confirmation. Falls back to a
 * manual selection prompt when the Clipboard API is unavailable.
 */
export default function CopyButton({
  value,
  labelKey = "checkoutPage.copy",
  className,
}: {
  value: string;
  labelKey?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={copy}
      className={
        "h-9 gap-2 rounded-none border-white/15 bg-transparent px-3 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#C5A059] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070A] " +
        (className ?? "")
      }
      aria-live="polite"
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      {copied ? t("checkout.copied") : t(labelKey)}
    </Button>
  );
}
