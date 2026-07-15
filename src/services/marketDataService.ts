// Market Data Service - Twelves Data API integration for real-time market data
// Covers: Indices, Commodities, Forex

export interface MarketPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  type: 'crypto' | 'forex' | 'index' | 'commodity';
}

// Symbol mappings for Twelves Data
export const twelvesSymbols: Record<string, { twelves: string; name: string; currency: string; type: 'forex' | 'index' | 'commodity' }> = {
  'IXIC': { twelves: 'IXIC', name: 'Nasdaq', currency: 'USD', type: 'index' },
  'XAG/USD': { twelves: 'XAG/USD', name: 'Silver', currency: 'USD', type: 'commodity' },
  'WTI': { twelves: 'WTI', name: 'Oil (WTI)', currency: 'USD', type: 'commodity' },
  // Additional forex pairs
  'EUR/USD': { twelves: 'EUR/USD', name: 'EUR/USD', currency: 'USD', type: 'forex' },
  'GBP/USD': { twelves: 'GBP/USD', name: 'GBP/USD', currency: 'USD', type: 'forex' },
  'GBP/JPY': { twelves: 'GBP/JPY', name: 'GBP/JPY', currency: 'JPY', type: 'forex' },
  'USD/CAD': { twelves: 'USD/CAD', name: 'USD/CAD', currency: 'CAD', type: 'forex' },
};

// Crypto symbols for Binance
export const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'PAXGUSDT'];

interface TwelvesResponse {
  price?: string;
  percent_change?: string;
  error?: string;
}

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

// Get API key from environment or use demo mode
const getApiKey = (): string => {
  return import.meta.env.VITE_TWELVES_DATA_API_KEY || '';
};

const hasValidApiKey = (): boolean => {
  const key = getApiKey();
  return key !== '' && key !== 'your_api_key_here';
};

// Fetch single price from Twelves Data
async function fetchTwelvesPrice(symbol: string): Promise<{ price: number; changePercent: number } | null> {
  if (!hasValidApiKey()) {
    // Return mock data in demo mode
    return getMockData(symbol);
  }

  const mapping = twelvesSymbols[symbol];
  if (!mapping) return null;

  try {
    const response = await fetch(
      `https://api.twelvedata.com/price?symbol=${mapping.twelves}&apikey=${getApiKey()}`
    );
    const data: TwelvesResponse = await response.json();

    if (data.error) {
      console.warn(`Twelves Data error for ${symbol}:`, data.error);
      return getMockData(symbol);
    }

    return {
      price: parseFloat(data.price || '0'),
      changePercent: parseFloat(data.percent_change || '0'),
    };
  } catch (error) {
    console.error(`Error fetching ${symbol} from Twelves:`, error);
    return getMockData(symbol);
  }
}

// Fetch all Twelves Data prices (batch)
export async function fetchAllTwelvesPrices(): Promise<Record<string, { price: number; changePercent: number }>> {
  const result: Record<string, { price: number; changePercent: number }> = {};

  if (!hasValidApiKey()) {
    // Return mock data for all symbols in demo mode
    Object.keys(twelvesSymbols).forEach(symbol => {
      result[symbol] = getMockData(symbol)!;
    });
    return result;
  }

  const symbols = Object.entries(twelvesSymbols)
    .filter(([_, v]) => v.type !== 'forex')
    .map(([symbol, v]) => `${v.twelves}:${symbol}`)
    .join(',');

  try {
    const response = await fetch(
      `https://api.twelvedata.com/price?symbol=${symbols}&apikey=${getApiKey()}`
    );
    const data = await response.json();

    if (Array.isArray(data)) {
      data.forEach((item: TwelvesResponse & { symbol: string }) => {
        const reverseMap = Object.entries(twelvesSymbols).find(([_, v]) => v.twelves === item.symbol);
        if (reverseMap) {
          const [, mapping] = reverseMap;
          result[reverseMap[0]] = {
            price: parseFloat(item.price || '0'),
            changePercent: parseFloat(item.percent_change || '0'),
          };
        }
      });
    }
  } catch (error) {
    console.error('Error fetching batch prices:', error);
  }

  return result;
}

// Fetch crypto prices from Binance
export async function fetchCryptoPrices(): Promise<Record<string, { price: number; changePercent: number }>> {
  const result: Record<string, { price: number; changePercent: number }> = {};

  try {
    const response = await fetch(
      'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","PAXGUSDT"]'
    );
    const data: BinanceTicker[] = await response.json();

    data.forEach(item => {
      result[item.symbol] = {
        price: parseFloat(item.lastPrice),
        changePercent: parseFloat(item.priceChangePercent),
      };
    });
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
  }

  return result;
}

// Fetch all market data combined
export async function fetchAllMarketData(): Promise<{
  crypto: Record<string, { price: number; changePercent: number }>;
  twelves: Record<string, { price: number; changePercent: number }>;
  timestamp: number;
}> {
  const [crypto, twelves] = await Promise.all([
    fetchCryptoPrices(),
    fetchAllTwelvesPrices(),
  ]);

  return {
    crypto,
    twelves,
    timestamp: Date.now(),
  };
}

// Mock data for demo mode
function getMockData(symbol: string): { price: number; changePercent: number } | null {
  const mockPrices: Record<string, { price: number; change: number }> = {
    'IXIC': { price: 17850.25, change: 0.45 },
    'XAG/USD': { price: 28.45, change: -0.32 },
    'WTI': { price: 78.25, change: 1.15 },
    'EUR/USD': { price: 1.0844, change: 0.12 },
    'GBP/USD': { price: 1.2632, change: -0.05 },
    'GBP/JPY': { price: 190.45, change: 0.15 },
    'USD/CAD': { price: 1.3520, change: -0.08 },
  };

  const mock = mockPrices[symbol];
  if (!mock) return null;

  return {
    price: mock.price,
    changePercent: mock.change,
  };
}

// Calculate forex rate from exchange rate API (fallback)
export async function fetchForexRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return data.rates || {};
  } catch (error) {
    console.error('Error fetching forex rates:', error);
    return {};
  }
}
