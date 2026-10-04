// ============================================================================
// terminalFormat — locale-aware formatting for the trading terminal.
//
// Every number, currency, percent, date and duration shown in the terminal
// goes through here so it follows the active i18next locale (and its RTL
// direction) instead of the browser default. Tradovate values are USD and UTC;
// we format in USD (the account currency) and render timestamps in the user's
// local timezone.
// ============================================================================

/** Normalize an i18next language tag to a BCP-47 locale for Intl. */
export function intlLocale(language: string | undefined): string {
  const base = (language || "en").split("-")[0];
  const map: Record<string, string> = {
    en: "en-US",
    pt: "pt-BR",
    it: "it-IT",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    ru: "ru-RU",
    zh: "zh-CN",
    ja: "ja-JP",
    ar: "ar-EG",
    he: "he-IL",
  };
  return map[base] ?? base;
}

/** USD currency (the managed-capital / Tradovate account currency). */
export function formatUsd(value: number, locale: string, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Signed USD, with an explicit + for gains. */
export function formatSignedUsd(value: number, locale: string): string {
  if (!Number.isFinite(value)) return "—";
  const formatted = formatUsd(Math.abs(value), locale);
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

/** Plain number with grouping. */
export function formatNumber(value: number, locale: string, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Price with enough precision for futures ticks. */
export function formatPrice(value: number | null | undefined, locale: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 2 : abs >= 1 ? 2 : 4;
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

/** 0..1 ratio as a localized percent. */
export function formatPercent(ratio: number | null | undefined, locale: string): string {
  if (ratio === null || ratio === undefined || !Number.isFinite(ratio)) return "—";
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(ratio);
}

/** Ratio (e.g. profit factor) with 2 decimals. */
export function formatRatio(value: number | null | undefined, locale: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Local date + time from a UTC ISO string. */
export function formatDateTime(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/** Local date only. */
export function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" }).format(d);
}

/** Short month label from a YYYY-MM-DD or YYYY-MM key (UTC). */
export function formatMonth(key: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(key);
  if (!m) return key;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, m[3] ? Number(m[3]) : 1));
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
    day: m[3] ? "numeric" : undefined,
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Weekday initial for a UTC calendar day. */
export function formatWeekday(key: string, locale: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return "";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat(intlLocale(locale), { weekday: "short", timeZone: "UTC" }).format(d);
}

/** "Last synced <relative time>" from a UTC ISO string. */
export function formatRelative(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const diffSec = Math.round((t - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: "auto" });
  if (abs < 60) return rtf.format(Math.round(diffSec), "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  return rtf.format(Math.round(diffSec / 86400), "day");
}

/** Duration in seconds -> "1h 23m" style using localized units. */
export function formatDuration(
  seconds: number,
  locale: string,
  units: { h: string; m: string; s: string },
): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${formatNumber(h, locale)}${units.h} ${formatNumber(m, locale)}${units.m}`;
  if (m > 0) return `${formatNumber(m, locale)}${units.m} ${formatNumber(s, locale)}${units.s}`;
  return `${formatNumber(s, locale)}${units.s}`;
}
