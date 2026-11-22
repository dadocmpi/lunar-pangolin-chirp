import { AlertTriangle, CheckCircle2, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckoutNoticeTone } from "@/lib/checkout";

const TONES: Record<
  CheckoutNoticeTone,
  { className: string; Icon: typeof Info }
> = {
  success: {
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    Icon: CheckCircle2,
  },
  error: {
    className: "border-red-500/40 bg-red-500/10 text-red-200",
    Icon: AlertTriangle,
  },
  warning: {
    className: "border-[#C5A059]/40 bg-[#C5A059]/10 text-[#E4C88B]",
    Icon: AlertTriangle,
  },
  pending: {
    className: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    Icon: Clock,
  },
};

export default function CheckoutNotice({
  tone,
  children,
  className,
}: {
  tone: CheckoutNoticeTone;
  children: React.ReactNode;
  className?: string;
}) {
  const { className: toneClass, Icon } = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 border p-4 text-[11px] leading-relaxed",
        toneClass,
        className,
      )}
    >
      <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}
