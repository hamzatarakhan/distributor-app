import { View, Pressable } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { Text } from './Text';

// Chip convention (solid fill when active) — distinct from ListRow's tint. design-system #1.
//
// A plain wrapping row, not a horizontal ScrollView: every caller has 2-5 short chips that fit
// a phone width without scrolling, and a horizontal ScrollView's content anchors to its own
// physical left edge no matter what flexDirection its content asks for — row-reverse only
// reorders chips *within* that anchored block, it never moves the block itself, so short RTL
// content stayed left-ish instead of hugging the right edge. A plain row's justifyContent has
// no such quirk. If a screen ever needs enough filters to overflow, that's the time to bring
// scrolling back — not before.
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
  const { isRTL } = useLocale();
  return (
    <View
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
      }}>
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
    </View>
  );
}
