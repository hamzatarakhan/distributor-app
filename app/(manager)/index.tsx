import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Badge, Button, Card, CountBadge, FilterChips, Icon, ListRow, Screen, SectionHeader, Sheet,
  StatCard, StatRow, Text,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import {
  useActivityLog, useCreateVisit, useCustomers, useProfile, useReps, useVisits,
} from '@/src/hooks/data';
import { visitStatusKey, visitStatusTone } from '@/src/lib/status';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { Customer } from '@/src/api/types';

type StatFilter = 'all' | 'planned' | 'done';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function AssignVisitSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, radii, spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const reps = useReps();
  const customers = useCustomers();
  const createVisit = useCreateVisit();
  const [repId, setRepId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRepId('');
    setCustomerId('');
    setDate(todayIso());
    setTime('');
    setError(null);
  };

  const submit = () => {
    if (!repId || !customerId) return;
    setError(null);
    createVisit.mutate(
      { repId: Number(repId), customerId: Number(customerId), date, scheduledTime: time || undefined },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (e) => setError(errorMessage(e)),
      },
    );
  };

  const field = (label: string, value: string, onChange: (v: string) => void, placeholder: string) => (
    <View style={{ gap: 6, flex: 1 }}>
      <Text variant="captionSemi" tone="muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        style={{
          borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
          padding: 12, fontSize: 15, color: colors.text, backgroundColor: colors.card,
        }}
      />
    </View>
  );

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

      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12 }}>
        {field(t('assignVisit.dateLabel'), date, setDate, '2026-09-15')}
        {field(t('assignVisit.timeLabel'), time, setTime, '14:00')}
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

export default function ManagerTeam() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const visits = useVisits({});
  const activityLog = useActivityLog();
  const unreadCount = (activityLog.data ?? []).filter((i) => !i.read).length;
  const [filter, setFilter] = useState<StatFilter>('all');
  const [assignOpen, setAssignOpen] = useState(false);

  const today = todayIso();
  const allSorted = [...(visits.data?.items ?? [])].sort((a, b) =>
    `${a.date ?? ''}${a.scheduledTime ?? ''}`.localeCompare(`${b.date ?? ''}${b.scheduledTime ?? ''}`),
  );
  const todays = allSorted.filter((v) => (v.date ?? today) === today);
  const remaining = todays.filter((v) => v.status === 'planned');
  const done = todays.filter((v) => v.status === 'done');
  const items = filter === 'all' ? allSorted : filter === 'planned' ? allSorted.filter((v) => v.status === 'planned') : allSorted.filter((v) => v.status === 'done');

  const loading = visits.isLoading;
  const refreshing = visits.isRefetching || profile.isRefetching;
  const refetchAll = () => {
    visits.refetch();
    profile.refetch();
    activityLog.refetch();
  };

  const todayLabel = new Date().toLocaleDateString(isRTL ? 'ar' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const filterLabels: Record<StatFilter, string> = {
    all: t('visits.statAll'), planned: t('visits.statRemaining'), done: t('visits.statDone'),
  };

  return (
    <>
      <Screen
        header={
          <>
            <View style={{ paddingTop: insets.top, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text variant="h1">{t('home.greeting', { name: profile.data ? `, ${profile.data.name.split(' ')[0]}` : '' })}</Text>
                <Text tone="muted" variant="caption">{t('manager.teamSubtitle', { date: todayLabel })}</Text>
              </View>
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
            </View>

            <StatRow>
              <StatCard
                icon="calendar-outline"
                label={t('manager.statToday')}
                value={String(todays.length)}
              />
              <StatCard
                icon="time-outline"
                label={t('visits.statRemaining')}
                value={String(remaining.length)}
                tone="warning"
              />
              <StatCard
                icon="checkmark-circle-outline"
                label={t('visits.statDone')}
                value={String(done.length)}
                tone="success"
              />
            </StatRow>

            <Button
              icon="person-add-outline"
              title={t('assignVisit.title')}
              onPress={() => setAssignOpen(true)}
              fullWidth
            />

            <SectionHeader title={t('manager.scheduleTitle')} />
            <FilterChips
              options={[
                { value: 'all', label: filterLabels.all },
                { value: 'planned', label: filterLabels.planned },
                { value: 'done', label: filterLabels.done },
              ]}
              value={filter}
              onChange={setFilter}
            />
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
              subtitle={`${v.date ?? ''} ${v.scheduledTime ?? ''} · ${v.repName ?? '—'}`}
              right={<Badge label={t(visitStatusKey[v.status])} tone={visitStatusTone[v.status]} />}
              onPress={() => router.push(`/visits/${v.id}`)}
            />
          ))}
        </View>
      </Screen>

      <AssignVisitSheet visible={assignOpen} onClose={() => setAssignOpen(false)} />
    </>
  );
}
