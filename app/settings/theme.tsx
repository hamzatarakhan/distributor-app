import { View } from 'react-native';
import { ListRow, Screen, Text } from '@/src/components';
import { useTheme, type ThemeMode } from '@/src/theme/ThemeProvider';

const OPTIONS: { mode: ThemeMode; label: string; hint: string }[] = [
  { mode: 'system', label: 'System', hint: 'Match the device setting' },
  { mode: 'light', label: 'Light', hint: 'Always light' },
  { mode: 'dark', label: 'Dark', hint: 'Always dark' },
];

export default function ThemeSettings() {
  const { mode, setMode, spacing } = useTheme();
  return (
    <Screen>
      <Text variant="caption" tone="muted">Applies immediately and is remembered on this device.</Text>
      <View style={{ gap: spacing.md }}>
        {OPTIONS.map((o) => (
          <ListRow
            key={o.mode}
            title={o.label}
            subtitle={o.hint}
            chevron={false}
            selected={mode === o.mode}
            onPress={() => setMode(o.mode)}
          />
        ))}
      </View>
    </Screen>
  );
}
