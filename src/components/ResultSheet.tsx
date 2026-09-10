import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button } from './Button';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { Text } from './Text';

// One component for success AND failure. super-ht-design-system #3/#4.
export type ResultState = {
  kind: 'success' | 'error';
  title: string;
  description?: string;
  referenceLabel?: string;
  reference?: string;
};

export function ResultSheet({
  state,
  onPrimary,
  onCancel,
  primaryLabel,
}: {
  state: ResultState | null;
  onPrimary: () => void;
  onCancel?: () => void;
  primaryLabel?: string;
}) {
  const { colors, spacing } = useTheme();
  if (!state) return null;
  const ok = state.kind === 'success';
  const accent = ok ? colors.success : colors.danger;
  const tint = ok ? colors.successTint : colors.dangerTint;

  return (
    <Sheet visible onClose={onCancel ?? onPrimary} showClose={!!onCancel}>
      <View style={{ alignItems: 'center', gap: spacing.md, paddingTop: spacing.md }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: tint,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name={ok ? 'checkmark' : 'close'} size={34} color={accent} />
        </View>
        <Text variant="h2" style={{ textAlign: 'center' }}>{state.title}</Text>
        {state.description ? (
          <Text tone="muted" style={{ textAlign: 'center' }}>{state.description}</Text>
        ) : null}
        {state.reference ? (
          <Text tone="faint" variant="caption">
            {(state.referenceLabel ?? 'Reference') + ': '}
            <Text variant="captionSemi" tone="muted">{state.reference}</Text>
          </Text>
        ) : null}
      </View>
      <Button
        fullWidth
        title={primaryLabel ?? (ok ? 'Done' : 'Retry')}
        variant={ok ? 'primary' : 'danger'}
        onPress={onPrimary}
      />
      {!ok && onCancel ? (
        <Button fullWidth title="Cancel" variant="ghost" onPress={onCancel} />
      ) : null}
    </Sheet>
  );
}
