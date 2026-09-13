import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ListRow, Screen, Text } from '@/src/components';
import { usePhase, type Phase } from '@/src/settings/PhaseProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function AppPhaseSettings() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { phase, setPhase } = usePhase();

  const OPTIONS: { value: Phase; label: string; hint: string }[] = [
    { value: 1, label: t('appPhase.phase1'), hint: t('appPhase.phase1Hint') },
    { value: 2, label: t('appPhase.phase2'), hint: t('appPhase.phase2Hint') },
  ];

  return (
    <Screen>
      <Text variant="caption" tone="muted">{t('appPhase.hint')}</Text>
      <View style={{ gap: spacing.md }}>
        {OPTIONS.map((o) => (
          <ListRow
            key={o.value}
            title={o.label}
            subtitle={o.hint}
            chevron={false}
            selected={phase === o.value}
            onPress={() => setPhase(o.value)}
          />
        ))}
      </View>
    </Screen>
  );
}
