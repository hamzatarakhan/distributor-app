import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Text } from './Text';

export function DetailRow({
  label,
  value,
  valueNode,
}: {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
}) {
  const { spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: 6,
      }}>
      <Text variant="caption" tone="muted">{label}</Text>
      {valueNode ?? <Text variant="captionSemi" style={{ flexShrink: 1, textAlign: 'right' }}>{value}</Text>}
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
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
