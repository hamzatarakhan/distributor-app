import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { BadgeTone } from '@/src/theme/tokens';
import { Icon, type IconName } from './Icon';

// Colored icon chip (tinted square, tone-matched icon) — same tone vocabulary as
// Badge, reused here instead of a flat gray icon so list rows read as more than text.
export function IconBadge({ icon, tone = 'neutral' }: { icon: IconName; tone?: BadgeTone }) {
  const { colors, radii } = useTheme();
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    success: { bg: colors.successTint, fg: colors.success },
    warning: { bg: colors.warningTint, fg: colors.warning },
    info: { bg: colors.infoTint, fg: colors.info },
    special: { bg: colors.specialTint, fg: colors.special },
    neutral: { bg: colors.cardAlt, fg: colors.textMuted },
  };
  const c = map[tone];
  return (
    <View
      style={{
        width: 34, height: 34, borderRadius: radii.sm,
        backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center',
      }}>
      <Icon name={icon} size={18} color={c.fg} />
    </View>
  );
}
