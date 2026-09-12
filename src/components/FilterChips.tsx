import { ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Text } from './Text';

// Chip convention (solid fill when active) — distinct from ListRow's tint. design-system #1.
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors, radii, spacing, typography } = useTheme();
  // Pin an explicit height matching the pill's own content height (padding + line height +
  // border). Without it, this horizontal ScrollView inherits whatever leftover vertical space
  // the outer Screen's flexGrow:1 scroll content leaves on a short screen, and centering its
  // children (below) only hides that as padding above/below instead of removing it.
  const chipHeight = spacing.sm * 2 + typography.captionSemi.lineHeight + 2;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0, height: chipHeight }}
      contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg, alignItems: 'center' }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              backgroundColor: active ? colors.primary : colors.card,
              borderColor: active ? colors.primary : colors.border,
              borderWidth: 1,
              borderRadius: radii.pill,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
            }}>
            <Text
              variant="captionSemi"
              style={{ color: active ? colors.onPrimary : colors.textMuted }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
