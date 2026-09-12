import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/src/auth/AuthContext';
import { queryClient } from '@/src/hooks/queryClient';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';
import { LocaleProvider } from '@/src/i18n/LocaleProvider';
import { useTranslation } from 'react-i18next';
import '@/src/i18n';

export const unstable_settings = { anchor: '(tabs)' };

function RootNavigator() {
  const { session, ready } = useAuth();
  const { colors, scheme } = useTheme();
  const { t } = useTranslation();

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="stock/[productId]" options={{ title: t('tabs.stock') }} />
          <Stack.Screen name="stock/receipts" options={{ title: t('stock.receiptsTitle') }} />
          <Stack.Screen name="stock/receipt/[id]" options={{ title: t('receiptDetail.receiptLabel') }} />
          <Stack.Screen name="deliveries/[id]" options={{ title: t('deliveryDetail.title') }} />
          <Stack.Screen name="deliveries/confirm/[id]" options={{ title: t('deliveryConfirm.confirmDelivery') }} />
          <Stack.Screen name="invoices/[id]" options={{ title: t('invoiceDetail.title') }} />
          <Stack.Screen name="settings/theme" options={{ title: t('more.appearance') }} />
          <Stack.Screen name="settings/profile" options={{ title: t('more.profile') }} />
          <Stack.Screen name="settings/language" options={{ title: t('more.language') }} />
          <Stack.Screen name="settings/about" options={{ title: t('more.about') }} />
          <Stack.Screen name="kitchen-sink" options={{ title: 'Kitchen sink' }} />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LocaleProvider>
            <ThemeProvider>
              <AuthProvider>
                <RootNavigator />
              </AuthProvider>
            </ThemeProvider>
          </LocaleProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
