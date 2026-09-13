import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FilterChips, ListRow, Money, Screen, SearchBar, Text } from '@/src/components';
import { useProducts } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { usePhase } from '@/src/settings/PhaseProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

type StockFilter = 'all' | 'low' | 'out';

export default function VanStockScreen() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { phase } = usePhase();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const q = useDebounced(search, 300);
  const { data, isLoading, error, refetch, isRefetching } = useProducts({ search: q, stockFilter });
  const items = data?.items ?? [];

  // "Out of stock" uses only the base vanStock field (Phase 1-safe, basic stock awareness).
  // "Low stock" depends on the lowStockThreshold concept, which is a Phase 2 addition — see
  // the same gating on the New Order screen's low-stock badge.
  const stockOptions: { value: StockFilter; label: string }[] = [
    { value: 'all', label: t('invoices.filterAll') },
    ...(phase === 2 ? [{ value: 'low' as const, label: t('stock.filterLow') }] : []),
    { value: 'out', label: t('stock.filterOut') },
  ];

  return (
    <Screen
      header={
        <>
          <SearchBar value={search} onChangeText={setSearch} placeholder={t('stock.searchPlaceholder')} />
          <FilterChips options={stockOptions} value={stockFilter} onChange={setStockFilter} />
        </>
      }
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      empty={!isLoading && items.length === 0}
      emptyText={t('stock.emptyText')}>
      <View style={{ gap: spacing.md }}>
        {items.map((p) => (
          <ListRow
            key={p.id}
            title={p.name}
            subtitle={p.reference}
            right={
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="bodySemi" tone={p.vanStock <= 0 ? 'danger' : 'text'}>
                  {p.vanStock}
                </Text>
                <Text variant="caption" tone="faint">{p.uom}</Text>
              </View>
            }
            onPress={() => router.push(`/stock/${p.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
