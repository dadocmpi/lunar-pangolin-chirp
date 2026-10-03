import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

// A new deploy replaces the hashed chunk files, so a tab still holding the old
// index.html 404s when it lazily imports a page. Reloading once picks up the
// new build. We throttle reloads with a timestamp instead of a one-shot flag so
// a permanently broken chunk shows the recovery UI rather than looping, while a
// later stale-deploy event can still auto-recover.
const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk .* failed|Loading CSS chunk/i;
const RELOAD_AT_KEY = "braxel-chunk-reload-at";
const RELOAD_COOLDOWN_MS = 10_000;

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] text-white px-6">
      <div className="w-full max-w-md text-center border border-white/10 bg-[#080B12] p-10">
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-4 text-[#C5A059]">
          {t("errorBoundary.title")}
        </h1>
        <p className="text-[12px] text-slate-400 leading-relaxed mb-8">
          {t("errorBoundary.message")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="bg-[#C5A059] hover:bg-[#B08D48] text-black rounded-none h-12 px-6 text-[11px] font-black uppercase tracking-[0.2em] transition-colors"
          >
            {t("errorBoundary.retry")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-none h-12 px-6 text-[11px] font-black uppercase tracking-[0.2em] border border-white/10 text-white hover:bg-white/5 transition-colors"
          >
            {t("errorBoundary.home")}
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Catches render/lifecycle errors from the subtree so a single failing page or
 * a failed lazy-chunk fetch never unmounts the whole app into a black screen.
 * A full reload re-attempts the failed dynamic import; it is the reliable escape
 * hatch for stale-chunk and render errors alike.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? "" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error("[ErrorBoundary] caught error:", error, info);
    if (!CHUNK_ERROR.test(error?.message ?? "")) return;
    try {
      const last = Number(sessionStorage.getItem(RELOAD_AT_KEY) ?? 0);
      if (Date.now() - last > RELOAD_COOLDOWN_MS) {
        sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now()));
        window.location.reload();
      }
    } catch {
      /* storage unavailable — fall through to the manual retry UI */
    }
  }

  private handleRetry = () => {
    try {
      sessionStorage.removeItem(RELOAD_AT_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
