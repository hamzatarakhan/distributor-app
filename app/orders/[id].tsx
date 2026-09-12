import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, Button, Card, DetailRow, Divider, Money, ResultSheet, Screen, StickyActionBar, Text,
  type ResultState,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useConfirmOrder, useOrder } from '@/src/hooks/data';
import { orderStatusKey, orderStatusTone } from '@/src/lib/status';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { data, isLoading, error, refetch, isRefetching } = useOrder(orderId);
  const confirmOrder = useConfirmOrder(orderId);
  const [result, setResult] = useState<ResultState | null>(null);

  const submit = (fail?: boolean) => {
    confirmOrder.mutate(
      { fail },
      {
        onSuccess: (res) =>
          setResult({
            kind: 'success',
            title: t('orderDetail.confirmedTitle'),
            description: t('orderDetail.confirmedDescription'),
            referenceLabel: t('orderDetail.invoiceLabel'),
            reference: res.invoice.number,
          }),
        onError: (e) =>
          setResult({ kind: 'error', title: t('orderDetail.couldNotConfirm'), description: errorMessage(e) }),
      },
    );
  };

  const draft = data?.status === 'draft';

  return (
    <>
      <Screen
        onRefresh={refetch}
        refreshing={isRefetching}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        footer={
          data ? (
            draft ? (
              <StickyActionBar
                label={t('orderDetail.confirmOrder')}
                loading={confirmOrder.isPending}
                onPress={() => submit()}
              />
            ) : (
              <View style={{ padding: spacing.lg, gap: spacing.sm }}>
                {data.invoiceId ? (
                  <Button
                    title={t('orderDetail.viewInvoice')}
                    onPress={() => router.push(`/invoices/${data.invoiceId}`)}
                    fullWidth
                  />
                ) : null}
                {!data.hasReturn ? (
                  <Button
                    variant="secondary"
                    title={t('orderDetail.createReturn')}
                    onPress={() => router.push(`/orders/${orderId}/return`)}
                    fullWidth
                  />
                ) : (
                  <Text variant="caption" tone="faint" style={{ textAlign: 'center' }}>
                    {t('orderDetail.alreadyReturned')}
                  </Text>
                )}
              </View>
            )
          ) : undefined
        }>
        {data ? (
          <>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h1">{data.reference}</Text>
              <Badge label={t(orderStatusKey[data.status])} tone={orderStatusTone[data.status]} />
            </View>
            <Text tone="muted">{data.customerName}</Text>

            <Card>
              <DetailRow label={t('orderDetail.date')} value={data.date} />
            </Card>

            <Text variant="h2" style={{ marginTop: spacing.sm }}>{t('orderDetail.lines')}</Text>
            <Card>
              {data.lines.map((l, i) => (
                <View key={l.productId}>
                  {i > 0 ? <Divider /> : null}
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', gap: spacing.md }}>
                    <Text variant="caption" style={{ flex: 1 }}>{l.product}</Text>
                    <Text variant="caption" tone="muted">{l.qty} × {l.unitPrice}</Text>
                  </View>
                  <Text variant="captionSemi" style={{ textAlign: isRTL ? 'left' : 'right' }}>
                    <Money value={l.qty * l.unitPrice} currency={data.currency} variant="captionSemi" />
                  </Text>
                </View>
              ))}
            </Card>

            <Card>
              <DetailRow label={t('orderDetail.total')} valueNode={<Money value={data.total} currency={data.currency} variant="title" />} />
            </Card>
          </>
        ) : null}
      </Screen>

      <ResultSheet
        state={result}
        primaryLabel={result?.kind === 'success' ? t('orderDetail.done') : t('common.retry')}
        onPrimary={() => {
          const ok = result?.kind === 'success';
          setResult(null);
          if (ok) refetch();
          else submit();
        }}
        onCancel={result?.kind === 'error' ? () => setResult(null) : undefined}
      />
    </>
  );
}
