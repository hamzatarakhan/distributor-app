import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { Icon } from './Icon';
import { Text } from './Text';

// Selected-state convention from super-ht-design-system #1.
export function ListRow({
  title,
  subtitle,
  right,
  left,
  selected,
  onPress,
  chevron = true,
}: {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  left?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  chevron?: boolean;
}) {
  const { colors, spacing, radii } = useTheme();
  const { isRTL } = useLocale();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? colors.primaryTint : colors.card,
        borderColor: selected ? colors.primaryBorder : colors.border,
        borderWidth: selected ? 0.5 : 1,
        borderRadius: radii.md,
        padding: spacing.lg,
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: spacing.md,
        opacity: pressed && onPress ? 0.9 : 1,
      })}>
      {left}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="title" tone={selected ? 'primary' : 'text'} numberOfLines={1}>
          {title}
        </Text>
        {typeof subtitle === 'string' ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>{subtitle}</Text>
        ) : (
          subtitle
        )}
      </View>
      {right}
      {chevron && onPress ? (
        <Icon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textFaint} />
      ) : null}
    </Pressable>
  );
}
