import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  getUserCountry,
  getCurrencyByCountry,
  convertFromUSD,
  formatCurrency,
  fetchLiveExchangeRates,
  countryCurrencyMap
} from '@/services/currencyService';

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
  const [countryCode, setCountryCode] = useState<string>('US');
  const [currencyInfo, setCurrencyInfo] = useState<{ currency: string; symbol: string; name: string }>({
    currency: 'USD',
    symbol: '$',
    name: 'US Dollar'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [ratesReady, setRatesReady] = useState(false);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const country = await getUserCountry();
        setCountryCode(country);
        const info = getCurrencyByCountry(country);
        setCurrencyInfo(info);
        
        // Store in session for persistence
        sessionStorage.setItem('userCountry_v2', country);
        sessionStorage.setItem('userCurrency_v2', JSON.stringify(info));
      } catch (error) {
        console.error('Error detecting country:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch live exchange rates (cached 1h). Triggers a re-render once loaded
    // so prices recompute with real-time rates.
    fetchLiveExchangeRates().then(() => setRatesReady(true)).catch(() => setRatesReady(true));

    // Check if we already have cached country info
    const cachedCountry = sessionStorage.getItem('userCountry_v2');
    const cachedInfo = sessionStorage.getItem('userCurrency_v2');

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
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// List of all supported currencies with country info
export const supportedCurrencies = Object.entries(countryCurrencyMap).map(([code, info]) => ({
  countryCode: code,
  ...info
})).filter((item, index, self) => 
  index === self.findIndex((t) => t.currency === item.currency)
);

export default useCurrency;
