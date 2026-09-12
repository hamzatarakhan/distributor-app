import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ListRow, Money, Screen, SearchBar, Text } from '@/src/components';
import { useProducts } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function VanStockScreen() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const q = useDebounced(search, 300);
  const { data, isLoading, error, refetch, isRefetching } = useProducts({ search: q });
  const items = data?.items ?? [];

  return (
    <Screen
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      empty={!isLoading && items.length === 0}
      emptyText={t('stock.emptyText')}>
      <SearchBar value={search} onChangeText={setSearch} placeholder={t('stock.searchPlaceholder')} />
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
