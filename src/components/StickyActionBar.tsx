import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from './Button';

// design-system #10: one full-width pill CTA, label reflects live state.
export function StickyActionBar({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>['variant'];
}) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
        padding: spacing.lg,
      }}>
      <Button
        title={label}
        onPress={onPress}
        loading={loading}
        disabled={disabled}
        variant={variant}
        fullWidth
      />
    </View>
  );
}
