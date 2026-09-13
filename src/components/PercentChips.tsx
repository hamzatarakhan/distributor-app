import { Pressable, View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { Text } from './Text';

const OPTIONS = [0, 5, 10, 15, 20];

// Compact discount-percent picker for an order line — Phase 2. Deliberately not a full numeric
// input: a handful of common discount tiers covers the real use case with one tap.
export function PercentChips({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const { colors, radii } = useTheme();
  const { isRTL } = useLocale();
  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 4 }}>
      {OPTIONS.map((pct) => {
        const active = value === pct;
        return (
          <Pressable
            key={pct}
            onPress={() => onChange(pct)}
            style={{
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderRadius: radii.sm,
              backgroundColor: active ? colors.primary : colors.cardAlt,
            }}>
            <Text variant="caption" style={{ color: active ? colors.onPrimary : colors.textMuted }}>
              {pct}%
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
