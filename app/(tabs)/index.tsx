import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, ListRow, Screen, StatCard, StatRow, Text,
} from '@/src/components';
import { useProfile, useVisits } from '@/src/hooks/data';
import { visitStatusKey, visitStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

type StatFilter = 'all' | 'planned' | 'done';

export default function VisitsHome() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const profile = useProfile();
  const visits = useVisits({});
  const [filter, setFilter] = useState<StatFilter>('all');

  const all = [...(visits.data?.items ?? [])].sort((a, b) =>
    (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? ''),
  );
  const remaining = all.filter((v) => v.status === 'planned');
  const done = all.filter((v) => v.status === 'done');
  const items = filter === 'all' ? all : filter === 'planned' ? remaining : done;

  const toggle = (f: StatFilter) => setFilter((current) => (current === f ? 'all' : f));

  const loading = visits.isLoading;
  const refreshing = visits.isRefetching || profile.isRefetching;
  const refetchAll = () => {
    visits.refetch();
    profile.refetch();
  };

  return (
    <Screen
      header={
        <>
          <Text variant="h1">{t('home.greeting', { name: profile.data ? `, ${profile.data.name.split(' ')[0]}` : '' })}</Text>
          <Text tone="muted" variant="caption">{t('visits.subtitle')}</Text>

          <StatRow>
            <StatCard
              label={t('visits.statRemaining')}
              value={String(remaining.length)}
              onPress={() => toggle('planned')}
              selected={filter === 'planned'}
            />
            <StatCard
              label={t('visits.statDone')}
              value={String(done.length)}
              tone="success"
              onPress={() => toggle('done')}
              selected={filter === 'done'}
            />
          </StatRow>
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
