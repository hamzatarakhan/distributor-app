import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ListRow, Screen, Text } from '@/src/components';
import { useTheme, type ThemeMode } from '@/src/theme/ThemeProvider';

export default function ThemeSettings() {
  const { mode, setMode, spacing } = useTheme();
  const { t } = useTranslation();
  const OPTIONS: { mode: ThemeMode; label: string; hint: string }[] = [
    { mode: 'system', label: t('theme.system'), hint: t('theme.systemHint') },
    { mode: 'light', label: t('theme.light'), hint: t('theme.lightHint') },
    { mode: 'dark', label: t('theme.dark'), hint: t('theme.darkHint') },
  ];
  return (
    <Screen>
      <Text variant="caption" tone="muted">{t('theme.hint')}</Text>
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
