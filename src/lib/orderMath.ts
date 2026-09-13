import type { OrderLine } from '@/src/api/types';

export function lineTotal(l: Pick<OrderLine, 'qty' | 'unitPrice' | 'discountPercent'>): number {
  return l.qty * l.unitPrice * (1 - (l.discountPercent ?? 0) / 100);
}

export function orderTotal(lines: OrderLine[]): number {
  return lines.reduce((s, l) => s + lineTotal(l), 0);
}
