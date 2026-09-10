import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';
import { Button } from './Button';

export function errorMessage(error: unknown): string {
  if (!error) return 'Something went wrong.';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong.';
}

export function ErrorBanner({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { colors, spacing, radii } = useTheme();
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
        <Text tone="danger" variant="bodySemi">Couldn’t load</Text>
      </View>
      <Text tone="muted" variant="caption">{errorMessage(error)}</Text>
      {onRetry ? <Button variant="secondary" title="Retry" onPress={onRetry} /> : null}
    </View>
  );
}
