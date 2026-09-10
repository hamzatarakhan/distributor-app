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
  const { colors, radii, spacing } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}>
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
