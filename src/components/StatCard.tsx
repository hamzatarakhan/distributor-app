import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { Card } from './Card';
import { Text } from './Text';

export function StatCard({
  label,
  value,
  tone = 'text',
}: {
  label: string;
  value: string;
  tone?: React.ComponentProps<typeof Text>['tone'];
}) {
  const { spacing } = useTheme();
  return (
    <Card style={{ flex: 1, minWidth: 140, gap: spacing.xs }}>
      <Text variant="caption" tone="muted" numberOfLines={1}>{label}</Text>
      <Text variant="h2" tone={tone}>{value}</Text>
    </Card>
  );
}

export function StatRow({ children }: { children: React.ReactNode }) {
  const { spacing } = useTheme();
  const { isRTL } = useLocale();
  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: spacing.md }}>
      {children}
    </View>
  );
}
