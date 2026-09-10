import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';

export function Skeleton({ height = 16, width = '100%' as number | string, radius = 8 }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height,
        width: width as any,
        borderRadius: radius,
        backgroundColor: colors.cardAlt,
      }}
    />
  );
}

export function LoadingRows({ count = 6 }: { count?: number }) {
  const { colors, spacing, radii } = useTheme();
  return (
    <View style={{ gap: spacing.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.card,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.lg,
            gap: spacing.sm,
          }}>
          <Skeleton width="60%" />
          <Skeleton width="40%" height={12} />
        </View>
      ))}
    </View>
  );
}
