import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { InvoiceApi } from '@/src/api/resources';
import {
  Badge, Button, Card, DetailRow, Divider, Money, Screen, Text,
} from '@/src/components';
import { useInvoice } from '@/src/hooks/data';
import { invoiceStatus, isOverdue } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = Number(id);
  const { spacing } = useTheme();
  const { data, isLoading, error, refetch, isRefetching } = useInvoice(invoiceId);
  const [pdfBusy, setPdfBusy] = useState(false);

  const openPdf = async () => {
    setPdfBusy(true);
    try {
      const url = data?.pdfUrl ?? (await InvoiceApi.pdf(invoiceId)).url;
      if (url) await Linking.openURL(url);
    } catch {
      // surface nothing loud — placeholder until the real report endpoint is wired
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <Screen
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}>
      {data ? (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h1">{data.number}</Text>
            <Badge {...invoiceStatus[data.status]} />
          </View>
          <Text tone="muted">{data.customerName}</Text>

          <Card>
            <DetailRow label="Invoice date" value={data.invoiceDate} />
            <DetailRow
              label="Due date"
              valueNode={
                <Text
                  variant="captionSemi"
                  tone={isOverdue(data.dueDate, data.amountDue) ? 'danger' : 'text'}>
                  {data.dueDate ?? '—'}
                </Text>
              }
            />
          </Card>

          <Text variant="h2" style={{ marginTop: spacing.sm }}>Lines</Text>
          <Card>
            {(data.lines ?? []).map((l, i) => (
              <View key={l.id}>
                {i > 0 ? <Divider /> : null}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                  <Text variant="caption" style={{ flex: 1 }}>{l.description}</Text>
                  <Text variant="caption" tone="muted">{l.qty} × {l.unitPrice}</Text>
                </View>
                <Text variant="captionSemi" style={{ textAlign: 'right' }}>
                  <Money value={l.subtotal} currency={data.currency} variant="captionSemi" />
                </Text>
              </View>
            ))}
          </Card>

          <Card>
            <DetailRow label="Untaxed" valueNode={<Money value={data.amountUntaxed} currency={data.currency} variant="captionSemi" />} />
            <DetailRow label="Tax" valueNode={<Money value={data.amountTax} currency={data.currency} variant="captionSemi" />} />
            <Divider />
            <DetailRow label="Total" valueNode={<Money value={data.amountTotal} currency={data.currency} variant="title" />} />
            <DetailRow label="Amount due" valueNode={
              <Money value={data.amountDue} currency={data.currency} variant="title"
                tone={data.amountDue > 0 ? 'danger' : 'success'} />
            } />
          </Card>

          <Button variant="secondary" icon="document-outline" title="View / download PDF" onPress={openPdf} loading={pdfBusy} />
        </>
      ) : null}
    </Screen>
  );
}
