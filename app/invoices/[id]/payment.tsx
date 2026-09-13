import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Button, Card, ResultSheet, Screen, Text, type ResultState,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useInvoice, useRecordPayment } from '@/src/hooks/data';
import type { PaymentMethod } from '@/src/api/types';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function RecordPayment() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = Number(id);
  const { colors, spacing, radii } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { data } = useInvoice(invoiceId);
  const recordPayment = useRecordPayment(invoiceId);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amount, setAmount] = useState(data ? String(data.amountDue) : '');
  const [result, setResult] = useState<ResultState | null>(null);

  const numericAmount = parseFloat(amount.replace(',', '.'));
  const valid = !isNaN(numericAmount) && numericAmount > 0 && data && numericAmount <= data.amountDue;

  const submit = () => {
    if (!valid) return;
    recordPayment.mutate(
      { method, amount: numericAmount },
      {
        onSuccess: () =>
          setResult({ kind: 'success', title: t('recordPayment.savedTitle'), description: t('recordPayment.savedDescription') }),
        onError: (e) => setResult({ kind: 'error', title: t('recordPayment.couldNotSave'), description: errorMessage(e) }),
      },
    );
  };

  const methodButton = (m: PaymentMethod, label: string) => (
    <Button
      variant={method === m ? 'primary' : 'secondary'}
      title={label}
      onPress={() => setMethod(m)}
      style={{ flex: 1 }}
    />
  );

  return (
    <>
      <Screen>
        {data ? (
          <Card>
            <Text tone="muted" variant="caption">{t('recordPayment.amountDue')}</Text>
            <Text variant="h1">{data.amountDue.toFixed(2)} {data.currency}</Text>
          </Card>
        ) : null}

        <Text variant="captionSemi" tone="muted">{t('recordPayment.methodLabel')}</Text>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: spacing.sm }}>
          {methodButton('cash', t('recordPayment.cash'))}
          {methodButton('cheque', t('recordPayment.cheque'))}
        </View>

        <Text variant="captionSemi" tone="muted">{t('recordPayment.amountLabel')}</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: radii.md,
            padding: 12,
            color: colors.text,
            fontSize: 15,
          }}
        />

        <Button title={t('recordPayment.save')} onPress={submit} disabled={!valid} loading={recordPayment.isPending} fullWidth />
      </Screen>

      <ResultSheet
        state={result}
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
