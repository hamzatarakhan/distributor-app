import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Icon } from './Icon';

export function QtyStepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const { colors, radii, spacing } = useTheme();
  const clamp = (n: number) => {
    let x = isNaN(n) ? min : n;
    if (x < min) x = min;
    if (max != null && x > max) x = max;
    return x;
  };
  const btn = (name: 'remove' | 'add', delta: number) => (
    <Pressable
      onPress={() => onChange(clamp(value + delta))}
      hitSlop={8}
      style={{
        width: 34,
        height: 34,
        borderRadius: radii.sm,
        backgroundColor: colors.cardAlt,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icon name={name} size={18} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      {btn('remove', -step)}
      <TextInput
        value={String(value)}
        onChangeText={(t) => onChange(clamp(parseFloat(t.replace(',', '.'))))}
        keyboardType="decimal-pad"
        selectTextOnFocus
        style={{
          minWidth: 48,
          textAlign: 'center',
          color: colors.text,
          fontSize: 16,
          fontWeight: '600',
          paddingVertical: 6,
        }}
      />
      {btn('add', step)}
    </View>
  );
}
