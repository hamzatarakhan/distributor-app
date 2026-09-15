import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Share, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { InvoiceApi } from '@/src/api/resources';
import {
  Badge, Button, Card, DetailRow, Divider, Money, Screen, Text,
} from '@/src/components';
import { useAuth } from '@/src/auth/AuthContext';
import { useInvoice } from '@/src/hooks/data';
import { invoiceStatusKey, invoiceStatusTone, isOverdue } from '@/src/lib/status';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { usePhase } from '@/src/settings/PhaseProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = Number(id);
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { phase } = usePhase();
  const { session } = useAuth();
  const { data, isLoading, error, refetch, isRefetching } = useInvoice(invoiceId);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);

  const resolvePdfUrl = async () => data?.pdfUrl ?? (await InvoiceApi.pdf(invoiceId)).url;

  const openPdf = async () => {
    setPdfBusy(true);
    try {
      const url = await resolvePdfUrl();
      if (url) await Linking.openURL(url);
    } catch {
      // surface nothing loud — placeholder until the real report endpoint is wired
    } finally {
      setPdfBusy(false);
    }
  };

  // "Print it from the app" is still open with the client — could mean a paired Bluetooth
  // receipt printer (needs a dedicated SDK) or just printing the PDF from the phone. This uses
  // only the OS share sheet (no extra dependency): iOS lists "Print" among its share targets for
  // a PDF/URL, and Android forwards to whatever print service is installed. Swap this for a
  // printer SDK call once the client confirms which one they mean.
  const printOrShare = async () => {
    setPrintBusy(true);
    try {
      const url = await resolvePdfUrl();
      if (url) await Share.share({ url, message: url, title: data?.number });
    } catch {
      // same as openPdf — nothing loud, this is placeholder behavior
    } finally {
      setPrintBusy(false);
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
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h1">{data.number}</Text>
            <Badge label={t(invoiceStatusKey[data.status])} tone={invoiceStatusTone[data.status]} />
          </View>
          <Text tone="muted">{data.customerName}</Text>

          <Card>
            {session?.role === 'manager' && data.repName ? (
              <DetailRow label={t('assignVisit.repLabel')} value={data.repName} />
            ) : null}
            <DetailRow label={t('invoiceDetail.invoiceDate')} value={data.invoiceDate} />
            <DetailRow
              label={t('invoiceDetail.dueDate')}
              valueNode={
                <Text
                  variant="captionSemi"
                  tone={isOverdue(data.dueDate, data.amountDue) ? 'danger' : 'text'}>
                  {data.dueDate ?? '—'}
                </Text>
              }
            />
          </Card>

          <Text variant="h2" style={{ marginTop: spacing.sm }}>{t('invoiceDetail.lines')}</Text>
          <Card>
            {(data.lines ?? []).map((l, i) => (
              <View key={l.id}>
                {i > 0 ? <Divider /> : null}
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', gap: spacing.md }}>
                  <Text variant="caption" style={{ flex: 1 }}>{l.description}</Text>
                  <Text variant="caption" tone="muted">{l.qty} × {l.unitPrice}</Text>
                </View>
                <Text variant="captionSemi" style={{ textAlign: isRTL ? 'left' : 'right' }}>
                  <Money value={l.subtotal} currency={data.currency} variant="captionSemi" />
                </Text>
              </View>
            ))}
          </Card>

          <Card>
            <DetailRow label={t('invoiceDetail.untaxed')} valueNode={<Money value={data.amountUntaxed} currency={data.currency} variant="captionSemi" />} />
            <DetailRow label={t('invoiceDetail.tax')} valueNode={<Money value={data.amountTax} currency={data.currency} variant="captionSemi" />} />
            <Divider />
            <DetailRow label={t('invoiceDetail.total')} valueNode={<Money value={data.amountTotal} currency={data.currency} variant="title" />} />
            <DetailRow label={t('invoiceDetail.amountDue')} valueNode={
              <Money value={data.amountDue} currency={data.currency} variant="title"
                tone={data.amountDue > 0 ? 'danger' : 'success'} />
            } />
          </Card>

          {phase === 2 && (data.payments?.length ?? 0) > 0 ? (
            <Card>
              <Text variant="captionSemi" tone="muted">{t('recordPayment.history')}</Text>
              {data.payments!.map((p) => (
                <DetailRow
                  key={p.id}
                  label={p.date}
                  valueNode={
                    <Text variant="captionSemi">
                      {t(p.method === 'cash' ? 'recordPayment.cash' : 'recordPayment.cheque')} · {p.amount.toFixed(2)} {data.currency}
                    </Text>
                  }
                />
              ))}
            </Card>
          ) : null}

          {phase === 2 && data.amountDue > 0 ? (
            <Button title={t('recordPayment.title')} onPress={() => router.push(`/invoices/${invoiceId}/payment`)} fullWidth />
          ) : null}
          <Button variant="secondary" icon="document-outline" title={t('invoiceDetail.viewPdf')} onPress={openPdf} loading={pdfBusy} />
          <Button variant="secondary" icon="print-outline" title={t('invoiceDetail.print')} onPress={printOrShare} loading={printBusy} />
        </>
      ) : null}
    </Screen>
  );
}
