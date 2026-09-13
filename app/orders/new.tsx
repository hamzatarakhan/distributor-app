import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Button, Card, Icon, ListRow, Money, PercentChips, QtyStepper, ResultSheet, Screen, SearchBar,
  StickyActionBar, Text, type ResultState,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useCreateOrder, useCustomer, useProducts, useVisit } from '@/src/hooks/data';
import { useDebounced } from '@/src/lib/useDebounced';
import { orderTotal } from '@/src/lib/orderMath';
import { enqueueOrder } from '@/src/lib/offlineQueue';
import { useIsOnline } from '@/src/lib/useOnline';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { usePhase } from '@/src/settings/PhaseProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function NewOrder() {
  const { visitId: visitIdParam, addProductId } = useLocalSearchParams<{ visitId?: string; addProductId?: string }>();
  const visitId = visitIdParam ? Number(visitIdParam) : undefined;
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { phase } = usePhase();
  const online = useIsOnline();
  const [result, setResult] = useState<ResultState | null>(null);
  const visit = useVisit(visitId ?? 0);
  const customer = useCustomer(phase === 2 ? (visit.data?.customerId ?? 0) : 0);
  const [search, setSearch] = useState('');
  const q = useDebounced(search, 300);
  const products = useProducts({ search: q });
  const [cart, setCart] = useState<Record<number, number>>({});
  const [discounts, setDiscounts] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const appliedScan = useRef<string | null>(null);

  useEffect(() => {
    if (addProductId && appliedScan.current !== addProductId) {
      appliedScan.current = addProductId;
      const id = Number(addProductId);
      setCart((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
    }
  }, [addProductId]);

  const items = products.data?.items ?? [];
  const currency = items[0]?.currency ?? 'JOD';
  const lines = items
    .filter((p) => (cart[p.id] ?? 0) > 0)
    .map((p) => ({
      productId: p.id,
      product: p.name,
      uom: p.uom,
      qty: cart[p.id],
      unitPrice: p.price,
      discountPercent: phase === 2 ? discounts[p.id] : undefined,
    }));
  const total = orderTotal(lines);
  const wouldExceedCredit =
    phase === 2 && customer.data ? customer.data.balance + total > customer.data.creditLimit : false;

  const submit = async () => {
    if (!visit.data || lines.length === 0) return;
    setError(null);
    const payload = { visitId, customerId: visit.data.customerId, customerName: visit.data.customerName, lines };
    if (phase === 2 && !online) {
      await enqueueOrder(payload);
      setResult({
        kind: 'success',
        title: t('offline.queuedTitle'),
        description: t('offline.queuedDescription'),
      });
      return;
    }
    createOrder.mutate(payload, {
      onSuccess: (order) => router.replace(`/orders/${order.id}`),
      onError: (e) => setError(errorMessage(e)),
    });
  };

  return (
    <>
    <Screen
      header={
        <>
          {visit.data ? (
            <Text variant="h2">{t('newOrder.forCustomer', { name: visit.data.customerName })}</Text>
          ) : null}
          {phase === 2 && customer.data ? (
            <Card
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                ...(wouldExceedCredit ? { borderColor: colors.danger, backgroundColor: colors.dangerTint } : null),
              }}>
              <Text variant="caption" tone={wouldExceedCredit ? 'danger' : 'muted'}>
                {t('creditCheck.label', { balance: customer.data.balance.toFixed(0), limit: customer.data.creditLimit.toFixed(0) })}
              </Text>
              {wouldExceedCredit ? <Icon name="warning" size={16} color={colors.danger} /> : null}
            </Card>
          ) : null}
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <SearchBar value={search} onChangeText={setSearch} placeholder={t('newOrder.searchPlaceholder')} />
            </View>
            {phase === 2 ? (
              <Pressable
                onPress={() => router.push(`/orders/scan?visitId=${visitId ?? ''}`)}
                style={{
                  width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
                }}>
                <Icon name="barcode-outline" color={colors.primary} />
              </Pressable>
            ) : null}
          </View>
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
        {items.map((p) => {
          const qty = cart[p.id] ?? 0;
          const low = phase === 2 && p.lowStockThreshold != null && p.vanStock <= p.lowStockThreshold;
          return (
            <ListRow
              key={p.id}
              chevron={false}
              title={p.name}
              subtitle={
                <View style={{ gap: 4 }}>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                    <Money value={p.price} currency={p.currency} variant="caption" tone="muted" />
                    <Text variant="caption" tone={low ? 'danger' : 'faint'}>
                      · {t('newOrder.vanStock', { qty: p.vanStock, uom: p.uom })}
                      {low ? ` (${t('lowStock.badge')})` : ''}
                    </Text>
                  </View>
                  {phase === 2 && qty > 0 ? (
                    <PercentChips
                      value={discounts[p.id] ?? 0}
                      onChange={(pct) => setDiscounts((s) => ({ ...s, [p.id]: pct }))}
                    />
                  ) : null}
                </View>
              }
              right={
                <QtyStepper
                  value={qty}
                  onChange={(n) => setCart((s) => ({ ...s, [p.id]: n }))}
                  max={p.vanStock}
                />
              }
            />
          );
        })}
      </View>
      {lines.length > 0 ? (
        <Button
          variant="ghost"
          title={t('newOrder.clearCart')}
          onPress={() => {
            setCart({});
            setDiscounts({});
          }}
        />
      ) : null}
    </Screen>

    <ResultSheet
      state={result}
      onPrimary={() => {
        setResult(null);
        router.back();
      }}
    />
    </>
  );
}
