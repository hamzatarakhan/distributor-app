import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableProps,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  fullWidth,
  style,
  ...rest
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  fullWidth?: boolean;
} & Omit<PressableProps, 'style'> & { style?: any }) {
  const { colors, spacing, radii } = useTheme();
  const isDisabled = disabled || loading;

  const bg = {
    primary: colors.primary,
    danger: colors.danger,
    secondary: colors.card,
    ghost: 'transparent',
  }[variant];
  const fg =
    variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary;
  const borderColor = variant === 'secondary' ? colors.border : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderRadius: radii.pill,
          paddingVertical: 14,
          paddingHorizontal: spacing.xl,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
        },
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {icon ? <Icon name={icon} size={18} color={fg} /> : null}
          <Text variant="bodySemi" style={{ color: fg }}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
