import { router } from 'expo-router';
import { View } from 'react-native';
import {
  Badge, Card, ListRow, Money, Screen, SectionHeader, StatCard, StatRow, Text,
} from '@/src/components';
import { useDeliveries, useInventory, useInvoices, useProfile } from '@/src/hooks/data';
import { invoiceStatus, isOverdue, pickingStatus } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function Dashboard() {
  const { spacing } = useTheme();
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
      <Text variant="h1">Hi{profile.data ? `, ${profile.data.name.split(' ')[0]}` : ''}</Text>
      {profile.data?.warehouses?.[0] ? (
        <Text tone="muted" variant="caption">{profile.data.warehouses[0]}</Text>
      ) : null}

      <StatRow>
        <StatCard label="Deliveries today" value={String(todays.length)} />
        <StatCard label="Ready to ship" value={String(ready.length)} />
        <StatCard label="Open invoices" value={String(openInvoices.length)} />
        <StatCard
          label="Overdue"
          value={overdueTotal ? `${overdueTotal.toFixed(0)} ${currency}` : '0'}
          tone={overdueTotal ? 'danger' : 'text'}
        />
      </StatRow>

      <SectionHeader
        title="Today's deliveries"
        action={<Text tone="primary" variant="caption" onPress={() => router.push('/(tabs)/deliveries')}>See all</Text>}
      />
      {todays.length === 0 ? (
        <Card><Text tone="muted" variant="caption">Nothing scheduled for today.</Text></Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {todays.slice(0, 5).map((d) => (
            <ListRow
              key={d.id}
              title={d.partnerName ?? d.reference}
              subtitle={`${d.reference} · ${d.itemCount} items`}
              right={<Badge {...pickingStatus[d.status]} />}
              onPress={() => router.push(`/deliveries/${d.id}`)}
            />
          ))}
        </View>
      )}

      <SectionHeader title="Low / negative stock" />
      {lowStock.length === 0 ? (
        <Card><Text tone="muted" variant="caption">All products above reorder point.</Text></Card>
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
        title="Overdue invoices"
        action={<Text tone="primary" variant="caption" onPress={() => router.push('/(tabs)/invoices')}>See all</Text>}
      />
      {overdue.length === 0 ? (
        <Card><Text tone="muted" variant="caption">No overdue invoices.</Text></Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {overdue.slice(0, 5).map((inv) => (
            <ListRow
              key={inv.id}
              title={inv.customerName}
              subtitle={`${inv.number} · due ${inv.dueDate}`}
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Money value={inv.amountDue} currency={inv.currency} />
                  <Badge {...invoiceStatus[inv.status]} />
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
