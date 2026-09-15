import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, FilterChips, ListRow, Money, Screen, SearchBar } from '@/src/components';
import { useOrders, useReps } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { orderStatusKey, orderStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { OrderStatus } from '@/src/api/types';

type StatusFilter = 'all' | OrderStatus;

// A manager doesn't place orders — they audit them: which shop, which rep, and is it still a
// draft nobody has confirmed yet. Same list query as the rep's Orders tab, plus a rep filter and
// rep attribution on each row, which is exactly the piece a rep's own Orders screen doesn't need.
export default function ManagerOrders() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const reps = useReps();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [repFilter, setRepFilter] = useState('all');
  const q = useDebounced(search);
  const { data, isLoading, error, refetch, isRefetching } = useOrders({ search: q, status });
  const items = (data?.items ?? []).filter((o) => repFilter === 'all' || String(o.repId) === repFilter);

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('invoices.filterAll') },
    { value: 'draft', label: t('status.order.draft') },
    { value: 'invoiced', label: t('status.order.invoiced') },
  ];
  const repOptions = [
    { value: 'all', label: t('manager.allReps') },
    ...(reps.data?.items ?? []).map((r) => ({ value: String(r.id), label: r.name })),
  ];

  return (
    <Screen
      header={
        <>
          <SearchBar value={search} onChangeText={setSearch} placeholder={t('orders.searchPlaceholder')} />
          <FilterChips options={repOptions} value={repFilter} onChange={setRepFilter} />
          <FilterChips options={statusOptions} value={status} onChange={setStatus} />
        </>
      }
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      empty={!isLoading && items.length === 0}
      emptyText={t('orders.emptyText')}>
      <View style={{ gap: spacing.md }}>
        {items.map((o) => (
          <ListRow
            key={o.id}
            title={o.reference}
            subtitle={`${o.customerName} · ${o.repName ?? '—'} · ${o.date}`}
            right={
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Money value={o.total} currency={o.currency} />
                <Badge label={t(orderStatusKey[o.status])} tone={orderStatusTone[o.status]} />
              </View>
            }
            onPress={() => router.push(`/orders/${o.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
