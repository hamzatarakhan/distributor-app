import { formatMoney } from '@/src/lib/money';
import { Text } from './Text';

export function Money({
  value,
  currency = 'USD',
  variant = 'bodySemi',
  tone = 'text',
  decimals = 2,
}: {
  value: number;
  currency?: string;
  variant?: React.ComponentProps<typeof Text>['variant'];
  tone?: React.ComponentProps<typeof Text>['tone'];
  decimals?: number;
}) {
  return (
    <Text variant={variant} tone={tone}>
      {formatMoney(value, currency, decimals)}
    </Text>
  );
}
