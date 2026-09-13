import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from './Button';

// design-system #10: one full-width pill CTA, label reflects live state.
// An optional secondary action shares this same bordered/card bar instead of a screen building
// its own second footer container — that's what produced a double border+padding before.
export function StickyActionBar({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  secondaryLabel,
  onSecondaryPress,
  secondaryLoading,
  secondaryVariant = 'ghost',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>['variant'];
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryLoading?: boolean;
  secondaryVariant?: React.ComponentProps<typeof Button>['variant'];
}) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
        padding: spacing.lg,
        gap: spacing.sm,
      }}>
      <Button
        title={label}
        onPress={onPress}
        loading={loading}
        disabled={disabled}
        variant={variant}
        fullWidth
      />
      {secondaryLabel && onSecondaryPress ? (
        <Button
          title={secondaryLabel}
          onPress={onSecondaryPress}
          loading={secondaryLoading}
          variant={secondaryVariant}
          fullWidth
        />
      ) : null}
    </View>
  );
}
