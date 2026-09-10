import { Text as RNText, type TextProps } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { typography } from '@/src/theme/tokens';

type Variant = keyof typeof typography;
type Tone = 'text' | 'muted' | 'faint' | 'primary' | 'danger' | 'success' | 'onPrimary';

export function Text({
  variant = 'body',
  tone = 'text',
  style,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone }) {
  const { colors } = useTheme();
  const toneColor = {
    text: colors.text,
    muted: colors.textMuted,
    faint: colors.textFaint,
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
    onPrimary: colors.onPrimary,
  }[tone];
  return <RNText style={[typography[variant], { color: toneColor }, style]} {...rest} />;
}
