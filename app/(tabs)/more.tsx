import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Card, ConfirmSheet, Icon, ListRow, Screen, SectionHeader, Text } from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useAuth } from '@/src/auth/AuthContext';
import { useProfile, useVisits } from '@/src/hooks/data';
import { areRemindersScheduled, cancelAllReminders, scheduleTodayReminders } from '@/src/lib/reminders';
import { usePhase } from '@/src/settings/PhaseProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function More() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { signOut, session } = useAuth();
  const profile = useProfile();
  const { phase } = usePhase();
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
          left={<Icon name="person-outline" color={colors.textMuted} />}
          onPress={() => router.push('/settings/profile')}
        />
        <ListRow
          title={t('more.appearance')}
          left={<Icon name="contrast-outline" color={colors.textMuted} />}
          onPress={() => router.push('/settings/theme')}
        />
        <ListRow
          title={t('more.language')}
          left={<Icon name="language-outline" color={colors.textMuted} />}
          onPress={() => router.push('/settings/language')}
        />
        <ListRow
          title={t('more.appPhase')}
          subtitle={phase === 1 ? t('appPhase.phase1') : t('appPhase.phase2')}
          left={<Icon name="layers-outline" color={colors.textMuted} />}
          onPress={() => router.push('/settings/phase')}
        />
        <ListRow
          title={t('more.serverConnection')}
          left={<Icon name="server-outline" color={colors.textMuted} />}
          onPress={() => router.push('/(auth)/server-config')}
        />
        <ListRow
          title={t('more.about')}
          left={<Icon name="information-circle-outline" color={colors.textMuted} />}
          onPress={() => router.push('/settings/about')}
        />
        {__DEV__ ? (
          <ListRow
            title={t('more.kitchenSinkDev')}
            left={<Icon name="flask-outline" color={colors.textMuted} />}
            onPress={() => router.push('/kitchen-sink')}
          />
        ) : null}
        <ListRow
          title={t('more.signOut')}
          chevron={false}
          left={<Icon name="log-out-outline" color={colors.danger} />}
          onPress={() => setConfirm(true)}
        />
      </View>

      {phase === 2 ? (
        <>
          <SectionHeader title={t('more.phase2Section')} />
          <View style={{ gap: spacing.md }}>
            <ListRow
              title={t('eodSummary.title')}
              left={<Icon name="stats-chart-outline" color={colors.textMuted} />}
              onPress={() => router.push('/eod-summary')}
            />
            <ListRow
              title={t('visitsMap.title')}
              left={<Icon name="map-outline" color={colors.textMuted} />}
              onPress={() => router.push('/visits-map')}
            />
            <ListRow
              title={t('syncQueue.title')}
              left={<Icon name="cloud-upload-outline" color={colors.textMuted} />}
              onPress={() => router.push('/sync-queue')}
            />
            <ListRow
              title={t('reminders.title')}
              subtitle={reminderError ?? undefined}
              chevron={false}
              left={<Icon name="notifications-outline" color={colors.textMuted} />}
              right={<Switch value={remindersOn} onValueChange={toggleReminders} />}
            />
          </View>
        </>
      ) : null}

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
