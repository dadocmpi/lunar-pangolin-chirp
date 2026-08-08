// Currency service - Converts prices based on user's country (detected by IP)
// Priority: IP location > Selected language

export interface CountryInfo {
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
}

// Map of ALL world countries (ISO 3166-1 alpha-2) to their currencies
export const countryCurrencyMap: Record<string, { currency: string; symbol: string; name: string }> = {
  // Eurozone (EUR)
  'DE': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'FR': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'IT': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'ES': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'PT': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'NL': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'BE': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'AT': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'IE': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'FI': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'GR': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'LU': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'CY': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'MT': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'SK': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'SI': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'EE': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'LV': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'LT': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'HR': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'AD': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'MC': { currency: 'EUR', symbol: '€', name: 'Euro' },
  'SM': { currency: 'EUR', symbol: '€', name: 'Euro' }, 'VA': { currency: 'EUR', symbol: '€', name: 'Euro' },
  // Americas
  'US': { currency: 'USD', symbol: '$', name: 'US Dollar' }, 'BR': { currency: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  'CA': { currency: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }, 'MX': { currency: 'MXN', symbol: '$', name: 'Mexican Peso' },
  'AR': { currency: 'ARS', symbol: '$', name: 'Argentine Peso' }, 'CL': { currency: 'CLP', symbol: '$', name: 'Chilean Peso' },
  'CO': { currency: 'COP', symbol: '$', name: 'Colombian Peso' }, 'PE': { currency: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  'UY': { currency: 'UYU', symbol: '$U', name: 'Uruguayan Peso' }, 'PY': { currency: 'PYG', symbol: '₲', name: 'Paraguayan Guarani' },
  'BO': { currency: 'BOB', symbol: 'Bs', name: 'Bolivian Boliviano' }, 'VE': { currency: 'VES', symbol: 'Bs', name: 'Venezuelan Bolivar' },
  'EC': { currency: 'USD', symbol: '$', name: 'US Dollar' }, 'GT': { currency: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
  'HN': { currency: 'HNL', symbol: 'L', name: 'Honduran Lempira' }, 'NI': { currency: 'NIO', symbol: 'C$', name: 'Nicaraguan Cordoba' },
  'CR': { currency: 'CRC', symbol: '₡', name: 'Costa Rican Colon' }, 'PA': { currency: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' },
  'DO': { currency: 'DOP', symbol: 'RD$', name: 'Dominican Peso' }, 'CU': { currency: 'CUP', symbol: '₱', name: 'Cuban Peso' },
  'JM': { currency: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' }, 'TT': { currency: 'TTD', symbol: 'TT$', name: 'Trinidad Dollar' },
  'BB': { currency: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar' }, 'BS': { currency: 'BSD', symbol: 'B$', name: 'Bahamian Dollar' },
  'HT': { currency: 'HTG', symbol: 'G', name: 'Haitian Gourde' }, 'KY': { currency: 'KYD', symbol: 'KY$', name: 'Cayman Dollar' },
  'BM': { currency: 'BMD', symbol: 'BD$', name: 'Bermudian Dollar' }, 'BZ': { currency: 'BZD', symbol: 'BZ$', name: 'Belize Dollar' },
  'AW': { currency: 'AWG', symbol: 'ƒ', name: 'Aruban Florin' }, 'AN': { currency: 'USD', symbol: '$', name: 'US Dollar' },
  'LC': { currency: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' }, 'GD': { currency: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  'KN': { currency: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' }, 'AG': { currency: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  'DM': { currency: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' }, 'VC': { currency: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  // Europe (non-Euro)
  'GB': { currency: 'GBP', symbol: '£', name: 'British Pound' }, 'CH': { currency: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  'RU': { currency: 'RUB', symbol: '₽', name: 'Russian Ruble' }, 'PL': { currency: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  'SE': { currency: 'SEK', symbol: 'kr', name: 'Swedish Krona' }, 'NO': { currency: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  'DK': { currency: 'DKK', symbol: 'kr', name: 'Danish Krone' }, 'CZ': { currency: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  'HU': { currency: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' }, 'UA': { currency: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  'TR': { currency: 'TRY', symbol: '₺', name: 'Turkish Lira' }, 'RO': { currency: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  'BG': { currency: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' }, 'RS': { currency: 'RSD', symbol: 'дин', name: 'Serbian Dinar' },
  'IS': { currency: 'ISK', symbol: 'kr', name: 'Icelandic Krona' }, 'MD': { currency: 'MDL', symbol: 'L', name: 'Moldovan Leu' },
  'AL': { currency: 'ALL', symbol: 'L', name: 'Albanian Lek' }, 'BA': { currency: 'BAM', symbol: 'KM', name: 'Bosnian Mark' },
  'MK': { currency: 'MKD', symbol: 'ден', name: 'Macedonian Denar' }, 'GE': { currency: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  'AM': { currency: 'AMD', symbol: '֏', name: 'Armenian Dram' }, 'AZ': { currency: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  'BY': { currency: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' }, 'LI': { currency: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  // Asia
  'JP': { currency: 'JPY', symbol: '¥', name: 'Japanese Yen' }, 'CN': { currency: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  'HK': { currency: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' }, 'TW': { currency: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  'KR': { currency: 'KRW', symbol: '₩', name: 'South Korean Won' }, 'IN': { currency: 'INR', symbol: '₹', name: 'Indian Rupee' },
  'SG': { currency: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }, 'MY': { currency: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  'TH': { currency: 'THB', symbol: '฿', name: 'Thai Baht' }, 'ID': { currency: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  'PH': { currency: 'PHP', symbol: '₱', name: 'Philippine Peso' }, 'VN': { currency: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  'AE': { currency: 'AED', symbol: 'د.إ', name: 'UAE Dirham' }, 'SA': { currency: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  'IL': { currency: 'ILS', symbol: '₪', name: 'Israeli Shekel' }, 'PK': { currency: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  'BD': { currency: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' }, 'LK': { currency: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  'NP': { currency: 'NPR', symbol: '₨', name: 'Nepalese Rupee' }, 'KH': { currency: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  'MM': { currency: 'MMK', symbol: 'K', name: 'Burmese Kyat' }, 'LA': { currency: 'LAK', symbol: '₭', name: 'Lao Kip' },
  'BN': { currency: 'BND', symbol: 'B$', name: 'Brunei Dollar' }, 'MO': { currency: 'MOP', symbol: 'MOP$', name: 'Macanese Pataca' },
  'KZ': { currency: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' }, 'UZ': { currency: 'UZS', symbol: 'лв', name: 'Uzbekistani Som' },
  'MN': { currency: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' }, 'AF': { currency: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  'IR': { currency: 'IRR', symbol: '﷼', name: 'Iranian Rial' }, 'IQ': { currency: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
  'JO': { currency: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' }, 'LB': { currency: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
  'SY': { currency: 'SYP', symbol: '£S', name: 'Syrian Pound' }, 'YE': { currency: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
  'KW': { currency: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' }, 'QA': { currency: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
  'BH': { currency: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' }, 'OM': { currency: 'OMR', symbol: '﷼', name: 'Omani Rial' },
  'TL': { currency: 'USD', symbol: '$', name: 'US Dollar' }, 'PS': { currency: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  // Oceania
  'AU': { currency: 'AUD', symbol: 'A$', name: 'Australian Dollar' }, 'NZ': { currency: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  'FJ': { currency: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar' }, 'PG': { currency: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },
  'SB': { currency: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar' }, 'VU': { currency: 'VUV', symbol: 'Vt', name: 'Vanuatu Vatu' },
  'WS': { currency: 'WST', symbol: 'T', name: 'Samoan Tala' }, 'TO': { currency: 'TOP', symbol: 'T$', name: 'Tongan Paanga' },
  // Africa
  'ZA': { currency: 'ZAR', symbol: 'R', name: 'South African Rand' }, 'NG': { currency: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  'EG': { currency: 'EGP', symbol: 'E£', name: 'Egyptian Pound' }, 'KE': { currency: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  'GH': { currency: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' }, 'ET': { currency: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  'TZ': { currency: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' }, 'UG': { currency: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  'MA': { currency: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' }, 'DZ': { currency: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  'TN': { currency: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' }, 'LY': { currency: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  'SD': { currency: 'SDG', symbol: '£', name: 'Sudanese Pound' }, 'AO': { currency: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
  'MZ': { currency: 'MZN', symbol: 'MT', name: 'Mozambican Metical' }, 'ZW': { currency: 'ZWL', symbol: 'Z$', name: 'Zimbabwean Dollar' },
  'ZM': { currency: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' }, 'BW': { currency: 'BWP', symbol: 'P', name: 'Botswana Pula' },
  'NA': { currency: 'NAD', symbol: 'N$', name: 'Namibian Dollar' }, 'RW': { currency: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  'BI': { currency: 'BIF', symbol: 'FBu', name: 'Burundian Franc' }, 'MG': { currency: 'MGA', symbol: 'Ar', name: 'Malagasy Ariary' },
  'MW': { currency: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' }, 'SN': { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  'CI': { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' }, 'ML': { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  'BF': { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' }, 'BJ': { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  'TG': { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' }, 'NE': { currency: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  'GN': { currency: 'GNF', symbol: 'FG', name: 'Guinean Franc' }, 'SL': { currency: 'SLL', symbol: 'Le', name: 'Sierra Leonean Leone' },
  'LR': { currency: 'LRD', symbol: 'L$', name: 'Liberian Dollar' }, 'MR': { currency: 'MRU', symbol: 'UM', name: 'Mauritanian Ouguiya' },
  'GM': { currency: 'GMD', symbol: 'D', name: 'Gambian Dalasi' }, 'CV': { currency: 'CVE', symbol: '$', name: 'Cape Verdean Escudo' },
  'ST': { currency: 'STN', symbol: 'Db', name: 'Sao Tome Dobra' }, 'DJ': { currency: 'DJF', symbol: 'Fdj', name: 'Djiboutian Franc' },
  'ER': { currency: 'ERN', symbol: 'Nfk', name: 'Eritrean Nakfa' }, 'SO': { currency: 'SOS', symbol: 'Sh', name: 'Somali Shilling' },
  'KM': { currency: 'KMF', symbol: 'CF', name: 'Comorian Franc' }, 'MU': { currency: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
  'SC': { currency: 'SCR', symbol: 'SRe', name: 'Seychellois Rupee' }, 'LS': { currency: 'LSL', symbol: 'L', name: 'Lesotho Loti' },
  'SZ': { currency: 'SZL', symbol: 'L', name: 'Swazi Lilangeni' }, 'TD': { currency: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  'CF': { currency: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' }, 'CG': { currency: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  'CM': { currency: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' }, 'GA': { currency: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  'GQ': { currency: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' }, 'CD': { currency: 'CDF', symbol: 'FC', name: 'Congolese Franc' },
};

// Fallback exchange rates from USD (used only if the live API fails)
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

// Live exchange rates cache (in memory + sessionStorage)
let liveRates: Record<string, number> | null = null;
const EXCHANGERATE_API_KEY = '0e9388aa224e78afc957e2c9';
const RATES_CACHE_KEY = 'liveExchangeRates';
const RATES_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Fetch live exchange rates from the exchangerate API (cached for 1 hour)
export async function fetchLiveExchangeRates(): Promise<Record<string, number>> {
  // Return in-memory cache if available
  if (liveRates) return liveRates;

  // Check sessionStorage cache
  try {
    const cached = sessionStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      const { rates, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < RATES_CACHE_TTL) {
        liveRates = rates;
        return rates;
      }
    }
  } catch {
    // ignore parse errors
  }

  // Fetch fresh rates from API
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGERATE_API_KEY}/latest/USD`);
    const data = await response.json();
    if (data.result === 'success' && data.conversion_rates) {
      liveRates = data.conversion_rates as Record<string, number>;
      try {
        sessionStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates: liveRates, timestamp: Date.now() }));
      } catch {
        // ignore storage errors
      }
      return liveRates;
    }
  } catch (error) {
    console.error('Error fetching live exchange rates:', error);
  }

  // Fallback to static rates
  return exchangeRates;
}

// Get currency info by country code
export function getCurrencyByCountry(countryCode: string): { currency: string; symbol: string; name: string } {
  return countryCurrencyMap[countryCode] || { currency: 'USD', symbol: '$', name: 'US Dollar' };
}

// Convert USD to target currency (uses live rates if loaded, fallback to static)
export function convertFromUSD(amountUSD: number, targetCurrency: string): number {
  const rate = (liveRates && liveRates[targetCurrency]) || exchangeRates[targetCurrency] || 1;
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

// Get user's country from IP (uses HTTPS-compatible APIs since the site runs on HTTPS)
export async function getUserCountry(): Promise<string> {
  // Check cache first
  try {
    const cached = sessionStorage.getItem('userCountry_v2');
    if (cached) return cached;
  } catch {
    // ignore
  }

  // Try multiple HTTPS-compatible geolocation APIs (free, no key)
  const apis = [
    'https://ipwho.is/?fields=country_code',
    'https://ipapi.co/json/',
  ];

  for (const url of apis) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      // ipwho.is returns country_code; ipapi.co returns country_code too
      const code = data.country_code || data.countryCode;
      if (code && /^[A-Z]{2}$/.test(code)) {
        return code;
      }
    } catch {
      // try next API
    }
  }

  return 'US'; // Default to US if all APIs fail
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
