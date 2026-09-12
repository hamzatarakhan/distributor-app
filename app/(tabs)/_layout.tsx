import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon, type IconName } from '@/src/components';
import { useTheme } from '@/src/theme/ThemeProvider';

function tabIcon(name: IconName) {
  return ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Icon name={focused ? name : (`${name}-outline` as IconName)} size={22} color={color as string} />
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="stock" options={{ title: t('tabs.stock'), tabBarIcon: tabIcon('cube') }} />
      <Tabs.Screen name="deliveries" options={{ title: t('tabs.deliveries'), tabBarIcon: tabIcon('car') }} />
      <Tabs.Screen name="invoices" options={{ title: t('tabs.invoices'), tabBarIcon: tabIcon('document-text') }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarIcon: tabIcon('ellipsis-horizontal') }} />
    </Tabs>
  );
}
