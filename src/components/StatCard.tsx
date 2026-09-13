import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { Card } from './Card';
import { Text } from './Text';

export function StatCard({
  label,
  value,
  tone = 'text',
  onPress,
  selected,
}: {
  label: string;
  value: string;
  tone?: React.ComponentProps<typeof Text>['tone'];
  onPress?: () => void;
  selected?: boolean;
}) {
  const { colors, spacing } = useTheme();
  const card = (
    <Card
      style={{
        gap: spacing.xs,
        ...(selected ? { backgroundColor: colors.primaryTint, borderColor: colors.primaryBorder, borderWidth: 0.5 } : null),
      }}>
      <Text variant="caption" tone="muted" numberOfLines={1}>{label}</Text>
      <Text variant="h2" tone={selected ? 'primary' : tone}>{value}</Text>
    </Card>
  );
  if (!onPress) return <View style={{ flex: 1, minWidth: 140 }}>{card}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, minWidth: 140, opacity: pressed ? 0.85 : 1 })}>
      {card}
    </Pressable>
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
