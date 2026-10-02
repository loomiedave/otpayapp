export type CountryCode = string;

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
}

export const COUNTRIES: Record<CountryCode, Country> = {
  NG: { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  GH: { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS' },
  TG: { code: 'TG', name: 'Togo', flag: '🇹🇬', currency: 'XOF' },
  BJ: { code: 'BJ', name: 'Benin', flag: '🇧🇯', currency: 'XOF' },
};

export const ALL_COUNTRY_CODES: CountryCode[] = ['NG', 'GH', 'TG', 'BJ'];

// Countries actually usable for sending/receiving right now.
// Everything else in ALL_COUNTRY_CODES still shows in pickers,
// just greyed out with a "coming soon" label.
export const SUPPORTED_COUNTRY_CODES: CountryCode[] = ['GH', 'TG'];
