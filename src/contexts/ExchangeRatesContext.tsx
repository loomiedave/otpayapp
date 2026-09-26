// contexts/ExchangeRatesContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { CountryCode } from '@/constants/countries';

export interface DirectionalRate {
  from: CountryCode;
  to: CountryCode;
  rate: number;
  fee: number;
  is_active: boolean;
  updated_at: string;
}

interface ExchangeRatesContextValue {
  rates: DirectionalRate[];
  loading: boolean;
}

const ExchangeRatesContext = createContext<ExchangeRatesContextValue | undefined>(undefined);

export function ExchangeRatesProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<DirectionalRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('from_country, to_country, rate, fee, is_active, updated_at');

      if (!isMounted) return;
      if (!error && data) {
        setRates(
          data.map((r) => ({
            from: r.from_country as CountryCode,
            to: r.to_country as CountryCode,
            rate: r.rate,
            fee: r.fee,
            is_active: r.is_active,
            updated_at: r.updated_at,
          }))
        );
      }
      setLoading(false);
    };

    load();

    // Safe to hardcode this name now — there's exactly one subscriber for
    // the whole app, so there's no collision risk anymore.
    const channel = supabase
      .channel('exchange_rates_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exchange_rates' }, load)
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <ExchangeRatesContext.Provider value={{ rates, loading }}>
      {children}
    </ExchangeRatesContext.Provider>
  );
}

export function useExchangeRates(): ExchangeRatesContextValue {
  const ctx = useContext(ExchangeRatesContext);
  if (!ctx) {
    throw new Error('useExchangeRates must be used within an ExchangeRatesProvider');
  }
  return ctx;
}
