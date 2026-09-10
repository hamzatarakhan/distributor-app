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
    special: { bg: 'rgba(139,92,246,0.15)', fg: '#8B5CF6' },
    neutral: { bg: colors.cardAlt, fg: colors.textMuted },
  };
  const c = map[tone];
  return (
    <View
      style={{
        backgroundColor: c.bg,
        borderRadius: radii.sm,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}>
      <Text variant="captionSemi" style={{ color: c.fg }}>{label}</Text>
    </View>
  );
}
