export type CurrencyCode = 'GHS' | 'NGN' | 'XOF';

export interface Currency {
  code: CurrencyCode;
  name: string;
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  NGN: { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
  XOF: { code: 'XOF', name: 'CFA Franc', flag: '🇹🇬' },
};
