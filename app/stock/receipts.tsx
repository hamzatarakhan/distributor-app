import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Badge, FilterChips, ListRow, Screen, Text } from '@/src/components';
import { useReceipts } from '@/src/hooks/data';
import { pickingStatus } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'ready', label: 'Ready' },
  { value: 'done', label: 'Done' },
] as const;

export default function Receipts() {
  const { spacing } = useTheme();
  const [status, setStatus] = useState<(typeof FILTERS)[number]['value']>('all');
  const { data, isLoading, error, refetch, isRefetching } = useReceipts(status);
  const items = data?.items ?? [];

  return (
    <Screen
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      empty={!isLoading && items.length === 0}
      emptyText="No incoming receipts.">
      <FilterChips value={status} onChange={setStatus} options={FILTERS as any} />
      <View style={{ gap: spacing.md }}>
        {items.map((r) => (
          <ListRow
            key={r.id}
            title={r.sourceDocument ?? r.reference}
            subtitle={`${r.partnerName ?? ''} · ${r.scheduledDate ?? ''} · ${r.itemCount} items`}
            right={<Badge {...pickingStatus[r.status]} />}
            onPress={() => router.push(`/stock/receipt/${r.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
