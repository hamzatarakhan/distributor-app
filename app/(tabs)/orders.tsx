import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, FilterChips, ListRow, Money, Screen, SearchBar } from '@/src/components';
import { useOrders } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { orderStatusKey, orderStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { OrderStatus } from '@/src/api/types';

type StatusFilter = 'all' | OrderStatus;

export default function OrdersScreen() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const q = useDebounced(search);
  const { data, isLoading, error, refetch, isRefetching } = useOrders({ search: q, status });
  const items = data?.items ?? [];

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('invoices.filterAll') },
    { value: 'draft', label: t('status.order.draft') },
    { value: 'invoiced', label: t('status.order.invoiced') },
  ];

  return (
    <Screen
      header={
        <>
          <SearchBar value={search} onChangeText={setSearch} placeholder={t('orders.searchPlaceholder')} />
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
            subtitle={`${o.customerName} · ${o.date}`}
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
