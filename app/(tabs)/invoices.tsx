import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Badge, Card, FilterChips, ListRow, Money, Screen, SearchBar, Text } from '@/src/components';
import { useInvoices } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { invoiceStatus, isOverdue } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

const FILTERS = [
  { value: 'open', label: 'Open' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
  { value: 'all', label: 'All' },
] as const;

export default function InvoicesScreen() {
  const { spacing } = useTheme();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('open');
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const { data, isLoading, error, refetch, isRefetching } = useInvoices({ filter, search: q });
  const items = data?.items ?? [];
  const outstanding = items.reduce((s, i) => s + i.amountDue, 0);
  const currency = items[0]?.currency ?? 'USD';

  return (
    <Screen
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      empty={!isLoading && items.length === 0}
      emptyText="No invoices in this view.">
      <SearchBar value={search} onChangeText={setSearch} placeholder="Number or customer" />
      <FilterChips value={filter} onChange={setFilter} options={FILTERS as any} />
      {outstanding > 0 ? (
        <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="caption" tone="muted">{items.length} invoices · outstanding</Text>
          <Money value={outstanding} currency={currency} variant="title" />
        </Card>
      ) : null}
      <View style={{ gap: spacing.md }}>
        {items.map((inv) => {
          const overdue = isOverdue(inv.dueDate, inv.amountDue);
          return (
            <ListRow
              key={inv.id}
              title={inv.number}
              subtitle={inv.customerName}
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Money value={inv.amountTotal} currency={inv.currency} />
                  <Text variant="caption" tone={overdue ? 'danger' : 'faint'}>
                    {inv.dueDate ? `due ${inv.dueDate}` : ''}
                  </Text>
                  <Badge {...invoiceStatus[inv.status]} />
                </View>
              }
              onPress={() => router.push(`/invoices/${inv.id}`)}
            />
          );
        })}
      </View>
    </Screen>
  );
}
