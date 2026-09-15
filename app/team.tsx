import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconBadge, ListRow, Screen } from '@/src/components';
import { useReps, useVisits } from '@/src/hooks/data';
import { useTheme } from '@/src/theme/ThemeProvider';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// The manager's team roster — who reports to them. A flat list (not tiles on Home, which broke
// down past a couple of reps): scales the same whether there are 2 reps or 50. Tap one to see
// their detail page.
export default function Team() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const reps = useReps();
  const visits = useVisits({});
  const items = reps.data?.items ?? [];
  const today = todayIso();

  const repStats = (repId: number) => {
    const mine = (visits.data?.items ?? []).filter((v) => v.repId === repId && (v.date ?? today) === today);
    return { total: mine.length, done: mine.filter((v) => v.status === 'done').length };
  };

  return (
    <Screen
      onRefresh={() => {
        reps.refetch();
        visits.refetch();
      }}
      refreshing={reps.isRefetching || visits.isRefetching}
      loading={reps.isLoading}
      error={reps.error}
      onRetry={reps.refetch}
      empty={!reps.isLoading && items.length === 0}
      emptyText={t('common.nothingHereYet')}>
      <View style={{ gap: spacing.md }}>
        {items.map((rep) => {
          const stats = repStats(rep.id);
          return (
            <ListRow
              key={rep.id}
              title={rep.name}
              subtitle={t('manager.repToday', { done: stats.done, total: stats.total })}
              left={<IconBadge icon="person-outline" tone="special" />}
              // Cast: typed-routes hasn't regenerated for this brand-new 'team/[id]' route yet —
              // same situation as '/(manager)' in login.tsx, a real route Metro's typegen hasn't
              // caught up to.
              onPress={() => router.push(`/team/${rep.id}` as any)}
            />
          );
        })}
      </View>
    </Screen>
  );
}
