import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, ListRow, Screen, StatCard, StatRow, Text,
} from '@/src/components';
import { useProfile, useVisits } from '@/src/hooks/data';
import { visitStatusKey, visitStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function VisitsHome() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const profile = useProfile();
  const visits = useVisits({});

  const items = [...(visits.data?.items ?? [])].sort((a, b) =>
    (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? ''),
  );
  const done = items.filter((v) => v.status === 'done');
  const remaining = items.filter((v) => v.status === 'planned');

  const loading = visits.isLoading;
  const refreshing = visits.isRefetching || profile.isRefetching;
  const refetchAll = () => {
    visits.refetch();
    profile.refetch();
  };

  return (
    <Screen
      onRefresh={refetchAll}
      refreshing={refreshing}
      loading={loading}
      error={visits.error}
      onRetry={refetchAll}
      empty={!loading && items.length === 0}
      emptyText={t('visits.emptyText')}>
      <Text variant="h1">{t('home.greeting', { name: profile.data ? `, ${profile.data.name.split(' ')[0]}` : '' })}</Text>
      <Text tone="muted" variant="caption">{t('visits.subtitle')}</Text>

      <StatRow>
        <StatCard label={t('visits.statRemaining')} value={String(remaining.length)} />
        <StatCard label={t('visits.statDone')} value={String(done.length)} tone="success" />
      </StatRow>

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
