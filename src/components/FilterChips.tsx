import { ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
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
  const { isRTL } = useLocale();
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
      contentContainerStyle={{
        gap: spacing.sm,
        alignItems: 'center',
        flexDirection: isRTL ? 'row-reverse' : 'row',
        // A horizontal ScrollView anchors short content to its own physical left edge
        // regardless of flexDirection — row-reverse only reorders chips within that anchored
        // block, it doesn't move the block itself. flexGrow:1 + justifyContent lets the block
        // fill the viewport and push its content to the true reading-start edge (right in RTL)
        // when there's slack, while still scrolling normally once chips overflow it.
        flexGrow: 1,
        justifyContent: isRTL ? 'flex-end' : 'flex-start',
        ...(isRTL ? { paddingLeft: spacing.lg } : { paddingRight: spacing.lg }),
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
    </ScrollView>
  );
}
