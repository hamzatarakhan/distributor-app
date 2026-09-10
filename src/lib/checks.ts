// Pure-logic self-checks. Run: npx tsx src/lib/checks.ts
// Not imported by the app — Metro never bundles it.
import { formatAmount, formatMoney } from './money';
import { isOverdue } from './status';

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

console.log('checks ok');
