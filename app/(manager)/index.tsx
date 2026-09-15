import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
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

// A plain pressable field showing the current date/time as text — it never mounts a picker of
// its own. Three earlier attempts all mounted SOME kind of picker at this field's own position
// in the tree (inline "compact" control, an inline conditional <DateTimePicker>, a <Modal>
// opened from here) and every one of them broke, because this field lives inside
// AssignVisitSheet's <Sheet>, which is itself a Modal — anything with its own native
// presentation/portal semantics mounted at this depth was fighting that. So this field does
// nothing but render text and call `onOpen`; where the picker actually lives is
// AssignVisitSheet's problem now, not this component's.
function PickerField({
  label, value, mode, onOpen,
}: { label?: string; value: Date; mode: 'date' | 'time'; onOpen: () => void }) {
  const { colors, radii } = useTheme();
  // Not toLocaleDateString()/toLocaleTimeString() with no explicit locale — that "use the
  // device's default locale" resolution is unreliable on-device (Hermes can silently return
  // empty text instead of throwing). These need no Intl/ICU data at all.
  const text = mode === 'date' ? toIsoDate(value) : toHHMM(value);
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text variant="captionSemi" tone="muted">{label}</Text> : null}
      <Pressable
        onPress={onOpen}
        style={{
          borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
          padding: 12, backgroundColor: colors.card,
        }}>
        <Text>{text}</Text>
      </Pressable>
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
  // Which field's picker is currently showing — 'date' | 'time' | null. On iOS this swaps the
  // Sheet's own content over to the picker (see below); on Android it's never set at all, since
  // DateTimePickerAndroid.open() is a native dialog that needs nothing rendered for it.
  const [activeField, setActiveField] = useState<'date' | 'time' | null>(null);
  const [draft, setDraft] = useState(() => new Date());

  const reset = () => {
    setRepId('');
    setCustomerId('');
    setDate(new Date());
    setTimeEnabled(false);
    setTime(new Date());
    setError(null);
    setActiveField(null);
  };

  const openField = (field: 'date' | 'time') => {
    const current = field === 'date' ? date : time;
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: field,
        display: 'default',
        onChange: (event, d) => {
          if (event.type !== 'set' || !d) return;
          if (field === 'date') setDate(d); else setTime(d);
        },
      });
      return;
    }
    setDraft(current);
    setActiveField(field);
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
      {activeField ? (
        // Swaps the Sheet's own content for the picker instead of opening a second Modal on top
        // of it — this is the one Modal AssignVisitSheet ever has open at once, so there's no
        // nested-Modal portal conflict, and no risk of the picker's own layout misbehaving since
        // it's a direct child of the same Pressable that already renders every other field fine.
        <>
          <Text variant="h2">
            {activeField === 'date' ? t('assignVisit.dateLabel') : t('assignVisit.timeLabel')}
          </Text>
          <DateTimePicker value={draft} mode={activeField} display="spinner" onChange={(_, d) => d && setDraft(d)} />
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: spacing.sm }}>
            <Button
              variant="secondary"
              title={t('common.cancel')}
              onPress={() => setActiveField(null)}
              style={{ flex: 1 }}
            />
            <Button
              title={t('common.done')}
              onPress={() => {
                if (activeField === 'date') setDate(draft); else setTime(draft);
                setActiveField(null);
              }}
              style={{ flex: 1 }}
            />
          </View>
        </>
      ) : (
        <>
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

          <PickerField label={t('assignVisit.dateLabel')} mode="date" value={date} onOpen={() => openField('date')} />

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="captionSemi" tone="muted">{t('assignVisit.timeLabel')}</Text>
              <Pressable onPress={() => setTimeEnabled((v) => !v)} hitSlop={8}>
                <Text variant="caption" tone="primary">
                  {timeEnabled ? t('assignVisit.removeTime') : t('assignVisit.addTime')}
                </Text>
              </Pressable>
            </View>
            {timeEnabled ? <PickerField mode="time" value={time} onOpen={() => openField('time')} /> : null}
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
        </>
      )}
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
