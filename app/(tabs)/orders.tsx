import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, ListRow, Money, Screen, SearchBar } from '@/src/components';
import { useOrders } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { orderStatusKey, orderStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function OrdersScreen() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const { data, isLoading, error, refetch, isRefetching } = useOrders({ search: q });
  const items = data?.items ?? [];

  return (
    <Screen
      header={<SearchBar value={search} onChangeText={setSearch} placeholder={t('orders.searchPlaceholder')} />}
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
