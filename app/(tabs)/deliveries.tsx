import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Badge, FilterChips, ListRow, Screen, SearchBar, Text } from '@/src/components';
import { useDeliveries } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { pickingStatus } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

const FILTERS = [
  { value: 'ready', label: 'Ready' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'done', label: 'Done' },
  { value: 'all', label: 'All' },
] as const;

export default function DeliveriesScreen() {
  const { spacing } = useTheme();
  const [status, setStatus] = useState<(typeof FILTERS)[number]['value']>('ready');
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const { data, isLoading, error, refetch, isRefetching } = useDeliveries({ status, search: q });
  const items = data?.items ?? [];

  return (
    <Screen
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      empty={!isLoading && items.length === 0}
      emptyText="No deliveries in this view.">
      <SearchBar value={search} onChangeText={setSearch} placeholder="Customer or reference" />
      <FilterChips value={status} onChange={setStatus} options={FILTERS as any} />
      <View style={{ gap: spacing.md }}>
        {items.map((d) => (
          <ListRow
            key={d.id}
            title={d.partnerName ?? d.reference}
            subtitle={`${d.reference} · ${d.deliveryCity ?? ''} · ${d.scheduledDate ?? ''}`}
            right={
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge {...pickingStatus[d.status]} />
                <Text variant="caption" tone="faint">{d.itemCount} items</Text>
              </View>
            }
            onPress={() => router.push(`/deliveries/${d.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
