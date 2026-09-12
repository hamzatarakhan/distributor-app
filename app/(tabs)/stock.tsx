import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FilterChips, Icon, ListRow, Screen, SearchBar, Text } from '@/src/components';
import { useInventory } from '@/src/hooks/data';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useDebounced } from '@/src/lib/useDebounced';

export default function StockScreen() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState<'all' | 'low'>('all');
  const q = useDebounced(search, 300);
  const { data, isLoading, error, refetch, isRefetching } = useInventory({
    search: q,
    lowOnly: lowOnly === 'low',
  });
  const items = data?.items ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/stock/receipts')} hitSlop={10}>
              <Icon name="download" size={20} color={colors.primary} />
            </Pressable>
          ),
        }}
      />
      <Screen
        onRefresh={refetch}
        refreshing={isRefetching}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        empty={!isLoading && items.length === 0}
        emptyText={t('stock.emptyText')}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('stock.searchPlaceholder')} />
        <FilterChips
          value={lowOnly}
          onChange={setLowOnly}
          options={[
            { value: 'all', label: t('stock.filterAll') },
            { value: 'low', label: t('stock.filterLowStockOnly') },
          ]}
        />
        <View style={{ gap: spacing.md }}>
          {items.map((i) => (
            <ListRow
              key={i.productId}
              title={i.name}
              subtitle={`${i.reference ?? '—'} · ${i.locationName ?? ''}`}
              right={
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="bodySemi" tone={i.onHand < 0 ? 'danger' : 'text'}>
                    {i.onHand}
                  </Text>
                  <Text variant="caption" tone="faint">{i.uom}</Text>
                </View>
              }
              onPress={() => router.push(`/stock/${i.productId}`)}
            />
          ))}
        </View>
      </Screen>
    </>
  );
}
