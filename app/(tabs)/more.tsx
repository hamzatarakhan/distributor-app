import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Card, ConfirmSheet, FilterChips, Icon, IconBadge, ListRow, Screen, Text } from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useAuth } from '@/src/auth/AuthContext';
import { useProfile, useVisits } from '@/src/hooks/data';
import { areRemindersScheduled, cancelAllReminders, scheduleTodayReminders } from '@/src/lib/reminders';
import { usePhase } from '@/src/settings/PhaseProvider';
import { useTheme, type ThemeMode } from '@/src/theme/ThemeProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import type { Locale } from '@/src/i18n';

export default function More() {
  const { colors, spacing, mode, setMode } = useTheme();
  const { t } = useTranslation();
  const { signOut, session } = useAuth();
  const profile = useProfile();
  const { phase } = usePhase();
  const { locale, setLocale, isRTL } = useLocale();
  const [confirm, setConfirm] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const visits = useVisits({ status: 'planned' });

  useEffect(() => {
    if (phase === 2) areRemindersScheduled().then(setRemindersOn).catch(() => {});
  }, [phase]);

  const toggleReminders = async (on: boolean) => {
    setReminderError(null);
    try {
      if (on) {
        await scheduleTodayReminders(visits.data?.items ?? []);
      } else {
        await cancelAllReminders();
      }
      setRemindersOn(on);
    } catch (e) {
      setReminderError(errorMessage(e));
    }
  };

  const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: t('theme.system') },
    { value: 'light', label: t('theme.light') },
    { value: 'dark', label: t('theme.dark') },
  ];
  const LANGUAGE_OPTIONS: { value: Locale; label: string }[] = [
    { value: 'en', label: t('language.english') },
    { value: 'ar', label: t('language.arabic') },
  ];

  return (
    <Screen>
      <Card>
        <Text variant="title">{profile.data?.name ?? session?.name ?? t('more.account')}</Text>
        <Text variant="caption" tone="muted">{profile.data?.email ?? session?.login}</Text>
        {profile.data?.company ? (
          <Text variant="caption" tone="faint">{profile.data.company}</Text>
        ) : null}
      </Card>

      <View style={{ gap: spacing.md }}>
        <ListRow
          title={t('more.profile')}
          left={<IconBadge icon="person-outline" tone="info" />}
          onPress={() => router.push('/settings/profile')}
        />
        {session?.role === 'manager' ? (
          <ListRow
            title={t('manager.myTeam')}
            left={<IconBadge icon="people-outline" tone="special" />}
            onPress={() => router.push('/team')}
          />
        ) : null}
      </View>

      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.sm }}>
          <IconBadge icon="contrast-outline" tone="special" />
          <Text variant="captionSemi">{t('more.appearance')}</Text>
        </View>
        <FilterChips options={THEME_OPTIONS} value={mode} onChange={setMode} />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.sm }}>
          <IconBadge icon="language-outline" tone="special" />
          <Text variant="captionSemi">{t('more.language')}</Text>
        </View>
        <FilterChips options={LANGUAGE_OPTIONS} value={locale} onChange={setLocale} />
      </Card>

      <View style={{ gap: spacing.md }}>
        <ListRow
          title={t('more.appPhase')}
          subtitle={phase === 1 ? t('appPhase.phase1') : t('appPhase.phase2')}
          left={<IconBadge icon="layers-outline" tone="warning" />}
          onPress={() => router.push('/settings/phase')}
        />
        {phase === 2 ? (
          <ListRow
            title={t('reminders.title')}
            subtitle={reminderError ?? undefined}
            chevron={false}
            left={<IconBadge icon="notifications-outline" tone="warning" />}
            right={<Switch value={remindersOn} onValueChange={toggleReminders} />}
          />
        ) : null}
        <ListRow
          title={t('more.serverConnection')}
          left={<IconBadge icon="server-outline" tone="info" />}
          onPress={() => router.push('/(auth)/server-config')}
        />
        <ListRow
          title={t('more.about')}
          left={<IconBadge icon="information-circle-outline" tone="success" />}
          onPress={() => router.push('/settings/about')}
        />
        {__DEV__ ? (
          <>
            <ListRow
              title={t('more.kitchenSinkDev')}
              left={<IconBadge icon="flask-outline" tone="special" />}
              onPress={() => router.push('/kitchen-sink')}
            />
            <ListRow
              title="Replay onboarding (dev)"
              chevron={false}
              left={<IconBadge icon="play-outline" tone="warning" />}
              onPress={async () => {
                await AsyncStorage.removeItem('onboarding.seen.v1');
                // DevSettings.reload() races Expo Go's native-module re-registration (throws
                // "Cannot find native module 'ExpoAsset'") — a manual reload sidesteps it
                // entirely and is the same gesture used for every other change in this app.
                Alert.alert('Cleared', 'Reload the app now (shake device → Reload, or press r in the terminal) to see onboarding again.');
              }}
            />
          </>
        ) : null}
        <ListRow
          title={t('more.signOut')}
          chevron={false}
          left={<Icon name="log-out-outline" color={colors.danger} />}
          onPress={() => setConfirm(true)}
        />
      </View>

      <Text variant="caption" tone="faint" style={{ textAlign: 'center' }}>
        v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>

      <ConfirmSheet
        visible={confirm}
        title={t('more.signOutConfirmTitle')}
        description={t('more.signOutConfirmDescription')}
        confirmLabel={t('more.signOut')}
        destructive
        onConfirm={() => {
          setConfirm(false);
          signOut();
        }}
        onCancel={() => setConfirm(false)}
      />
    </Screen>
  );
}
