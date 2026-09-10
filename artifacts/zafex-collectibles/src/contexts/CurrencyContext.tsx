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
  rate: number; // multiplier from base USD (1.0 = USD)
  format: (amountInUsd: number) => string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    country: 'United States',
    rate: 1.0,
    format: (usd) => `$${Number(usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    country: 'India',
    rate: 84.0, // 1 USD ≈ 84 INR
    format: (usd) => `₹${Math.round(usd * 84).toLocaleString('en-IN')}`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    country: 'European Union',
    rate: 0.92, // 1 USD ≈ 0.92 EUR
    format: (usd) => `€${(usd * 0.92).toFixed(2)}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    country: 'United Kingdom',
    rate: 0.78, // 1 USD ≈ 0.78 GBP
    format: (usd) => `£${(usd * 0.78).toFixed(2)}`,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham (Dubai)',
    flag: '🇦🇪',
    country: 'United Arab Emirates',
    rate: 3.67, // 1 USD ≈ 3.67 AED
    format: (usd) => `AED ${(usd * 3.67).toFixed(2)}`,
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    country: 'Saudi Arabia',
    rate: 3.75, // 1 USD ≈ 3.75 SAR
    format: (usd) => `SAR ${(usd * 3.75).toFixed(2)}`,
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    flag: '🇹🇷',
    country: 'Turkey',
    rate: 34.0, // 1 USD ≈ 34 TRY
    format: (usd) => `₺${(usd * 34).toFixed(2)}`,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    country: 'Canada',
    rate: 1.36, // 1 USD ≈ 1.36 CAD
    format: (usd) => `CA$${(usd * 1.36).toFixed(2)}`,
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    country: 'Australia',
    rate: 1.52, // 1 USD ≈ 1.52 AUD
    format: (usd) => `AU$${(usd * 1.52).toFixed(2)}`,
  },
  KWD: {
    code: 'KWD',
    symbol: 'KWD',
    name: 'Kuwaiti Dinar',
    flag: '🇰🇼',
    country: 'Kuwait',
    rate: 0.31, // 1 USD ≈ 0.31 KWD
    format: (usd) => `KWD ${(usd * 0.31).toFixed(3)}`,
  },
  QAR: {
    code: 'QAR',
    symbol: 'QAR',
    name: 'Qatari Riyal',
    flag: '🇶🇦',
    country: 'Qatar',
    rate: 3.64, // 1 USD ≈ 3.64 QAR
    format: (usd) => `QAR ${(usd * 3.64).toFixed(2)}`,
  },
  OMR: {
    code: 'OMR',
    symbol: 'OMR',
    name: 'Omani Rial',
    flag: '🇴🇲',
    country: 'Oman',
    rate: 0.38, // 1 USD ≈ 0.38 OMR
    format: (usd) => `OMR ${(usd * 0.38).toFixed(3)}`,
  },
  BHD: {
    code: 'BHD',
    symbol: 'BHD',
    name: 'Bahraini Dinar',
    flag: '🇧🇭',
    country: 'Bahrain',
    rate: 0.38, // 1 USD ≈ 0.38 BHD
    format: (usd) => `BHD ${(usd * 0.38).toFixed(3)}`,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    country: 'Singapore',
    rate: 1.34, // 1 USD ≈ 1.34 SGD
    format: (usd) => `S$${(usd * 1.34).toFixed(2)}`,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    country: 'Japan',
    rate: 154.0, // 1 USD ≈ 154 JPY
    format: (usd) => `¥${Math.round(usd * 154).toLocaleString('en-US')}`,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    flag: '🇨🇭',
    country: 'Switzerland',
    rate: 0.88, // 1 USD ≈ 0.88 CHF
    format: (usd) => `CHF ${(usd * 0.88).toFixed(2)}`,
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    flag: '🇳🇿',
    country: 'New Zealand',
    rate: 1.64, // 1 USD ≈ 1.64 NZD
    format: (usd) => `NZ$${(usd * 1.64).toFixed(2)}`,
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
  formatPrice: (usdAmount: number) => string;
  convertPrice: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currentCurrency: CURRENCIES.USD,
  currencyCode: 'USD',
  setCurrency: () => {},
  formatPrice: (usd) => `$${Number(usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  convertPrice: (usd) => usd,
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
