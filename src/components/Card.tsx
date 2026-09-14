import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export function Card({ style, ...rest }: ViewProps) {
  const { colors, spacing, radii } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radii.lg,
          padding: spacing.lg,
          gap: spacing.sm,
        },
        style,
      ]}
      {...rest}
    />
  );
}
