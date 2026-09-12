import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
            title: t('deliveryConfirm.confirmedTitle'),
            description: t('deliveryConfirm.confirmedDescription'),
            referenceLabel: t('deliveryConfirm.pickingLabel'),
            reference: res.reference,
          }),
        onError: (e) =>
          setResult({ kind: 'error', title: t('deliveryConfirm.couldNotConfirm'), description: errorMessage(e) }),
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
            label={t('deliveryConfirm.confirmDelivery')}
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
              <Text tone="primary" variant="caption">{t('deliveryConfirm.deliverAll')}</Text>
            </Pressable>

            {lines.map((l) => (
              <Card key={l.id}>
                <Text variant="title">{l.product}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text variant="caption" tone="muted">{t('deliveryConfirm.ordered', { qty: l.demandQty, uom: l.uom })}</Text>
                  <QtyStepper
                    value={q(l.id, l.demandQty)}
                    onChange={(n) => setQty((s) => ({ ...s, [l.id]: n }))}
                    max={l.demandQty}
                  />
                </View>
              </Card>
            ))}

            <Text variant="captionSemi" tone="muted" style={{ marginTop: spacing.sm }}>{t('deliveryConfirm.noteLabel')}</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={t('deliveryConfirm.notePlaceholder')}
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
              <Button variant="ghost" title={t('deliveryConfirm.devSimulateFailure')} onPress={() => submit(true)} />
            ) : null}
          </>
        ) : null}
      </Screen>

      <ResultSheet
        state={result}
        primaryLabel={result?.kind === 'success' ? t('deliveryConfirm.backToDeliveries') : t('common.retry')}
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
