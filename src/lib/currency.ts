

export function formatRate(rate: number): string {
  if (rate === 0) return '0.00';
  if (rate < 1) return rate.toFixed(4);
  if (rate < 100) return rate.toFixed(2);
  return rate.toFixed(1);
}

export function formatAmount(value: number, currencyCode: string): string {
  const decimals = currencyCode === 'XOF' ? 0 : 2;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatUpdatedAt(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
