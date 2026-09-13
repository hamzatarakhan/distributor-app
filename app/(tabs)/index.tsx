import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, Card, IconBadge, ListRow, Screen, SectionHeader, StatCard, StatRow, Text,
} from '@/src/components';
import { useProfile, useVisits } from '@/src/hooks/data';
import { visitStatusKey, visitStatusTone } from '@/src/lib/status';
import { usePhase } from '@/src/settings/PhaseProvider';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { BadgeTone } from '@/src/theme/tokens';
import type { IconName } from '@/src/components';

type StatFilter = 'all' | 'planned' | 'done';

function QuickAction({ icon, tone, label, onPress }: { icon: IconName; tone: BadgeTone; label: string; onPress: () => void }) {
  const { spacing } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, minWidth: 100, opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ alignItems: 'center', gap: spacing.xs }}>
        <IconBadge icon={icon} tone={tone} />
        <Text variant="caption" tone="muted" numberOfLines={1}>{label}</Text>
      </Card>
    </Pressable>
  );
}

export default function VisitsHome() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { phase } = usePhase();
  const profile = useProfile();
  const visits = useVisits({});
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
          <Text variant="h1">{t('home.greeting', { name: profile.data ? `, ${profile.data.name.split(' ')[0]}` : '' })}</Text>
          <Text tone="muted" variant="caption">{today}</Text>

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

          {phase === 2 ? (
            <>
              <SectionHeader title={t('home.quickTools')} />
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: spacing.md }}>
                <QuickAction icon="stats-chart-outline" tone="special" label={t('eodSummary.title')} onPress={() => router.push('/eod-summary')} />
                <QuickAction icon="map-outline" tone="success" label={t('visitsMap.title')} onPress={() => router.push('/visits-map')} />
                <QuickAction icon="cloud-upload-outline" tone="info" label={t('syncQueue.title')} onPress={() => router.push('/sync-queue')} />
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
            subtitle={`${v.scheduledTime ?? ''} · ${v.city ?? ''}`}
            right={<Badge label={t(visitStatusKey[v.status])} tone={visitStatusTone[v.status]} />}
            onPress={() => router.push(`/visits/${v.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
