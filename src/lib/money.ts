// Currency formatting. Symbol placement is a project-wide decision: trailing.
// (super-ht-design-system #8 — pick one and never deviate.)

export const CURRENCY_POSITION: 'leading' | 'trailing' = 'trailing';

const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SAR: 'SAR',
  AED: 'AED',
  EGP: 'EGP',
  JOD: 'JOD',
};

export function formatAmount(value: number, decimals = 2): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, frac] = fixed.split('.');
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = value < 0 ? '-' : '';
  return frac ? `${sign}${withSep}.${frac}` : `${sign}${withSep}`;
}

export function formatMoney(value: number, currency = 'USD', decimals = 2): string {
  const sym = SYMBOLS[currency] ?? currency;
  const amount = formatAmount(value, decimals);
  return CURRENCY_POSITION === 'leading' ? `${sym} ${amount}` : `${amount} ${sym}`;
}
