import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, FilterChips, ListRow, Screen, SearchBar, Text } from '@/src/components';
import { useDeliveries } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { pickingStatusKey, pickingStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function DeliveriesScreen() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const FILTERS = [
    { value: 'all', label: t('deliveries.filterAll') },
    { value: 'ready', label: t('deliveries.filterReady') },
    { value: 'waiting', label: t('deliveries.filterWaiting') },
    { value: 'done', label: t('deliveries.filterDone') },
  ] as const;
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
      emptyText={t('deliveries.emptyText')}>
      <SearchBar value={search} onChangeText={setSearch} placeholder={t('deliveries.searchPlaceholder')} />
      <FilterChips value={status} onChange={setStatus} options={FILTERS as any} />
      <View style={{ gap: spacing.md }}>
        {items.map((d) => (
          <ListRow
            key={d.id}
            title={d.partnerName ?? d.reference}
            subtitle={`${d.reference} · ${d.deliveryCity ?? ''} · ${d.scheduledDate ?? ''}`}
            right={
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge label={t(pickingStatusKey[d.status])} tone={pickingStatusTone[d.status]} />
                <Text variant="caption" tone="faint">{d.itemCount} {t('common.items')}</Text>
              </View>
            }
            onPress={() => router.push(`/deliveries/${d.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
