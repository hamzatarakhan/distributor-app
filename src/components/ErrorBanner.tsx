import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '@/src/i18n';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';
import { Button } from './Button';

export function errorMessage(error: unknown): string {
  if (!error) return i18n.t('common.somethingWrong');
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return i18n.t('common.somethingWrong');
}

export function ErrorBanner({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { colors, spacing, radii } = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: colors.dangerTint,
        borderColor: colors.danger,
        borderWidth: 1,
        borderRadius: radii.md,
        padding: spacing.lg,
        gap: spacing.sm,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="alert-circle-outline" size={20} color={colors.danger} />
        <Text tone="danger" variant="bodySemi">{t('common.couldNotLoad')}</Text>
      </View>
      <Text tone="muted" variant="caption">{errorMessage(error)}</Text>
      {onRetry ? <Button variant="secondary" title={t('common.retry')} onPress={onRetry} /> : null}
    </View>
  );
}
