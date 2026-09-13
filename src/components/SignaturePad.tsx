import { useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { Button } from './Button';
import { Text } from './Text';

// Minimal finger-drawn signature capture — Phase 2 proof-of-delivery. No signature-pad
// dependency: PanResponder + one react-native-svg <Path> per stroke is the whole implementation.
export function SignaturePad({ onSave }: { onSave: (svgPaths: string[]) => void }) {
  const { colors, radii, spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const [paths, setPaths] = useState<string[]>([]);
  const current = useRef('');
  const [, forceRender] = useState(0);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        forceRender((n) => n + 1);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        current.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        forceRender((n) => n + 1);
      },
      onPanResponderRelease: () => {
        setPaths((p) => [...p, current.current]);
        current.current = '';
      },
    }),
  ).current;

  const empty = paths.length === 0 && !current.current;

  return (
    <View style={{ gap: spacing.sm }}>
      <View
        {...responder.panHandlers}
        style={{
          height: 180,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
        }}>
        <Svg width="100%" height="100%">
          {paths.map((d, i) => (
            <Path key={i} d={d} stroke={colors.text} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          ))}
          {current.current ? (
            <Path d={current.current} stroke={colors.text} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          ) : null}
        </Svg>
      </View>
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: spacing.sm }}>
        <Button variant="ghost" title={t('signature.clear')} onPress={() => setPaths([])} disabled={empty} />
        <Button
          title={t('signature.save')}
          onPress={() => onSave(paths)}
          disabled={empty}
          style={{ flex: 1 }}
        />
      </View>
      {empty ? <Text variant="caption" tone="faint">{t('signature.hint')}</Text> : null}
    </View>
  );
}
