// lib/send/networkDetection.ts
// The network is decided here, never by the user.
// EDIT the prefix lists below with your researched codes.

import type { Network } from '@/components/send/NetworkSelector';

// Togo: first two digits of the local number
const TMONEY_PREFIXES = ['70', '71', '72', '73', '90', '91', '92', '93']; // Togocel
const FLOOZ_PREFIXES = ['78', '79', '96', '97', '98', '99']; // Moov

function detectTogoNetwork(phone: string): Network | null {
  let digits = phone.replace(/\D/g, '').replace(/^00/, '');

  // remove the country code (228), but never cut a normal 8-digit number
  if (digits.startsWith('228') && digits.length > 8) digits = digits.slice(3);

  const prefix = digits.slice(0, 2);
  if (TMONEY_PREFIXES.includes(prefix)) return 'tmoney';
  if (FLOOZ_PREFIXES.includes(prefix)) return 'flooz';
  return null;
}

export function detectNetwork(country: string | null, phone: string): Network | null {
  if (country === 'GH') return 'mtn';
  if (country === 'TG') return detectTogoNetwork(phone);
  return null;
}