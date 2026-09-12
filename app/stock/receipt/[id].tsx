import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, Card, DetailRow, QtyStepper, ResultSheet, Screen, StickyActionBar, Text,
  type ResultState,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useConfirmReceipt, useReceipt } from '@/src/hooks/data';
import { pickingStatusKey, pickingStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const receiptId = Number(id);
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading, error, refetch, isRefetching } = useReceipt(receiptId);
  const confirm = useConfirmReceipt(receiptId);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ResultState | null>(null);

  const lines = data?.lines ?? [];
  const doneQty = (lineId: number, fallback: number) => qty[lineId] ?? fallback;
  const canConfirm = data?.status === 'ready';

  const submit = (fail?: boolean) => {
    const payload = lines.map((l) => ({ id: l.id, doneQty: doneQty(l.id, l.doneQty) }));
    confirm.mutate(
      { lines: payload, fail },
      {
        onSuccess: (res) =>
          setResult({
            kind: 'success',
            title: t('receiptDetail.confirmedTitle'),
            description: t('receiptDetail.confirmedDescription'),
            referenceLabel: t('receiptDetail.receiptLabel'),
            reference: res.reference,
          }),
        onError: (e) =>
          setResult({ kind: 'error', title: t('receiptDetail.couldNotConfirm'), description: errorMessage(e) }),
      },
    );
  };

  return (
    <>
      <Screen
        onRefresh={refetch}
        refreshing={isRefetching}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        footer={
          canConfirm ? (
            <StickyActionBar
              label={t('receiptDetail.confirmReceipt')}
              loading={confirm.isPending}
              onPress={() => submit()}
            />
          ) : undefined
        }>
        {data ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h1">{data.reference}</Text>
              <Badge label={t(pickingStatusKey[data.status])} tone={pickingStatusTone[data.status]} />
            </View>
            <Card>
              <DetailRow label={t('receiptDetail.supplier')} value={data.partnerName ?? '—'} />
              <DetailRow label={t('receiptDetail.source')} value={data.sourceDocument ?? '—'} />
              <DetailRow label={t('receiptDetail.scheduled')} value={data.scheduledDate ?? '—'} />
            </Card>

            <Text variant="h2" style={{ marginTop: spacing.sm }}>{t('receiptDetail.items')}</Text>
            {lines.map((l) => (
              <Card key={l.id}>
                <Text variant="title">{l.product}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="caption" tone="muted">{t('receiptDetail.demand', { qty: l.demandQty, uom: l.uom })}</Text>
                  {canConfirm ? (
                    <QtyStepper
                      value={doneQty(l.id, l.doneQty)}
                      onChange={(n) => setQty((s) => ({ ...s, [l.id]: n }))}
                      max={l.demandQty}
                    />
                  ) : (
                    <Text variant="bodySemi">{l.doneQty} {l.uom}</Text>
                  )}
                </View>
              </Card>
            ))}
            {!canConfirm ? (
              <Text variant="caption" tone="faint">
                {t('receiptDetail.onlyReadyCanBeConfirmed')}
              </Text>
            ) : null}
          </>
        ) : null}
      </Screen>

      <ResultSheet
        state={result}
        primaryLabel={result?.kind === 'success' ? t('receiptDetail.backToReceipts') : t('common.retry')}
        onPrimary={() => {
          const ok = result?.kind === 'success';
          setResult(null);
          if (ok) router.back();
          else submit();
        }}
        onCancel={result?.kind === 'error' ? () => setResult(null) : undefined}
      />
    </>
  );
}
