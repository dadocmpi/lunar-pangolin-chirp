import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Themed loading skeleton block. */
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-white/5", className)} aria-hidden="true" />
);

/** A card-shaped skeleton used while a panel loads. */
export const PanelSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="bg-[#1A1A1A] border border-white/10 p-6 space-y-3" role="status" aria-busy="true">
    <Skeleton className="h-3 w-24" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-8 w-full" />
    ))}
  </div>
);

/** Small inline spinner for buttons. */
export const InlineSpinner = () => (
  <Loader2 className="animate-spin" size={16} aria-hidden="true" />
);

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  hint?: string;
}

export const SectionHeader = ({ eyebrow, title, hint }: SectionHeaderProps) => (
  <div>
    <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">
      {eyebrow}
    </span>
    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{title}</h2>
    {hint && <p className="text-slate-500 text-[12px] mt-2 max-w-2xl">{hint}</p>}
  </div>
);

/** A titled panel with a consistent terminal frame. */
export const Panel = ({
  title,
  children,
  actions,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) => (
  <section className={cn("bg-[#1A1A1A] border border-white/10", className)}>
    {title && (
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          {title}
        </h3>
        {actions}
      </header>
    )}
    <div className="p-6">{children}</div>
  </section>
);

/** Explicit empty state — used instead of any fabricated value. */
export const EmptyState = ({
  icon,
  title,
  hint,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
}) => (
  <div className="p-10 border border-dashed border-white/10 text-center">
    {icon && <div className="flex justify-center mb-4 text-slate-600">{icon}</div>}
    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{title}</p>
    {hint && <p className="text-slate-600 text-[10px] mt-2 max-w-md mx-auto">{hint}</p>}
  </div>
);

/** Error state with a retry affordance. */
export const ErrorState = ({
  message,
  retryLabel,
  onRetry,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}) => (
  <div className="p-8 border border-red-500/20 bg-red-500/5 text-center" role="alert">
    <p className="text-[11px] text-red-300 font-bold uppercase tracking-widest">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 px-5 h-10 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest"
    >
      {retryLabel}
    </button>
  </div>
);

/** A single metric tile. */
export const MetricCard = ({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "muted";
  hint?: string;
}) => (
  <div className="bg-[#1A1A1A] border border-white/10 p-5 md:p-6">
    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{label}</p>
    <p
      className={cn(
        "text-lg md:text-2xl font-serif font-bold tabular-nums",
        tone === "positive" && "text-emerald-500",
        tone === "negative" && "text-red-400",
        tone === "muted" && "text-slate-500 text-sm",
        tone === "neutral" && "text-white",
      )}
    >
      {value}
    </p>
    {hint && <p className="text-[9px] text-slate-600 mt-1">{hint}</p>}
  </div>
);
