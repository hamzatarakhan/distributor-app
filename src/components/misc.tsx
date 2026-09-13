import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import type { BadgeTone } from '@/src/theme/tokens';
import { IconBadge } from './IconBadge';
import type { IconName } from './Icon';
import { Text } from './Text';

export function DetailRow({
  label,
  value,
  valueNode,
  icon,
  iconTone = 'neutral',
}: {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
  icon?: IconName;
  iconTone?: BadgeTone;
}) {
  const { spacing } = useTheme();
  const { isRTL } = useLocale();
  return (
    <View
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: 6,
      }}>
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.sm }}>
        {icon ? <IconBadge icon={icon} tone={iconTone} /> : null}
        <Text variant="caption" tone="muted">{label}</Text>
      </View>
      {valueNode ?? <Text variant="captionSemi" style={{ flexShrink: 1, textAlign: isRTL ? 'left' : 'right' }}>{value}</Text>}
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  const { isRTL } = useLocale();
  return (
    <View
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
      }}>
      <Text variant="h2">{title}</Text>
      {action}
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />;
}
