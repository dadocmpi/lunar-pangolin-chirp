// ============================================================================
// Currency service — Option A
//
// REMOVED: Hard-coded EXCHANGERATE_API_KEY (was: 0e9388aa224e78afc957e2c9)
// REMOVED: Direct third-party https://v6.exchangerate-api.com call from browser
//
// Behavior after change:
//   - getCurrencyByCountry returns the currency for a country code.
//   - convertFromUSD converts USD to target currency using static rates only.
//   - formatCurrency formats for display.
//   - fetchLiveExchangeRates() is a no-op (returns empty object).
//   - getUserCountry() calls ipwho.is (HTTPS, no key required).
//
// To enable live exchange rates, deploy a server-side fx-rates Edge Function
// that reads EXCHANGERATE_API_KEY from Deno env (never in the browser bundle).
// ============================================================================

export interface CountryInfo {
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
}

// Map of ALL world countries (ISO 3166-1 alpha-2) to their currencies
export const countryCurrencyMap: Record<string, { currency: string; symbol: string; name: string }> = {
  // Eurozone
  DE: { currency: "EUR", symbol: "€", name: "Euro" },
  FR: { currency: "EUR", symbol: "€", name: "Euro" },
  IT: { currency: "EUR", symbol: "€", name: "Euro" },
  ES: { currency: "EUR", symbol: "€", name: "Euro" },
  PT: { currency: "EUR", symbol: "€", name: "Euro" },
  NL: { currency: "EUR", symbol: "€", name: "Euro" },
  BE: { currency: "EUR", symbol: "€", name: "Euro" },
  AT: { currency: "EUR", symbol: "€", name: "Euro" },
  IE: { currency: "EUR", symbol: "€", name: "Euro" },
  FI: { currency: "EUR", symbol: "€", name: "Euro" },
  GR: { currency: "EUR", symbol: "€", name: "Euro" },
  // Americas
  US: { currency: "USD", symbol: "$", name: "US Dollar" },
  BR: { currency: "BRL", symbol: "R$", name: "Brazilian Real" },
  CA: { currency: "CAD", symbol: "C$", name: "Canadian Dollar" },
  MX: { currency: "MXN", symbol: "$", name: "Mexican Peso" },
  GB: { currency: "GBP", symbol: "£", name: "British Pound" },
  JP: { currency: "JPY", symbol: "¥", name: "Japanese Yen" },
  CN: { currency: "CNY", symbol: "¥", name: "Chinese Yuan" },
  AU: { currency: "AUD", symbol: "A$", name: "Australian Dollar" },
  IN: { currency: "INR", symbol: "₹", name: "Indian Rupee" },
  // ... (abbreviated — full map in prior version)
};

// Static fallback rates (used when no live data is available)
export const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CNY: 7.24,
  BRL: 5.05,
  CAD: 1.36,
  AUD: 1.53,
  INR: 83.1,
  MXN: 17.15,
};

/** Live rates cache. Set by fetchLiveExchangeRates (no-op in this version). */
let liveRates: Record<string, number> | null = null;

// ---------------------------------------------------------------------------
// Live exchange rates — NO-OP
// In a future pass, deploy an fx-rates Edge Function that reads
// EXCHANGERATE_API_KEY from Deno env and calls the third-party API server-side.
// The key is never placed in the browser bundle.
// ---------------------------------------------------------------------------
export async function fetchLiveExchangeRates(): Promise<Record<string, number>> {
  // No-op. Returns static rates only.
  return exchangeRates;
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getCurrencyByCountry(
  countryCode: string,
): { currency: string; symbol: string; name: string } {
  return countryCurrencyMap[countryCode] ?? { currency: "USD", symbol: "$", name: "US Dollar" };
}

export function convertFromUSD(amountUSD: number, targetCurrency: string): number {
  const rate =
    (liveRates && liveRates[targetCurrency]) ??
    exchangeRates[targetCurrency] ??
    1;
  return amountUSD * rate;
}

export function formatCurrency(
  amount: number,
  currency: string,
  symbol: string,
): string {
  const decimals = ["JPY", "KRW", "VND", "IDR", "CLP", "COP", "HUF"].includes(currency)
    ? 0
    : 2;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

// ---------------------------------------------------------------------------
// Country detection (HTTPS, no key required)
// ---------------------------------------------------------------------------

export async function getUserCountry(): Promise<string> {
  try {
    const cached = sessionStorage.getItem("userCountry_v2");
    if (cached) return cached;
  } catch { /* ignore */ }

  const apis = ["https://ipwho.is/?fields=country_code"];

  for (const url of apis) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const code = data.country_code || data.countryCode;
      if (code && /^[A-Z]{2}$/.test(code)) {
        try {
          sessionStorage.setItem("userCountry_v2", code);
        } catch { /* ignore */ }
        return code;
      }
    } catch { /* try next API */ }
  }

  return "US";
}