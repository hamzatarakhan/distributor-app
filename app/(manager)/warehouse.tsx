import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Button, Card, FilterChips, QtyStepper, Screen, SearchBar, Sheet, Text,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useIssueStock, useProducts, useReps } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';
import type { Product } from '@/src/api/types';

function IssueStockSheet({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const reps = useReps();
  const issueStock = useIssueStock();
  const [repId, setRepId] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRepId('');
    setQty(1);
    setError(null);
  };

  const submit = () => {
    if (!product || !repId) return;
    setError(null);
    issueStock.mutate(
      { productId: product.id, repId: Number(repId), qty },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (e) => setError(errorMessage(e)),
      },
    );
  };

  return (
    <Sheet
      visible={!!product}
      onClose={() => {
        reset();
        onClose();
      }}>
      {product ? (
        <>
          <Text variant="h2">{t('warehouse.issueTitle')}</Text>
          <Text tone="muted" variant="caption">{product.name}</Text>

          <View style={{ gap: 6 }}>
            <Text variant="captionSemi" tone="muted">{t('assignVisit.repLabel')}</Text>
            <FilterChips
              options={(reps.data?.items ?? []).map((r) => ({ value: String(r.id), label: r.name }))}
              value={repId}
              onChange={setRepId}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text variant="captionSemi" tone="muted">{t('warehouse.qtyLabel')}</Text>
            <QtyStepper value={qty} onChange={setQty} max={product.warehouseStock} />
          </View>

          {error ? <Text tone="danger" variant="caption">{error}</Text> : null}

          <Button
            title={t('warehouse.issueSubmit')}
            onPress={submit}
            loading={issueStock.isPending}
            disabled={!repId || qty <= 0}
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </>
      ) : null}
    </Sheet>
  );
}

export default function Warehouse() {
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const [search, setSearch] = useState('');
  const q = useDebounced(search, 300);
  const { data, isLoading, error, refetch, isRefetching } = useProducts({ search: q });
  const items = data?.items ?? [];
  const [issuing, setIssuing] = useState<Product | null>(null);

  return (
    <>
      <Screen
        header={
          <>
            <Text variant="h1">{t('manager.tabWarehouse')}</Text>
            <Text tone="muted" variant="caption">{t('warehouse.hint')}</Text>
            <SearchBar value={search} onChangeText={setSearch} placeholder={t('stock.searchPlaceholder')} />
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
            <Card key={p.id} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text variant="title">{p.name}</Text>
                <Text variant="caption" tone="muted">
                  {t('warehouse.warehouseQty', { qty: p.warehouseStock ?? 0, uom: p.uom })}
                  {'  ·  '}
                  {t('warehouse.vanQty', { qty: p.vanStock, uom: p.uom })}
                </Text>
              </View>
              <Button
                variant="secondary"
                title={t('warehouse.issue')}
                onPress={() => setIssuing(p)}
                disabled={(p.warehouseStock ?? 0) <= 0}
              />
            </Card>
          ))}
        </View>
      </Screen>

      <IssueStockSheet product={issuing} onClose={() => setIssuing(null)} />
    </>
  );
}
