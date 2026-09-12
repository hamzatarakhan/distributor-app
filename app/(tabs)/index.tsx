import { router } from 'expo-router';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, Card, ListRow, Money, Screen, SectionHeader, StatCard, StatRow, Text,
} from '@/src/components';
import { useDeliveries, useInventory, useInvoices, useProfile } from '@/src/hooks/data';
import { invoiceStatusKey, invoiceStatusTone, isOverdue, pickingStatusKey, pickingStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function Dashboard() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const profile = useProfile();
  const deliveries = useDeliveries({ status: 'all' });
  const inventory = useInventory({});
  const invoices = useInvoices({ filter: 'all' });

  const refreshing =
    deliveries.isRefetching || inventory.isRefetching || invoices.isRefetching || profile.isRefetching;
  const refetchAll = () => {
    profile.refetch();
    deliveries.refetch();
    inventory.refetch();
    invoices.refetch();
  };

  const today = new Date().toISOString().slice(0, 10);
  const allDeliveries = deliveries.data?.items ?? [];
  const todays = allDeliveries.filter((d) => d.scheduledDate === today && d.status !== 'done');
  const ready = allDeliveries.filter((d) => d.status === 'ready');
  const lowStock = (inventory.data?.items ?? []).filter(
    (i) => i.reorderPoint != null && i.onHand < i.reorderPoint,
  );
  const openInvoices = (invoices.data?.items ?? []).filter((i) => i.amountDue > 0);
  const overdue = openInvoices.filter((i) => isOverdue(i.dueDate, i.amountDue));
  const overdueTotal = overdue.reduce((s, i) => s + i.amountDue, 0);
  const currency = openInvoices[0]?.currency ?? 'USD';

  const loading = deliveries.isLoading || inventory.isLoading || invoices.isLoading;

  return (
    <Screen
      onRefresh={refetchAll}
      refreshing={refreshing}
      loading={loading}
      error={deliveries.error ?? inventory.error ?? invoices.error}
      onRetry={refetchAll}>
      <Text variant="h1">{t('home.greeting', { name: profile.data ? `, ${profile.data.name.split(' ')[0]}` : '' })}</Text>
      {profile.data?.warehouses?.[0] ? (
        <Text tone="muted" variant="caption">{profile.data.warehouses[0]}</Text>
      ) : null}

      <StatRow>
        <StatCard label={t('home.statDeliveriesToday')} value={String(todays.length)} />
        <StatCard label={t('home.statReadyToShip')} value={String(ready.length)} />
        <StatCard label={t('home.statOpenInvoices')} value={String(openInvoices.length)} />
        <StatCard
          label={t('home.statOverdue')}
          value={overdueTotal ? `${overdueTotal.toFixed(0)} ${currency}` : '0'}
          tone={overdueTotal ? 'danger' : 'text'}
        />
      </StatRow>

      <SectionHeader
        title={t('home.todaysDeliveries')}
        action={<Text tone="primary" variant="caption" onPress={() => router.push('/(tabs)/deliveries')}>{t('home.seeAll')}</Text>}
      />
      {todays.length === 0 ? (
        <Card><Text tone="muted" variant="caption">{t('home.nothingScheduledToday')}</Text></Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {todays.slice(0, 5).map((d) => (
            <ListRow
              key={d.id}
              title={d.partnerName ?? d.reference}
              subtitle={`${d.reference} · ${d.itemCount} ${t('common.items')}`}
              right={<Badge label={t(pickingStatusKey[d.status])} tone={pickingStatusTone[d.status]} />}
              onPress={() => router.push(`/deliveries/${d.id}`)}
            />
          ))}
        </View>
      )}

      <SectionHeader title={t('home.lowStock')} />
      {lowStock.length === 0 ? (
        <Card><Text tone="muted" variant="caption">{t('home.allAboveReorder')}</Text></Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {lowStock.slice(0, 5).map((i) => (
            <ListRow
              key={i.productId}
              title={i.name}
              subtitle={i.reference}
              right={<Text variant="bodySemi" tone={i.onHand < 0 ? 'danger' : 'text'}>{i.onHand} {i.uom}</Text>}
              onPress={() => router.push(`/stock/${i.productId}`)}
            />
          ))}
        </View>
      )}

      <SectionHeader
        title={t('home.overdueInvoices')}
        action={<Text tone="primary" variant="caption" onPress={() => router.push('/(tabs)/invoices')}>{t('home.seeAll')}</Text>}
      />
      {overdue.length === 0 ? (
        <Card><Text tone="muted" variant="caption">{t('home.noOverdueInvoices')}</Text></Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {overdue.slice(0, 5).map((inv) => (
            <ListRow
              key={inv.id}
              title={inv.customerName}
              subtitle={`${inv.number} · ${t('invoices.due', { date: inv.dueDate })}`}
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Money value={inv.amountDue} currency={inv.currency} />
                  <Badge label={t(invoiceStatusKey[inv.status])} tone={invoiceStatusTone[inv.status]} />
                </View>
              }
              onPress={() => router.push(`/invoices/${inv.id}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
