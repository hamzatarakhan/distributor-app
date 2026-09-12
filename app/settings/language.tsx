import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ListRow, Screen, Text } from '@/src/components';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { Locale } from '@/src/i18n';

export default function LanguageSettings() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  const OPTIONS: { value: Locale; label: string; hint: string }[] = [
    { value: 'en', label: t('language.english'), hint: t('language.englishHint') },
    { value: 'ar', label: t('language.arabic'), hint: t('language.arabicHint') },
  ];

  return (
    <Screen>
      <Text variant="caption" tone="muted">{t('language.hint')}</Text>
      <View style={{ gap: spacing.md }}>
        {OPTIONS.map((o) => (
          <ListRow
            key={o.value}
            title={o.label}
            subtitle={o.hint}
            chevron={false}
            selected={locale === o.value}
            onPress={() => setLocale(o.value)}
          />
        ))}
      </View>
    </Screen>
  );
}
