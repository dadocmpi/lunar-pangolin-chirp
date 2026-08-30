import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
  getUserCountry,
  getCurrencyByCountry,
  convertFromUSD,
  formatCurrency,
  fetchLiveExchangeRates,
  countryCurrencyMap,
} from "@/services/currencyService";

interface CurrencyContextType {
  countryCode: string;
  currency: string;
  symbol: string;
  currencyName: string;
  isLoading: boolean;
  ratesReady: boolean;
  convertPrice: (amountUSD: number) => string;
  convertPriceValue: (amountUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState<string>("US");
  const [currencyInfo, setCurrencyInfo] = useState<{
    currency: string;
    symbol: string;
    name: string;
  }>({ currency: "USD", symbol: "$", name: "US Dollar" });
  const [isLoading, setIsLoading] = useState(true);
  const [ratesReady, setRatesReady] = useState(false);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const country = await getUserCountry();
        setCountryCode(country);
        const info = getCurrencyByCountry(country);
        setCurrencyInfo(info);
        try {
          sessionStorage.setItem("userCountry_v2", country);
          sessionStorage.setItem(
            "userCurrency_v2",
            JSON.stringify(info),
          );
        } catch { /* ignore */ }
      } catch (error) {
        console.error("Error detecting country:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // fetchLiveExchangeRates is a no-op in Option A.
    // To enable live rates, deploy a server-side fx-rates Edge Function.
    fetchLiveExchangeRates()
      .then(() => setRatesReady(true))
      .catch(() => setRatesReady(true));

    const cachedCountry = sessionStorage.getItem("userCountry_v2");
    const cachedInfo = sessionStorage.getItem("userCurrency_v2");

    if (cachedCountry && cachedInfo) {
      setCountryCode(cachedCountry);
      setCurrencyInfo(JSON.parse(cachedInfo));
      setIsLoading(false);
    } else {
      detectCountry();
    }
  }, []);

  const convertPrice = (amountUSD: number): string => {
    const amount = convertFromUSD(amountUSD, currencyInfo.currency);
    return formatCurrency(amount, currencyInfo.currency, currencyInfo.symbol);
  };

  const convertPriceValue = (amountUSD: number): number => {
    return convertFromUSD(amountUSD, currencyInfo.currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        countryCode,
        currency: currencyInfo.currency,
        symbol: currencyInfo.symbol,
        currencyName: currencyInfo.name,
        isLoading,
        ratesReady,
        convertPrice,
        convertPriceValue,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

export default useCurrency;