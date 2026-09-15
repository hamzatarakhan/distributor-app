import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, Card, ListRow, Money, Screen, SectionHeader, StatCard, StatRow, Text,
} from '@/src/components';
import { useInvoices, useOrders, useReps, useVisits } from '@/src/hooks/data';
import { visitStatusKey, visitStatusTone } from '@/src/lib/status';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// The "detailed info" a manager taps through to from the roster: today's schedule plus what this
// rep has actually sold and collected — built entirely from data already scoped by repId
// (visit.list, and Order/Invoice.repId stamped at order.create/order.confirm), no fake profile
// fields invented for the occasion.
export default function TeamMemberDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const repId = Number(id);
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const reps = useReps();
  const visits = useVisits({});
  const orders = useOrders({});
  const invoices = useInvoices({ filter: 'all' });

  const rep = reps.data?.items.find((r) => r.id === repId);
  const today = todayIso();

  const repVisitsToday = (visits.data?.items ?? [])
    .filter((v) => v.repId === repId && (v.date ?? today) === today)
    .sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? ''));
  const remaining = repVisitsToday.filter((v) => v.status === 'planned');
  const done = repVisitsToday.filter((v) => v.status === 'done');

  const repOrders = (orders.data?.items ?? []).filter((o) => o.repId === repId);
  const ordersTotal = repOrders.reduce((s, o) => s + o.total, 0);

  const repInvoices = (invoices.data?.items ?? []).filter((i) => i.repId === repId);
  const outstanding = repInvoices.reduce((s, i) => s + i.amountDue, 0);

  const currency = repOrders[0]?.currency ?? repInvoices[0]?.currency ?? 'JOD';
  const loading = reps.isLoading || visits.isLoading || orders.isLoading || invoices.isLoading;

  const refetchAll = () => {
    reps.refetch();
    visits.refetch();
    orders.refetch();
    invoices.refetch();
  };

  return (
    <Screen
      onRefresh={refetchAll}
      refreshing={reps.isRefetching || visits.isRefetching || orders.isRefetching || invoices.isRefetching}
      loading={loading}
      error={reps.error}
      onRetry={refetchAll}>
      {rep ? (
        <>
          <Text variant="h1">{rep.name}</Text>
          <Text tone="muted" variant="caption">{t('team.role')}</Text>

          <StatRow>
            <StatCard icon="calendar-outline" label={t('manager.statToday')} value={String(repVisitsToday.length)} />
            <StatCard icon="time-outline" label={t('visits.statRemaining')} value={String(remaining.length)} tone="warning" />
            <StatCard icon="checkmark-circle-outline" label={t('visits.statDone')} value={String(done.length)} tone="success" />
          </StatRow>

          <Card style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="caption" tone="muted">{t('team.ordersSummary', { count: repOrders.length })}</Text>
            <Money value={ordersTotal} currency={currency} variant="title" />
          </Card>
          <Card style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="caption" tone="muted">{t('invoices.outstanding', { count: repInvoices.length })}</Text>
            <Money value={outstanding} currency={currency} variant="title" tone={outstanding > 0 ? 'danger' : 'success'} />
          </Card>

          <SectionHeader title={t('team.todayVisits')} />
          {repVisitsToday.length === 0 ? (
            <Text tone="muted" variant="caption">{t('visits.emptyText')}</Text>
          ) : (
            <View style={{ gap: spacing.md }}>
              {repVisitsToday.map((v) => (
                <ListRow
                  key={v.id}
                  title={v.customerName}
                  subtitle={v.scheduledTime}
                  right={<Badge label={t(visitStatusKey[v.status])} tone={visitStatusTone[v.status]} />}
                  onPress={() => router.push(`/visits/${v.id}`)}
                />
              ))}
            </View>
          )}
        </>
      ) : null}
    </Screen>
  );
}
