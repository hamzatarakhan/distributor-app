import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Button, Card, ListRow, Money, QtyStepper, Screen, SearchBar, StickyActionBar, Text,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useCreateOrder, useProducts, useVisit } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function NewOrder() {
  const { visitId: visitIdParam } = useLocalSearchParams<{ visitId?: string }>();
  const visitId = visitIdParam ? Number(visitIdParam) : undefined;
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const visit = useVisit(visitId ?? 0);
  const [search, setSearch] = useState('');
  const q = useDebounced(search, 300);
  const products = useProducts({ search: q });
  const [cart, setCart] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const createOrder = useCreateOrder();

  const items = products.data?.items ?? [];
  const currency = items[0]?.currency ?? 'JOD';
  const lines = items
    .filter((p) => (cart[p.id] ?? 0) > 0)
    .map((p) => ({ productId: p.id, product: p.name, uom: p.uom, qty: cart[p.id], unitPrice: p.price }));
  const total = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);

  const submit = () => {
    if (!visit.data || lines.length === 0) return;
    setError(null);
    createOrder.mutate(
      { visitId, customerId: visit.data.customerId, customerName: visit.data.customerName, lines },
      {
        onSuccess: (order) => router.replace(`/orders/${order.id}`),
        onError: (e) => setError(errorMessage(e)),
      },
    );
  };

  return (
    <Screen
      header={
        <>
          {visit.data ? (
            <Text variant="h2">{t('newOrder.forCustomer', { name: visit.data.customerName })}</Text>
          ) : null}
          <SearchBar value={search} onChangeText={setSearch} placeholder={t('newOrder.searchPlaceholder')} />
        </>
      }
      loading={products.isLoading || visit.isLoading}
      error={products.error ?? visit.error}
      onRetry={() => {
        products.refetch();
        visit.refetch();
      }}
      empty={!products.isLoading && items.length === 0}
      emptyText={t('newOrder.emptyText')}
      footer={
        <StickyActionBar
          label={
            total > 0
              ? t('newOrder.confirmWithTotal', { total: total.toFixed(2), currency })
              : t('newOrder.confirm')
          }
          disabled={lines.length === 0}
          loading={createOrder.isPending}
          onPress={submit}
        />
      }>
      {error ? (
        <Card>
          <Text tone="danger" variant="caption">{error}</Text>
        </Card>
      ) : null}
      <View style={{ gap: spacing.md }}>
        {items.map((p) => (
          <ListRow
            key={p.id}
            chevron={false}
            title={p.name}
            subtitle={
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                <Money value={p.price} currency={p.currency} variant="caption" tone="muted" />
                <Text variant="caption" tone="faint">· {t('newOrder.vanStock', { qty: p.vanStock, uom: p.uom })}</Text>
              </View>
            }
            right={
              <QtyStepper
                value={cart[p.id] ?? 0}
                onChange={(n) => setCart((s) => ({ ...s, [p.id]: n }))}
                max={p.vanStock}
              />
            }
          />
        ))}
      </View>
      {lines.length > 0 ? (
        <Button
          variant="ghost"
          title={t('newOrder.clearCart')}
          onPress={() => setCart({})}
        />
      ) : null}
    </Screen>
  );
}
