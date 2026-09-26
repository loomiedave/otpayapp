import { CurrencyCode } from './currencies';

// XOF is shared by Togo and Benin. Since admin sets rates per-country,
// we need one representative country per currency to resolve a lookup.
// Change TG -> BJ here if Benin should be the default instead.
export const CURRENCY_TO_COUNTRY: Record<CurrencyCode, string> = {
  GHS: 'GH',
  NGN: 'NG',
  XOF: 'TG',
};
