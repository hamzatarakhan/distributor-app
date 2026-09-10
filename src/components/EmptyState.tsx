import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { Button } from './Button';

export function EmptyState({
  text,
  icon = 'file-tray-outline',
  actionLabel,
  onAction,
}: {
  text: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, padding: spacing.xl, gap: spacing.md }}>
      <Icon name={icon} size={40} color={colors.textFaint} />
      <Text tone="muted" style={{ textAlign: 'center' }}>{text}</Text>
      {actionLabel && onAction ? (
        <Button variant="secondary" title={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
