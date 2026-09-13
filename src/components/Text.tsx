import { Text as RNText, type TextProps } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { typography } from '@/src/theme/tokens';

type Variant = keyof typeof typography;
type Tone = 'text' | 'muted' | 'faint' | 'primary' | 'danger' | 'success' | 'warning' | 'onPrimary';

export function Text({
  variant = 'body',
  tone = 'text',
  style,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone }) {
  const { colors } = useTheme();
  const { isRTL } = useLocale();
  const toneColor = {
    text: colors.text,
    muted: colors.textMuted,
    faint: colors.textFaint,
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
    onPrimary: colors.onPrimary,
  }[tone];
  // Default alignment follows the locale (unset RN Text alignment resolves to physical left on
  // both platforms — it does not auto-detect Arabic script). A caller's own `style.textAlign`
  // (e.g. a value column deliberately kept opposite the label) still wins — it's spread last.
  return (
    <RNText
      style={[typography[variant], { color: toneColor, textAlign: isRTL ? 'right' : 'left' }, style]}
      {...rest}
    />
  );
}
