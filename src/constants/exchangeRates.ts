import { CurrencyCode } from './currencies';

export interface BaseRate {
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: number; // 1 unit of `base` = `rate` units of `quote`
}

/**
 * Hardcoded for now. Later this will be fetched from the database and
 * kept current by an admin dashboard — keep this shape identical to the
 * eventual DB table (base, quote, rate) so swapping the data source is a
 * one-line change in lib/currency.ts, not a rewrite of the UI.
 *
 * Only forward pairs are stored; reverse directions (e.g. NGN -> GHS) are
 * derived automatically in lib/currency.ts.
 */
export const BASE_RATES: BaseRate[] = [
  { base: 'GHS', quote: 'NGN', rate: 44.8 },
  { base: 'GHS', quote: 'XOF', rate: 105.2 },
  { base: 'NGN', quote: 'XOF', rate: 2.35 },
];

export const RATES_UPDATED_AT = '2026-07-16T09:00:00Z';
