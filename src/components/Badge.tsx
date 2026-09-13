import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { BadgeTone } from '@/src/theme/tokens';
import { Text } from './Text';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const { colors, radii } = useTheme();
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    success: { bg: colors.successTint, fg: colors.success },
    warning: { bg: colors.warningTint, fg: colors.warning },
    info: { bg: colors.infoTint, fg: colors.info },
    special: { bg: colors.specialTint, fg: colors.special },
    neutral: { bg: colors.cardAlt, fg: colors.textMuted },
  };
  const c = map[tone];
  // No alignSelf here on purpose: a hardcoded 'flex-start' pins the pill to the physical left
  // no matter which side its container ends up on after RTL mirroring, and fights a sibling
  // that's meant to line up with it (e.g. Money above it in a `alignItems:'flex-end'` column).
  // Every real caller already sits in a row (alignItems:'center') or such a column — let the
  // pill inherit that instead of overriding it.
  return (
    <View
      style={{
        backgroundColor: c.bg,
        borderRadius: radii.sm,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}>
      <Text variant="captionSemi" style={{ color: c.fg }}>{label}</Text>
    </View>
  );
}
