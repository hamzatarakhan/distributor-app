import { QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/src/auth/AuthContext';
import { queryClient } from '@/src/hooks/queryClient';
import { BrandSplash, Icon, Text, useMinDelay } from '@/src/components';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';
import { LocaleProvider } from '@/src/i18n/LocaleProvider';
import { PhaseProvider, usePhase } from '@/src/settings/PhaseProvider';
import { useIsOnline } from '@/src/lib/useOnline';
import { Onboarding } from '@/src/onboarding/Onboarding';
import { useOnboardingSeen } from '@/src/onboarding/useOnboardingSeen';
import { useTranslation } from 'react-i18next';
import '@/src/i18n';

// Shown on every pushed screen (visit/order/invoice detail, settings, etc.) — these can stack
// several levels deep from Home, and repeatedly tapping the native back arrow to get out was the
// reported pain point. One tap here always lands back on Home, regardless of how deep the stack
// currently is. Not shown on the tabs themselves (the root Stack hides its own header there —
// each tab already has its own header, and switching tabs is already a one-tap "reset").
function HomeHeaderButton() {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => router.dismissAll()} hitSlop={10} style={{ padding: 4 }}>
      <Icon name="home-outline" size={22} color={colors.text} />
    </Pressable>
  );
}

function OfflineBanner() {
  const { phase } = usePhase();
  const online = useIsOnline();
  const { colors } = useTheme();
  const { t } = useTranslation();
  if (phase !== 2 || online) return null;
  return (
    <View style={{ backgroundColor: colors.warningTint, paddingVertical: 6, alignItems: 'center' }}>
      <Text variant="captionSemi" style={{ color: colors.warning, textAlign: 'center' }}>{t('offline.banner')}</Text>
    </View>
  );
}

export const unstable_settings = { anchor: '(tabs)' };

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 400, fade: true });

// Phase 2 visit reminders are local notifications — this just controls how they present while
// the app is in the foreground. Guarded: a misbehaving notifications module on some environment
// shouldn't be able to crash the whole app over a reminder banner.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch {}

function RootNavigator() {
  const { session, ready } = useAuth();
  const { colors, scheme } = useTheme();
  const { t } = useTranslation();
  const minSplashElapsed = useMinDelay(1200);
  const { seen: onboardingSeen, markSeen } = useOnboardingSeen();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready || !minSplashElapsed || onboardingSeen === null) {
    return <BrandSplash appName={t('auth.login.title')} />;
  }

  if (!onboardingSeen) {
    return <Onboarding onDone={markSeen} />;
  }

  return (
    <>
      <OfflineBanner />
      <Stack
        screenOptions={{
          // Without this, iOS's back button falls back to the PREVIOUS screen's title — and
          // since the (tabs) group's own Stack.Screen never got an explicit title, that fallback
          // was the literal route-group folder name "(tabs)". Icon-only back buttons sidestep
          // this class of bug everywhere, not just here.
          headerBackButtonDisplayMode: 'minimal',
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerRight: HomeHeaderButton,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Protected guard={session?.role === 'rep'}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={session?.role === 'manager'}>
          <Stack.Screen name="(manager)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="stock/[productId]" options={{ title: t('tabs.stock') }} />
          <Stack.Screen name="visits/[id]" options={{ title: t('visitDetail.title') }} />
          <Stack.Screen name="orders/new" options={{ title: t('newOrder.title') }} />
          <Stack.Screen name="orders/scan" options={{ title: t('barcodeScan.title') }} />
          <Stack.Screen name="orders/[id]" options={{ title: t('orderDetail.title') }} />
          <Stack.Screen name="orders/[id]/return" options={{ title: t('createReturn.title') }} />
          <Stack.Screen name="invoices/[id]" options={{ title: t('invoiceDetail.title') }} />
          <Stack.Screen name="settings/profile" options={{ title: t('more.profile') }} />
          <Stack.Screen name="settings/about" options={{ title: t('more.about') }} />
          <Stack.Screen name="settings/phase" options={{ title: t('more.appPhase') }} />
          <Stack.Screen name="invoices/[id]/payment" options={{ title: t('recordPayment.title') }} />
          <Stack.Screen name="visits/[id]/checkin" options={{ title: t('checkIn.title') }} />
          <Stack.Screen name="eod-summary" options={{ title: t('eodSummary.title') }} />
          <Stack.Screen name="visits-map" options={{ title: t('visitsMap.title') }} />
          <Stack.Screen name="sync-queue" options={{ title: t('syncQueue.title') }} />
          <Stack.Screen name="notifications" options={{ title: t('activity.title') }} />
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
              <PhaseProvider>
                <AuthProvider>
                  <RootNavigator />
                </AuthProvider>
              </PhaseProvider>
            </ThemeProvider>
          </LocaleProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
