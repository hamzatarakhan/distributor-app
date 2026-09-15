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

// The manager's own tab set — deliberately not a re-skin of the rep's (tabs) group. Team and
// Warehouse are real, separate screens (a manager assigns/oversees, doesn't work a van); Orders,
// Invoices and More are reused as-is from (tabs) since those were never rep-scoped to begin with
// — a manager seeing "everyone's orders" is already exactly what those screens show.
export default function ManagerTabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}>
      <Tabs.Screen name="index" options={{ headerShown: false, title: t('manager.tabTeam'), tabBarIcon: tabIcon('people'), tabBarActiveTintColor: colors.primary }} />
      <Tabs.Screen name="warehouse" options={{ title: t('manager.tabWarehouse'), tabBarIcon: tabIcon('cube'), tabBarActiveTintColor: colors.special }} />
      <Tabs.Screen name="orders" options={{ title: t('tabs.orders'), tabBarIcon: tabIcon('cart'), tabBarActiveTintColor: colors.warning }} />
      <Tabs.Screen name="invoices" options={{ title: t('tabs.invoices'), tabBarIcon: tabIcon('document-text'), tabBarActiveTintColor: colors.success }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarIcon: tabIcon('ellipsis-horizontal'), tabBarActiveTintColor: colors.info }} />
    </Tabs>
  );
}
