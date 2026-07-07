// Currency service - Converts prices based on user's country (detected by IP)
// Priority: IP location > Selected language

export interface CountryInfo {
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
}

// Map of countries to their currencies
export const countryCurrencyMap: Record<string, { currency: string; symbol: string; name: string }> = {
  // Americas
  'BR': { currency: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  'US': { currency: 'USD', symbol: '$', name: 'US Dollar' },
  'CA': { currency: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  'MX': { currency: 'MXN', symbol: '$', name: 'Mexican Peso' },
  'AR': { currency: 'ARS', symbol: '$', name: 'Argentine Peso' },
  'CL': { currency: 'CLP', symbol: '$', name: 'Chilean Peso' },
  'CO': { currency: 'COP', symbol: '$', name: 'Colombian Peso' },
  'PE': { currency: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  
  // Europe
  'GB': { currency: 'GBP', symbol: '£', name: 'British Pound' },
  'DE': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'FR': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'IT': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'ES': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'PT': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'NL': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'BE': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'AT': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'CH': { currency: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  'RU': { currency: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  'PL': { currency: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  'SE': { currency: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  'NO': { currency: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  'DK': { currency: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  'CZ': { currency: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  'HU': { currency: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  'UA': { currency: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  'TR': { currency: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  
  // Asia
  'JP': { currency: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  'CN': { currency: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  'HK': { currency: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  'TW': { currency: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  'KR': { currency: 'KRW', symbol: '₩', name: 'South Korean Won' },
  'IN': { currency: 'INR', symbol: '₹', name: 'Indian Rupee' },
  'SG': { currency: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  'MY': { currency: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  'TH': { currency: 'THB', symbol: '฿', name: 'Thai Baht' },
  'ID': { currency: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  'PH': { currency: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  'VN': { currency: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  'AE': { currency: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  'SA': { currency: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  'IL': { currency: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  'PK': { currency: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  
  // Oceania
  'AU': { currency: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  'NZ': { currency: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  
  // Africa
  'ZA': { currency: 'ZAR', symbol: 'R', name: 'South African Rand' },
  'NG': { currency: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  'EG': { currency: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  'KE': { currency: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
};

// Exchange rates from USD (updated periodically - in production, fetch from API)
export const exchangeRates: Record<string, number> = {
  'USD': 1,
  'BRL': 5.05,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.50,
  'CNY': 7.24,
  'HKD': 7.82,
  'TWD': 31.50,
  'KRW': 1330,
  'INR': 83.10,
  'SGD': 1.34,
  'MYR': 4.68,
  'THB': 35.50,
  'IDR': 15400,
  'PHP': 55.80,
  'VND': 24500,
  'AED': 3.67,
  'SAR': 3.75,
  'ILS': 3.70,
  'PKR': 278.50,
  'CAD': 1.36,
  'MXN': 17.15,
  'ARS': 350,
  'CLP': 895,
  'COP': 3950,
  'PEN': 3.72,
  'CHF': 0.88,
  'RUB': 92.50,
  'PLN': 4.02,
  'SEK': 10.45,
  'NOK': 10.55,
  'DKK': 6.88,
  'CZK': 22.80,
  'HUF': 355,
  'UAH': 37.50,
  'TRY': 27.50,
  'AUD': 1.53,
  'NZD': 1.63,
  'ZAR': 18.90,
  'NGN': 770,
  'EGP': 30.90,
  'KES': 153,
};

// Get currency info by country code
export function getCurrencyByCountry(countryCode: string): { currency: string; symbol: string; name: string } {
  return countryCurrencyMap[countryCode] || { currency: 'USD', symbol: '$', name: 'US Dollar' };
}

// Convert USD to target currency
export function convertFromUSD(amountUSD: number, targetCurrency: string): number {
  const rate = exchangeRates[targetCurrency] || 1;
  return amountUSD * rate;
}

// Format currency for display
export function formatCurrency(amount: number, currency: string, symbol: string): string {
  // Special formatting for different currencies
  const decimals = ['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'COP', 'HUF', 'KES'].includes(currency) ? 0 : 2;
  
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  
  return `${symbol}${formatted}`;
}

// Get user's country from IP
export async function getUserCountry(): Promise<string> {
  try {
    // Use a free IP geolocation API
    const response = await fetch('https://ip-api.com/json/?fields=countryCode');
    const data = await response.json();
    return data.countryCode || 'US';
  } catch (error) {
    console.error('Error fetching user country:', error);
    return 'US'; // Default to US if there's an error
  }
}

// Convert price based on user's country
export async function convertPriceForUser(amountUSD: number): Promise<{
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
  countryCode: string;
}> {
  const countryCode = await getUserCountry();
  const { currency, symbol } = getCurrencyByCountry(countryCode);
  const amount = convertFromUSD(amountUSD, currency);
  
  return {
    amount,
    currency,
    symbol,
    formatted: formatCurrency(amount, currency, symbol),
    countryCode,
  };
}
