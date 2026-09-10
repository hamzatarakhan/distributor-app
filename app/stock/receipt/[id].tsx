import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  Badge, Card, DetailRow, QtyStepper, ResultSheet, Screen, StickyActionBar, Text,
  type ResultState,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useConfirmReceipt, useReceipt } from '@/src/hooks/data';
import { pickingStatus } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const receiptId = Number(id);
  const { colors, spacing } = useTheme();
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
            title: 'Receipt confirmed',
            description: 'Stock has been updated.',
            referenceLabel: 'Receipt',
            reference: res.reference,
          }),
        onError: (e) =>
          setResult({ kind: 'error', title: 'Could not confirm', description: errorMessage(e) }),
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
              label="Confirm receipt"
              loading={confirm.isPending}
              onPress={() => submit()}
            />
          ) : undefined
        }>
        {data ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h1">{data.reference}</Text>
              <Badge {...pickingStatus[data.status]} />
            </View>
            <Card>
              <DetailRow label="Supplier" value={data.partnerName ?? '—'} />
              <DetailRow label="Source" value={data.sourceDocument ?? '—'} />
              <DetailRow label="Scheduled" value={data.scheduledDate ?? '—'} />
            </Card>

            <Text variant="h2" style={{ marginTop: spacing.sm }}>Items</Text>
            {lines.map((l) => (
              <Card key={l.id}>
                <Text variant="title">{l.product}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="caption" tone="muted">Demand {l.demandQty} {l.uom}</Text>
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
                Only receipts in “Ready” state can be confirmed here.
              </Text>
            ) : null}
          </>
        ) : null}
      </Screen>

      <ResultSheet
        state={result}
        primaryLabel={result?.kind === 'success' ? 'Back to receipts' : 'Retry'}
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
