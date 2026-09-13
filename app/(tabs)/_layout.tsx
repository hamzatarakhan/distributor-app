import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/src/components';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

function tabIcon(name: IconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Icon name={focused ? name : (`${name}-outline` as IconName)} size={22} color={color as string} />
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        // Reverses the visual order of tabs for RTL without touching route declaration order
        // (which stays fixed so `index` remains the initial tab regardless of locale).
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.visits'), tabBarIcon: tabIcon('map'), tabBarActiveTintColor: colors.primary }} />
      <Tabs.Screen name="stock" options={{ title: t('tabs.stock'), tabBarIcon: tabIcon('cube'), tabBarActiveTintColor: colors.special }} />
      <Tabs.Screen name="orders" options={{ title: t('tabs.orders'), tabBarIcon: tabIcon('cart'), tabBarActiveTintColor: colors.warning }} />
      <Tabs.Screen name="invoices" options={{ title: t('tabs.invoices'), tabBarIcon: tabIcon('document-text'), tabBarActiveTintColor: colors.success }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarIcon: tabIcon('ellipsis-horizontal'), tabBarActiveTintColor: colors.info }} />
    </Tabs>
  );
}
