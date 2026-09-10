import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/src/components';
import { useTheme } from '@/src/theme/ThemeProvider';

function tabIcon(name: IconName) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon name={focused ? name : (`${name}-outline` as IconName)} size={22} color={color} />
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="stock" options={{ title: 'Stock', tabBarIcon: tabIcon('cube') }} />
      <Tabs.Screen name="deliveries" options={{ title: 'Deliveries', tabBarIcon: tabIcon('car') }} />
      <Tabs.Screen name="invoices" options={{ title: 'Invoices', tabBarIcon: tabIcon('document-text') }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: tabIcon('ellipsis-horizontal') }} />
    </Tabs>
  );
}
