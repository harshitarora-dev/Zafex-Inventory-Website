import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rate: number; // multiplier from base INR
  format: (amountInInr: number) => string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    rate: 1.0,
    format: (inr) => `₹${Math.round(inr).toLocaleString('en-IN')}`,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rate: 0.012, // 1 USD ≈ 83.3 INR
    format: (inr) => `$${(inr * 0.012).toFixed(2)}`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    rate: 0.011, // 1 EUR ≈ 90.9 INR
    format: (inr) => `€${(inr * 0.011).toFixed(2)}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    rate: 0.0094, // 1 GBP ≈ 106.3 INR
    format: (inr) => `£${(inr * 0.0094).toFixed(2)}`,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    rate: 0.016, // 1 CAD ≈ 62.5 INR
    format: (inr) => `CA$${(inr * 0.016).toFixed(2)}`,
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    rate: 0.018, // 1 AUD ≈ 55.5 INR
    format: (inr) => `AU$${(inr * 0.018).toFixed(2)}`,
  },
};

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  // Europe
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', PL: 'EUR',
  SE: 'EUR', DK: 'EUR', CH: 'EUR', NO: 'EUR', CZ: 'EUR', RO: 'EUR',
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
    if (tz.startsWith('America/New_York') || tz.startsWith('America/Chicago') || 
        tz.startsWith('America/Los_Angeles') || tz.startsWith('America/Denver') || 
        tz.startsWith('America/Phoenix') || tz.startsWith('US/')) {
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
