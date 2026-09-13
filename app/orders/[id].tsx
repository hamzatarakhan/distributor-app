import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, Card, DetailRow, Divider, Money, ResultSheet, Screen, Sheet, SignaturePad,
  StickyActionBar, Text, type ResultState,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useConfirmOrder, useOrder } from '@/src/hooks/data';
import { orderStatusKey, orderStatusTone } from '@/src/lib/status';
import { lineTotal } from '@/src/lib/orderMath';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { usePhase } from '@/src/settings/PhaseProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { phase } = usePhase();
  const { data, isLoading, error, refetch, isRefetching } = useOrder(orderId);
  const confirmOrder = useConfirmOrder(orderId);
  const [result, setResult] = useState<ResultState | null>(null);
  const [signing, setSigning] = useState(false);

  const submit = (signature?: string[], fail?: boolean) => {
    confirmOrder.mutate(
      { signature, fail },
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

  const startConfirm = () => {
    if (phase === 2) setSigning(true);
    else submit();
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
                onPress={startConfirm}
              />
            ) : data.invoiceId ? (
              <StickyActionBar
                label={t('orderDetail.viewInvoice')}
                onPress={() => router.push(`/invoices/${data.invoiceId}`)}
                secondaryLabel={!data.hasReturn ? t('orderDetail.createReturn') : undefined}
                onSecondaryPress={
                  !data.hasReturn ? () => router.push(`/orders/${orderId}/return`) : undefined
                }
                secondaryVariant="secondary"
              />
            ) : undefined
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
              {data.hasReturn ? (
                <DetailRow label={t('orderDetail.createReturn')} valueNode={<Text variant="captionSemi" tone="muted">{t('orderDetail.alreadyReturned')}</Text>} />
              ) : null}
              {data.signature ? (
                <DetailRow label={t('signature.title')} valueNode={<Text variant="captionSemi" tone="success">{t('signature.captured')}</Text>} />
              ) : null}
            </Card>

            <Text variant="h2" style={{ marginTop: spacing.sm }}>{t('orderDetail.lines')}</Text>
            <Card>
              {data.lines.map((l, i) => (
                <View key={l.productId}>
                  {i > 0 ? <Divider /> : null}
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', gap: spacing.md }}>
                    <Text variant="caption" style={{ flex: 1 }}>
                      {l.product}{l.discountPercent ? ` (-${l.discountPercent}%)` : ''}
                    </Text>
                    <Text variant="caption" tone="muted">{l.qty} × {l.unitPrice}</Text>
                  </View>
                  <Text variant="captionSemi" style={{ textAlign: isRTL ? 'left' : 'right' }}>
                    <Money value={lineTotal(l)} currency={data.currency} variant="captionSemi" />
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

      <Sheet visible={signing} onClose={() => setSigning(false)}>
        <Text variant="h2">{t('signature.title')}</Text>
        <Text tone="muted" variant="caption">{t('signature.confirmHint')}</Text>
        <SignaturePad
          onSave={(paths) => {
            setSigning(false);
            submit(paths);
          }}
        />
      </Sheet>

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
