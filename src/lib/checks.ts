// Pure-logic self-checks. Run: npx tsx src/lib/checks.ts
// Not imported by the app — Metro never bundles it.
import { formatAmount, formatMoney } from './money';
import { isOverdue } from './status';
import { distanceMeters } from './geo';
import { lineTotal, orderTotal } from './orderMath';

const assert = (c: boolean, m: string) => {
  if (!c) throw new Error('FAIL: ' + m);
};

assert(formatAmount(1234567.5) === '1,234,567.50', 'thousands + decimals');
assert(formatAmount(-42) === '-42.00', 'negative');
assert(formatMoney(1500, 'SAR') === '1,500.00 SAR', 'trailing symbol');
assert(formatMoney(9.9, 'USD') === '9.90 $', 'usd trailing');

const ref = new Date('2026-09-10');
assert(isOverdue('2026-09-01', 50, ref) === true, 'past due + owing');
assert(isOverdue('2026-09-01', 0, ref) === false, 'past due but paid');
assert(isOverdue('2026-12-01', 50, ref) === false, 'not yet due');
assert(isOverdue(undefined, 50, ref) === false, 'no due date');

assert(distanceMeters(0, 0, 0, 0) === 0, 'same point is 0m');
assert(Math.abs(distanceMeters(31.9552, 35.9106, 31.9552, 35.9106) - 0) < 1, 'same coords ~0m');
assert(Math.abs(distanceMeters(0, 0, 0, 1) - 111195) < 1000, '1 degree longitude at equator ~111km');

assert(lineTotal({ qty: 2, unitPrice: 10 }) === 20, 'no discount');
assert(lineTotal({ qty: 2, unitPrice: 10, discountPercent: 10 }) === 18, '10% discount');
assert(orderTotal([{ productId: 1, product: 'a', uom: 'u', qty: 1, unitPrice: 100, discountPercent: 50 }]) === 50, 'order total applies discount');

console.log('checks ok');
