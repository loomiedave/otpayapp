import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Country {
  code: string;
  name: string;
  currency_code: string;
}

const UNKNOWN_COUNTRY: Country = { code: '', name: 'Unknown', currency_code: '—' };

export function useCountries() {
  const [countries, setCountries] = useState<Record<string, Country>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('countries')
      .select('code, name, currency_code')
      .then(({ data, error }) => {
        if (!error && data) {
          setCountries(Object.fromEntries(data.map((c) => [c.code, c])));
        }
        setLoading(false);
      });
  }, []);

  const getCountry = (code: string | null | undefined): Country =>
    (code && countries[code]) || UNKNOWN_COUNTRY;

  return { countries, getCountry, loading };
}
