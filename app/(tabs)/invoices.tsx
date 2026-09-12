import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Card, FilterChips, ListRow, Money, Screen, SearchBar, Text } from '@/src/components';
import { useInvoices } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { invoiceStatusKey, invoiceStatusTone, isOverdue } from '@/src/lib/status';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function InvoicesScreen() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const FILTERS = [
    { value: 'all', label: t('invoices.filterAll') },
    { value: 'open', label: t('invoices.filterOpen') },
    { value: 'overdue', label: t('invoices.filterOverdue') },
    { value: 'paid', label: t('invoices.filterPaid') },
  ] as const;
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('open');
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const { data, isLoading, error, refetch, isRefetching } = useInvoices({ filter, search: q });
  const items = data?.items ?? [];
  const outstanding = items.reduce((s, i) => s + i.amountDue, 0);
  const currency = items[0]?.currency ?? 'USD';

  return (
    <Screen
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      empty={!isLoading && items.length === 0}
      emptyText={t('invoices.emptyText')}>
      <SearchBar value={search} onChangeText={setSearch} placeholder={t('invoices.searchPlaceholder')} />
      <FilterChips value={filter} onChange={setFilter} options={FILTERS as any} />
      {outstanding > 0 ? (
        <Card style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="caption" tone="muted">{t('invoices.outstanding', { count: items.length })}</Text>
          <Money value={outstanding} currency={currency} variant="title" />
        </Card>
      ) : null}
      <View style={{ gap: spacing.md }}>
        {items.map((inv) => {
          const overdue = isOverdue(inv.dueDate, inv.amountDue);
          return (
            <ListRow
              key={inv.id}
              title={inv.number}
              subtitle={inv.customerName}
              right={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Money value={inv.amountTotal} currency={inv.currency} />
                  <Text variant="caption" tone={overdue ? 'danger' : 'faint'}>
                    {inv.dueDate ? t('invoices.due', { date: inv.dueDate }) : ''}
                  </Text>
                  <Badge label={t(invoiceStatusKey[inv.status])} tone={invoiceStatusTone[inv.status]} />
                </View>
              }
              onPress={() => router.push(`/invoices/${inv.id}`)}
            />
          );
        })}
      </View>
    </Screen>
  );
}
