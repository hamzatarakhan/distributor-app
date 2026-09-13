import { useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, Text, type IconName } from '@/src/components';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { BadgeTone } from '@/src/theme/tokens';

const { width } = Dimensions.get('window');

const PAGES: { icon: IconName; tone: BadgeTone | 'primary'; titleKey: string; descKey: string }[] = [
  { icon: 'map', tone: 'primary', titleKey: 'onboarding.title1', descKey: 'onboarding.desc1' },
  { icon: 'cart', tone: 'warning', titleKey: 'onboarding.title2', descKey: 'onboarding.desc2' },
  { icon: 'document-text', tone: 'success', titleKey: 'onboarding.title3', descKey: 'onboarding.desc3' },
  { icon: 'checkmark-circle', tone: 'special', titleKey: 'onboarding.title4', descKey: 'onboarding.desc4' },
];

function Dot({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const { colors } = useTheme();
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(scrollX.value, input, [8, 22, 8], 'clamp'),
      opacity: interpolate(scrollX.value, input, [0.35, 1, 0.35], 'clamp'),
    };
  });
  return <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: colors.primary }, style]} />;
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { colors, spacing, radii } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const scrollX = useSharedValue(0);

  const pages = isRTL ? [...PAGES].reverse() : PAGES;
  const last = page === pages.length - 1;

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const goToPage = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  const toneColor = (tone: string) =>
    tone === 'primary' ? colors.primary
      : tone === 'success' ? colors.success
        : tone === 'warning' ? colors.warning
          : tone === 'special' ? colors.special
            : colors.info;
  const toneTint = (tone: string) =>
    tone === 'primary' ? colors.primaryTint
      : tone === 'success' ? colors.successTint
        : tone === 'warning' ? colors.warningTint
          : tone === 'special' ? colors.specialTint
            : colors.infoTint;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Pressable
        onPress={onDone}
        style={{ position: 'absolute', top: insets.top + 12, zIndex: 1, padding: 8, ...(isRTL ? { left: spacing.lg } : { right: spacing.lg }) }}>
        <Text variant="captionSemi" tone="muted">{t('onboarding.skip')}</Text>
      </Pressable>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        contentContainerStyle={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        {pages.map((p, i) => (
          <View key={i} style={{ width, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.xl }}>
            <View
              style={{
                width: 148, height: 148, borderRadius: 74,
                backgroundColor: toneTint(p.tone), alignItems: 'center', justifyContent: 'center',
              }}>
              <Icon name={p.icon} size={64} color={toneColor(p.tone)} />
            </View>
            <View style={{ gap: spacing.sm, alignItems: 'center' }}>
              <Text variant="h1" style={{ textAlign: 'center' }}>{t(p.titleKey)}</Text>
              <Text variant="body" tone="muted" style={{ textAlign: 'center' }}>{t(p.descKey)}</Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.lg, gap: spacing.xl }}>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'center', gap: 8 }}>
          {pages.map((_, i) => <Dot key={i} index={i} scrollX={scrollX} />)}
        </View>
        <Button
          title={last ? t('onboarding.getStarted') : t('onboarding.next')}
          fullWidth
          onPress={() => (last ? onDone() : goToPage(page + 1))}
        />
      </View>
    </View>
  );
}
