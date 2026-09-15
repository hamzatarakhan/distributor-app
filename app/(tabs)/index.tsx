import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Badge, Button, Card, FilterChips, Icon, IconBadge, ListRow, Screen, SectionHeader, Sheet,
  StatCard, StatRow, Text,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import {
  useActivityLog, useCreateVisit, useCustomers, useOfflineQueueCount, useProfile, useReps, useVisits,
} from '@/src/hooks/data';
import { visitStatusKey, visitStatusTone } from '@/src/lib/status';
import { usePhase } from '@/src/settings/PhaseProvider';
import { useAuth } from '@/src/auth/AuthContext';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { BadgeTone } from '@/src/theme/tokens';
import type { Customer } from '@/src/api/types';
import type { IconName } from '@/src/components';

type StatFilter = 'all' | 'planned' | 'done';

// Small red count pill, anchored to the corner of whatever it's given as a sibling — used on
// both the Quick Tools boxes and the notification bell.
function CountBadge({ count }: { count?: number }) {
  const { colors } = useTheme();
  const { isRTL } = useLocale();
  if (!count) return null;
  return (
    <View
      style={{
        position: 'absolute', top: -4, [isRTL ? 'left' : 'right']: -4,
        minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
        backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: colors.card,
      }}>
      <Text variant="caption" style={{ color: colors.onPrimary, fontSize: 10, lineHeight: 12 }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

function AssignVisitSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, radii, spacing } = useTheme();
  const { t } = useTranslation();
  const reps = useReps();
  const customers = useCustomers();
  const createVisit = useCreateVisit();
  const [repId, setRepId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRepId('');
    setCustomerId('');
    setTime('');
    setError(null);
  };

  const submit = () => {
    if (!repId || !customerId) return;
    setError(null);
    createVisit.mutate(
      { repId: Number(repId), customerId: Number(customerId), scheduledTime: time || undefined },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (e) => setError(errorMessage(e)),
      },
    );
  };

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}>
      <Text variant="h2">{t('assignVisit.title')}</Text>

      <View style={{ gap: 6 }}>
        <Text variant="captionSemi" tone="muted">{t('assignVisit.repLabel')}</Text>
        <FilterChips
          options={(reps.data?.items ?? []).map((r) => ({ value: String(r.id), label: r.name }))}
          value={repId}
          onChange={setRepId}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text variant="captionSemi" tone="muted">{t('assignVisit.customerLabel')}</Text>
        <FilterChips
          options={(customers.data?.items ?? []).map((c: Customer) => ({ value: String(c.id), label: c.name }))}
          value={customerId}
          onChange={setCustomerId}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text variant="captionSemi" tone="muted">{t('assignVisit.timeLabel')}</Text>
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="14:00"
          placeholderTextColor={colors.textFaint}
          style={{
            borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
            padding: 12, fontSize: 15, color: colors.text, backgroundColor: colors.card,
          }}
        />
      </View>

      {error ? <Text tone="danger" variant="caption">{error}</Text> : null}

      <Button
        title={t('assignVisit.submit')}
        onPress={submit}
        loading={createVisit.isPending}
        disabled={!repId || !customerId}
        fullWidth
        style={{ marginTop: spacing.sm }}
      />
    </Sheet>
  );
}

function QuickAction({
  icon, tone, label, badge, onPress,
}: { icon: IconName; tone: BadgeTone; label: string; badge?: number; onPress: () => void }) {
  const { spacing } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, minWidth: 100, opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ alignItems: 'center', gap: spacing.xs }}>
        <View>
          <IconBadge icon={icon} tone={tone} />
          <CountBadge count={badge} />
        </View>
        <Text variant="caption" tone="muted" numberOfLines={1}>{label}</Text>
      </Card>
    </Pressable>
  );
}

export default function VisitsHome() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { phase } = usePhase();
  const { session } = useAuth();
  const isManager = session?.role === 'manager';
  const [assignOpen, setAssignOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const visits = useVisits({});
  const offlineQueue = useOfflineQueueCount();
  const activityLog = useActivityLog();
  const unreadCount = (activityLog.data ?? []).filter((i) => !i.read).length;
  const [filter, setFilter] = useState<StatFilter>('all');

  const all = [...(visits.data?.items ?? [])].sort((a, b) =>
    (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? ''),
  );
  const remaining = all.filter((v) => v.status === 'planned');
  const done = all.filter((v) => v.status === 'done');
  const items = filter === 'all' ? all : filter === 'planned' ? remaining : done;

  // 'all' has no meaningful "off" state to toggle back to — only planned/done do.
  const toggle = (f: StatFilter) => setFilter((current) => (f === 'all' ? 'all' : current === f ? 'all' : f));

  const loading = visits.isLoading;
  const refreshing = visits.isRefetching || profile.isRefetching;
  const refetchAll = () => {
    visits.refetch();
    profile.refetch();
    offlineQueue.refetch();
    activityLog.refetch();
  };

  const today = new Date().toLocaleDateString(isRTL ? 'ar' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const filterLabels: Record<StatFilter, string> = {
    all: t('visits.statAll'), planned: t('visits.statRemaining'), done: t('visits.statDone'),
  };

  return (
    <Screen
      header={
        <>
          <View style={{ paddingTop: insets.top, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text variant="h1">{t('home.greeting', { name: profile.data ? `, ${profile.data.name.split(' ')[0]}` : '' })}</Text>
              <Text tone="muted" variant="caption">{today}</Text>
            </View>
            {phase === 2 ? (
              <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
                <View>
                  <View
                    style={{
                      width: 40, height: 40, borderRadius: 20,
                      backgroundColor: colors.primaryTint,
                      borderWidth: 1, borderColor: colors.primaryBorder,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                    <Icon name="notifications-outline" size={20} color={colors.primary} />
                  </View>
                  <CountBadge count={unreadCount} />
                </View>
              </Pressable>
            ) : null}
          </View>

          <StatRow>
            <StatCard
              icon="calendar-outline"
              label={t('visits.statAll')}
              value={String(all.length)}
              onPress={() => toggle('all')}
              selected={filter === 'all'}
            />
            <StatCard
              icon="time-outline"
              label={t('visits.statRemaining')}
              value={String(remaining.length)}
              tone="warning"
              onPress={() => toggle('planned')}
              selected={filter === 'planned'}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label={t('visits.statDone')}
              value={String(done.length)}
              tone="success"
              onPress={() => toggle('done')}
              selected={filter === 'done'}
            />
          </StatRow>

          {isManager ? (
            <Button
              icon="person-add-outline"
              title={t('assignVisit.title')}
              onPress={() => setAssignOpen(true)}
              fullWidth
            />
          ) : null}

          {phase === 2 ? (
            <>
              <SectionHeader title={t('home.quickTools')} />
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <QuickAction icon="stats-chart-outline" tone="special" label={t('eodSummary.title')} onPress={() => router.push('/eod-summary')} />
                <QuickAction icon="map-outline" tone="success" label={t('visitsMap.title')} badge={remaining.length} onPress={() => router.push('/visits-map')} />
                <QuickAction icon="cloud-upload-outline" tone="info" label={t('syncQueue.title')} badge={offlineQueue.data} onPress={() => router.push('/sync-queue')} />
              </View>
            </>
          ) : null}

          <SectionHeader title={`${t('visits.subtitle')} · ${filterLabels[filter]}`} />
        </>
      }
      onRefresh={refetchAll}
      refreshing={refreshing}
      loading={loading}
      error={visits.error}
      onRetry={refetchAll}
      empty={!loading && items.length === 0}
      emptyText={t('visits.emptyText')}>
      <View style={{ gap: spacing.md }}>
        {items.map((v) => (
          <ListRow
            key={v.id}
            title={v.customerName}
            subtitle={
              isManager
                ? `${v.scheduledTime ?? ''} · ${v.repName ?? '—'}`
                : `${v.scheduledTime ?? ''} · ${v.city ?? ''}`
            }
            right={<Badge label={t(visitStatusKey[v.status])} tone={visitStatusTone[v.status]} />}
            onPress={() => router.push(`/visits/${v.id}`)}
          />
        ))}
      </View>
      <AssignVisitSheet visible={assignOpen} onClose={() => setAssignOpen(false)} />
    </Screen>
  );
}
