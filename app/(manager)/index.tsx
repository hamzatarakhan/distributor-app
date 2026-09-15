import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Badge, Button, CountBadge, FilterChips, Icon, ListRow, Screen, SectionHeader, Sheet,
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

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toHHMM(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// A single date/time picker field. Neither platform gets a picker mounted inline in our own
// layout — that's what actually broke both times: iOS's "compact" control doesn't report its
// real size to the flex layout and rendered as a floating pill overlapping the row below it;
// Android's picker has no inline mode at all and rendering it inline produced the same kind of
// overlap. So both platforms now open the picker in its own top-level overlay, fully decoupled
// from this field's position in the Sheet: Android via the library's own imperative
// DateTimePickerAndroid.open() (a native OS dialog), iOS via a small bottom Modal with a spinner
// and a Done button (mirrors this app's own Sheet component, so it looks native to the app too).
function PickerField({
  label, value, mode, onChange,
}: { label?: string; value: Date; mode: 'date' | 'time'; onChange: (d: Date) => void }) {
  const { colors, radii, spacing } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  // Not toLocaleDateString()/toLocaleTimeString() with no explicit locale — that "use the
  // device's default locale" resolution is exactly what silently broke this field: Hermes on
  // some devices can't resolve a default locale and returns garbage/empty text instead of
  // throwing, so nothing shows. The manual pad-based formatters below (also what actually gets
  // submitted) need no Intl/ICU data at all.
  const text = mode === 'date' ? toIsoDate(value) : toHHMM(value);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value,
        mode,
        display: 'default',
        onChange: (event, d) => {
          if (event.type === 'set' && d) onChange(d);
        },
      });
      return;
    }
    setDraft(value);
    setOpen(true);
  };

  return (
    <View style={{ gap: 6, flex: 1 }}>
      {label ? <Text variant="captionSemi" tone="muted">{label}</Text> : null}
      <Pressable
        onPress={openPicker}
        style={{
          borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
          padding: 12, backgroundColor: colors.card,
        }}>
        <Text>{text}</Text>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable
            onPress={() => setOpen(false)}
            style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: radii.lg,
                borderTopRightRadius: radii.lg,
                padding: spacing.lg,
                gap: spacing.md,
              }}>
              <DateTimePicker value={draft} mode={mode} display="spinner" onChange={(_, d) => d && setDraft(d)} />
              <Button
                title={t('common.done')}
                onPress={() => {
                  onChange(draft);
                  setOpen(false);
                }}
                fullWidth
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

function AssignVisitSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const reps = useReps();
  const customers = useCustomers();
  const createVisit = useCreateVisit();
  const [repId, setRepId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(() => new Date());
  const [timeEnabled, setTimeEnabled] = useState(false);
  const [time, setTime] = useState(() => new Date());
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRepId('');
    setCustomerId('');
    setDate(new Date());
    setTimeEnabled(false);
    setTime(new Date());
    setError(null);
  };

  const submit = () => {
    if (!repId || !customerId) return;
    setError(null);
    createVisit.mutate(
      {
        repId: Number(repId),
        customerId: Number(customerId),
        date: toIsoDate(date),
        scheduledTime: timeEnabled ? toHHMM(time) : undefined,
      },
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

      <PickerField label={t('assignVisit.dateLabel')} mode="date" value={date} onChange={setDate} />

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="captionSemi" tone="muted">{t('assignVisit.timeLabel')}</Text>
          <Pressable onPress={() => setTimeEnabled((v) => !v)} hitSlop={8}>
            <Text variant="caption" tone="primary">
              {timeEnabled ? t('assignVisit.removeTime') : t('assignVisit.addTime')}
            </Text>
          </Pressable>
        </View>
        {timeEnabled ? <PickerField mode="time" value={time} onChange={setTime} /> : null}
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
