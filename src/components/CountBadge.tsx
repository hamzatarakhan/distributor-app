import { View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { Text } from './Text';

// Small red count pill, anchored to the corner of whatever it's given as a sibling — used on
// Quick Tools boxes, the notification bell, and manager stat tiles.
export function CountBadge({ count }: { count?: number }) {
  const { colors } = useTheme();
  const { isRTL } = useLocale();
  if (!count) return null;
  return (
    <View
      style={{
        position: 'absolute', top: -4, [isRTL ? 'left' : 'right']: -4,
        minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
        backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: colors.card,
      }}>
      <Text variant="caption" style={{ color: colors.onPrimary, fontSize: 10, lineHeight: 12 }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}
