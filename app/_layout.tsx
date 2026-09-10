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

export const unstable_settings = { anchor: '(tabs)' };

function RootNavigator() {
  const { session, ready } = useAuth();
  const { colors, scheme } = useTheme();

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
          <Stack.Screen name="stock/[productId]" options={{ title: 'Product' }} />
          <Stack.Screen name="stock/receipts" options={{ title: 'Incoming receipts' }} />
          <Stack.Screen name="stock/receipt/[id]" options={{ title: 'Receipt' }} />
          <Stack.Screen name="deliveries/[id]" options={{ title: 'Delivery' }} />
          <Stack.Screen name="deliveries/confirm/[id]" options={{ title: 'Confirm delivery' }} />
          <Stack.Screen name="invoices/[id]" options={{ title: 'Invoice' }} />
          <Stack.Screen name="settings/theme" options={{ title: 'Appearance' }} />
          <Stack.Screen name="settings/profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="settings/about" options={{ title: 'About' }} />
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
          <ThemeProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
