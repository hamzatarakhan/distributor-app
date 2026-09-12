import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Card, QtyStepper, ResultSheet, Screen, StickyActionBar, Text, type ResultState,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useCreateReturn, useOrder } from '@/src/hooks/data';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function CreateReturn() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { data, isLoading, error, refetch } = useOrder(orderId);
  const createReturn = useCreateReturn(orderId);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [result, setResult] = useState<ResultState | null>(null);

  const lines = data?.lines ?? [];
  const returnLines = lines
    .filter((l) => (qty[l.productId] ?? 0) > 0)
    .map((l) => ({ productId: l.productId, product: l.product, uom: l.uom, qty: qty[l.productId] }));

  const submit = () => {
    createReturn.mutate(
      { lines: returnLines },
      {
        onSuccess: (res) =>
          setResult({
            kind: 'success',
            title: t('createReturn.confirmedTitle'),
            description: t('createReturn.confirmedDescription'),
            referenceLabel: t('createReturn.orderLabel'),
            reference: res.orderReference,
          }),
        onError: (e) =>
          setResult({ kind: 'error', title: t('createReturn.couldNotConfirm'), description: errorMessage(e) }),
      },
    );
  };

  return (
    <>
      <Screen
        loading={isLoading}
        error={error}
        onRetry={refetch}
        footer={
          <StickyActionBar
            label={t('createReturn.confirm')}
            disabled={returnLines.length === 0}
            loading={createReturn.isPending}
            onPress={submit}
          />
        }>
        {data ? (
          <>
            <Text variant="h2">{data.reference}</Text>
            <Text tone="muted" variant="caption">{t('createReturn.hint')}</Text>
            {lines.map((l) => (
              <Card key={l.productId}>
                <Text variant="title">{l.product}</Text>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="caption" tone="muted">{t('createReturn.sold', { qty: l.qty, uom: l.uom })}</Text>
                  <QtyStepper
                    value={qty[l.productId] ?? 0}
                    onChange={(n) => setQty((s) => ({ ...s, [l.productId]: n }))}
                    max={l.qty}
                  />
                </View>
              </Card>
            ))}
          </>
        ) : null}
      </Screen>

      <ResultSheet
        state={result}
        primaryLabel={result?.kind === 'success' ? t('createReturn.backToOrder') : t('common.retry')}
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
