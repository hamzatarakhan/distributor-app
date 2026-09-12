import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, FilterChips, ListRow, Screen, Text } from '@/src/components';
import { useReceipts } from '@/src/hooks/data';
import { pickingStatusKey, pickingStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function Receipts() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const FILTERS = [
    { value: 'all', label: t('receipts.filterAll') },
    { value: 'draft', label: t('receipts.filterDraft') },
    { value: 'waiting', label: t('receipts.filterWaiting') },
    { value: 'ready', label: t('receipts.filterReady') },
    { value: 'done', label: t('receipts.filterDone') },
  ] as const;
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
      emptyText={t('receipts.emptyText')}>
      <FilterChips value={status} onChange={setStatus} options={FILTERS as any} />
      <View style={{ gap: spacing.md }}>
        {items.map((r) => (
          <ListRow
            key={r.id}
            title={r.sourceDocument ?? r.reference}
            subtitle={`${r.partnerName ?? ''} · ${r.scheduledDate ?? ''} · ${r.itemCount} ${t('common.items')}`}
            right={<Badge label={t(pickingStatusKey[r.status])} tone={pickingStatusTone[r.status]} />}
            onPress={() => router.push(`/stock/receipt/${r.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
