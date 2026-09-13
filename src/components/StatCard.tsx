import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function StatCard({
  label,
  value,
  icon,
  tone = 'text',
  onPress,
  selected,
}: {
  label: string;
  value: string;
  icon?: IconName;
  tone?: React.ComponentProps<typeof Text>['tone'];
  onPress?: () => void;
  selected?: boolean;
}) {
  const { colors, spacing, radii } = useTheme();
  const content = (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 2,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
        borderRadius: radii.md,
        backgroundColor: selected ? colors.primaryTint : 'transparent',
      }}>
      {icon ? <Icon name={icon} size={16} color={selected ? colors.primary : colors.textFaint} /> : null}
      <Text variant="h2" tone={selected ? 'primary' : tone}>{value}</Text>
      <Text variant="caption" tone="muted" numberOfLines={1}>{label}</Text>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : 1 })}>
      {content}
    </Pressable>
  );
}

// One elevated bar — reads as a single cohesive summary instead of three separate
// boxes competing for attention.
export function StatRow({ children }: { children: ReactNode }) {
  const { spacing } = useTheme();
  const { isRTL } = useLocale();
  return (
    <Card style={{ flexDirection: isRTL ? 'row-reverse' : 'row', padding: spacing.xs, gap: 0 }}>
      {children}
    </Card>
  );
}
