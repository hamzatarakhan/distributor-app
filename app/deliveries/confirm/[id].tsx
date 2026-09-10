import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import {
  Button, Card, QtyStepper, ResultSheet, Screen, StickyActionBar, Text, type ResultState,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useConfirmDelivery, useDelivery } from '@/src/hooks/data';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function ConfirmDelivery() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deliveryId = Number(id);
  const { colors, spacing, radii } = useTheme();
  const { data, isLoading, error, refetch } = useDelivery(deliveryId);
  const confirm = useConfirmDelivery(deliveryId);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [note, setNote] = useState('');
  const [result, setResult] = useState<ResultState | null>(null);

  const lines = data?.lines ?? [];
  const q = (lineId: number, fallback: number) => qty[lineId] ?? fallback;

  const submit = (fail?: boolean) => {
    confirm.mutate(
      { lines: lines.map((l) => ({ id: l.id, doneQty: q(l.id, l.demandQty) })), note, fail },
      {
        onSuccess: (res) =>
          setResult({
            kind: 'success',
            title: 'Delivery confirmed',
            description: 'The customer’s order is marked delivered.',
            referenceLabel: 'Picking',
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
        loading={isLoading}
        error={error}
        onRetry={refetch}
        footer={
          <StickyActionBar
            label="Confirm delivery"
            loading={confirm.isPending}
            onPress={() => submit()}
          />
        }>
        {data ? (
          <>
            <Text variant="h2">{data.partnerName}</Text>
            <Pressable
              onPress={() =>
                setQty(Object.fromEntries(lines.map((l) => [l.id, l.demandQty])))
              }
              style={{ alignSelf: 'flex-start' }}>
              <Text tone="primary" variant="caption">Deliver all ordered quantities</Text>
            </Pressable>

            {lines.map((l) => (
              <Card key={l.id}>
                <Text variant="title">{l.product}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="caption" tone="muted">Ordered {l.demandQty} {l.uom}</Text>
                  <QtyStepper
                    value={q(l.id, l.demandQty)}
                    onChange={(n) => setQty((s) => ({ ...s, [l.id]: n }))}
                    max={l.demandQty}
                  />
                </View>
              </Card>
            ))}

            <Text variant="captionSemi" tone="muted" style={{ marginTop: spacing.sm }}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Anything the office should know"
              placeholderTextColor={colors.textFaint}
              multiline
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radii.md,
                padding: 12,
                color: colors.text,
                minHeight: 72,
                textAlignVertical: 'top',
              }}
            />

            {__DEV__ ? (
              <Button variant="ghost" title="Dev: simulate a failure" onPress={() => submit(true)} />
            ) : null}
          </>
        ) : null}
      </Screen>

      <ResultSheet
        state={result}
        primaryLabel={result?.kind === 'success' ? 'Back to deliveries' : 'Retry'}
        onPrimary={() => {
          const ok = result?.kind === 'success';
          setResult(null);
          if (ok) router.replace('/(tabs)/deliveries');
          else submit();
        }}
        onCancel={result?.kind === 'error' ? () => setResult(null) : undefined}
      />
    </>
  );
}
