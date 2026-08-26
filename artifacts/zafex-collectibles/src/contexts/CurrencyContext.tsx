import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type CurrencyCode =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'SAR'
  | 'TRY'
  | 'CAD'
  | 'AUD'
  | 'KWD'
  | 'QAR'
  | 'OMR'
  | 'BHD'
  | 'SGD'
  | 'JPY'
  | 'CHF'
  | 'NZD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  country: string;
  rate: number; // multiplier from base INR
  format: (amountInInr: number) => string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    country: 'India',
    rate: 1.0,
    format: (inr) => `₹${Math.round(inr).toLocaleString('en-IN')}`,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    country: 'United States',
    rate: 0.012, // 1 USD ≈ 83.3 INR
    format: (inr) => `$${(inr * 0.012).toFixed(2)}`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    country: 'European Union',
    rate: 0.011, // 1 EUR ≈ 90.9 INR
    format: (inr) => `€${(inr * 0.011).toFixed(2)}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    country: 'United Kingdom',
    rate: 0.0094, // 1 GBP ≈ 106.3 INR
    format: (inr) => `£${(inr * 0.0094).toFixed(2)}`,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham (Dubai)',
    flag: '🇦🇪',
    country: 'United Arab Emirates',
    rate: 0.044, // 1 AED ≈ 22.7 INR
    format: (inr) => `AED ${(inr * 0.044).toFixed(2)}`,
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    country: 'Saudi Arabia',
    rate: 0.045, // 1 SAR ≈ 22.2 INR
    format: (inr) => `SAR ${(inr * 0.045).toFixed(2)}`,
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    flag: '🇹🇷',
    country: 'Turkey',
    rate: 0.46, // 1 TRY ≈ 2.17 INR
    format: (inr) => `₺${(inr * 0.46).toFixed(2)}`,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    country: 'Canada',
    rate: 0.016, // 1 CAD ≈ 62.5 INR
    format: (inr) => `CA$${(inr * 0.016).toFixed(2)}`,
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    country: 'Australia',
    rate: 0.018, // 1 AUD ≈ 55.5 INR
    format: (inr) => `AU$${(inr * 0.018).toFixed(2)}`,
  },
  KWD: {
    code: 'KWD',
    symbol: 'KWD',
    name: 'Kuwaiti Dinar',
    flag: '🇰🇼',
    country: 'Kuwait',
    rate: 0.0037, // 1 KWD ≈ 270 INR
    format: (inr) => `KWD ${(inr * 0.0037).toFixed(2)}`,
  },
  QAR: {
    code: 'QAR',
    symbol: 'QAR',
    name: 'Qatari Riyal',
    flag: '🇶🇦',
    country: 'Qatar',
    rate: 0.044, // 1 QAR ≈ 22.8 INR
    format: (inr) => `QAR ${(inr * 0.044).toFixed(2)}`,
  },
  OMR: {
    code: 'OMR',
    symbol: 'OMR',
    name: 'Omani Rial',
    flag: '🇴🇲',
    country: 'Oman',
    rate: 0.0046, // 1 OMR ≈ 216 INR
    format: (inr) => `OMR ${(inr * 0.0046).toFixed(2)}`,
  },
  BHD: {
    code: 'BHD',
    symbol: 'BHD',
    name: 'Bahraini Dinar',
    flag: '🇧🇭',
    country: 'Bahrain',
    rate: 0.0045, // 1 BHD ≈ 221 INR
    format: (inr) => `BHD ${(inr * 0.0045).toFixed(2)}`,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    country: 'Singapore',
    rate: 0.016, // 1 SGD ≈ 62.5 INR
    format: (inr) => `S$${(inr * 0.016).toFixed(2)}`,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    country: 'Japan',
    rate: 1.85, // 1 JPY ≈ 0.54 INR
    format: (inr) => `¥${Math.round(inr * 1.85).toLocaleString('en-US')}`,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    flag: '🇨🇭',
    country: 'Switzerland',
    rate: 0.011, // 1 CHF ≈ 95 INR
    format: (inr) => `CHF ${(inr * 0.011).toFixed(2)}`,
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    flag: '🇳🇿',
    country: 'New Zealand',
    rate: 0.020, // 1 NZD ≈ 50 INR
    format: (inr) => `NZ$${(inr * 0.020).toFixed(2)}`,
  },
};

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  SA: 'SAR', // Saudi Arabia
  AE: 'AED', // UAE / Dubai
  TR: 'TRY', // Turkey
  KW: 'KWD', // Kuwait
  QA: 'QAR', // Qatar
  OM: 'OMR', // Oman
  BH: 'BHD', // Bahrain
  SG: 'SGD', // Singapore
  JP: 'JPY', // Japan
  CH: 'CHF', // Switzerland
  NZ: 'NZD', // New Zealand
  // Europe
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  PL: 'EUR',
  SE: 'EUR',
  DK: 'EUR',
  NO: 'EUR',
  CZ: 'EUR',
  RO: 'EUR',
};

/** Fetch real-time visitor country via live IP Geo APIs */
async function fetchCountryByIp(): Promise<string | null> {
  try {
    const res = await fetch('https://ipwho.is/?fields=country_code', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.country_code) return String(data.country_code).toUpperCase();
    }
  } catch {}

  try {
    const res = await fetch('https://api.country.is/', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.country) return String(data.country).toUpperCase();
    }
  } catch {}

  try {
    const res = await fetch('https://ipapi.co/country/', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const txt = await res.text();
      if (txt && txt.trim().length === 2) return txt.trim().toUpperCase();
    }
  } catch {}

  return null;
}

/** Fallback to detect user currency based on browser timezone and locale */
function detectDefaultCurrency(): CurrencyCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return 'USD';

    if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz === 'Asia/Kolkata') {
      return 'INR';
    }
    if (tz.includes('Riyadh') || tz === 'Asia/Riyadh') {
      return 'SAR';
    }
    if (tz.includes('Dubai') || tz === 'Asia/Dubai') {
      return 'AED';
    }
    if (tz.includes('Istanbul') || tz.includes('Turkey') || tz === 'Europe/Istanbul') {
      return 'TRY';
    }
    if (tz.includes('Kuwait') || tz === 'Asia/Kuwait') {
      return 'KWD';
    }
    if (tz.includes('Qatar') || tz === 'Asia/Qatar') {
      return 'QAR';
    }
    if (tz.includes('Muscat') || tz === 'Asia/Muscat') {
      return 'OMR';
    }
    if (tz.includes('Bahrain') || tz === 'Asia/Bahrain') {
      return 'BHD';
    }
    if (tz.includes('Singapore') || tz === 'Asia/Singapore') {
      return 'SGD';
    }
    if (tz.includes('Tokyo') || tz === 'Asia/Tokyo') {
      return 'JPY';
    }
    if (tz.includes('Zurich') || tz === 'Europe/Zurich') {
      return 'CHF';
    }
    if (tz.includes('Auckland') || tz === 'Pacific/Auckland') {
      return 'NZD';
    }
    if (
      tz.startsWith('America/New_York') ||
      tz.startsWith('America/Chicago') ||
      tz.startsWith('America/Los_Angeles') ||
      tz.startsWith('America/Denver') ||
      tz.startsWith('America/Phoenix') ||
      tz.startsWith('US/')
    ) {
      return 'USD';
    }
    if (tz === 'Europe/London' || tz.includes('London')) {
      return 'GBP';
    }
    if (tz.startsWith('Europe/')) {
      return 'EUR';
    }
    if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver') || tz.startsWith('Canada/')) {
      return 'CAD';
    }
    if (tz.startsWith('Australia/')) {
      return 'AUD';
    }
    return 'USD';
  } catch {
    return 'USD';
  }
}

interface CurrencyContextType {
  currentCurrency: CurrencyConfig;
  currencyCode: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (inrAmount: number) => string;
  convertPrice: (inrAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currentCurrency: CURRENCIES.INR,
  currencyCode: 'INR',
  setCurrency: () => {},
  formatPrice: (inr) => `₹${Math.round(inr).toLocaleString('en-IN')}`,
  convertPrice: (inr) => inr,
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencyCode, setCurrencyCodeState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('zafex_currency') as CurrencyCode | null;
    if (saved && CURRENCIES[saved]) return saved;
    return detectDefaultCurrency();
  });

  // Live IP geolocation auto-detection on load
  useEffect(() => {
    fetchCountryByIp().then((countryCode) => {
      if (countryCode) {
        const detected = COUNTRY_TO_CURRENCY[countryCode] || 'USD';
        const isManuallySelected = sessionStorage.getItem('zafex_manual_currency');
        if (!isManuallySelected) {
          setCurrencyCodeState(detected);
          localStorage.setItem('zafex_currency', detected);
        }
      }
    });
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyCodeState(code);
      localStorage.setItem('zafex_currency', code);
      sessionStorage.setItem('zafex_manual_currency', 'true');
    }
  };

  const currentCurrency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  const formatPrice = useMemo(() => {
    return (inrAmount: number) => {
      if (typeof inrAmount !== 'number' || isNaN(inrAmount)) return `${currentCurrency.symbol}0`;
      return currentCurrency.format(inrAmount);
    };
  }, [currentCurrency]);

  const convertPrice = useMemo(() => {
    return (inrAmount: number) => {
      if (typeof inrAmount !== 'number' || isNaN(inrAmount)) return 0;
      return inrAmount * currentCurrency.rate;
    };
  }, [currentCurrency]);

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencyCode,
        setCurrency,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
