import { useTranslation } from 'react-i18next';
import { Card, DetailRow, Money, Screen, SectionHeader, Text } from '@/src/components';
import { useOrders, useVisits } from '@/src/hooks/data';

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Phase 2 — a rep's end-of-shift reconciliation, computed client-side from what's already
// loaded (orders + visits) rather than a dedicated backend report the client never asked for.
export default function EodSummary() {
  const { t } = useTranslation();
  const orders = useOrders({});
  const visits = useVisits({});

  const todayOrders = (orders.data?.items ?? []).filter((o) => o.date === today());
  const invoicedToday = todayOrders.filter((o) => o.status === 'invoiced');
  const totalSales = invoicedToday.reduce((s, o) => s + o.total, 0);
  const currency = invoicedToday[0]?.currency ?? 'JOD';
  const returnsToday = todayOrders.filter((o) => o.hasReturn).length;

  const todaysVisits = visits.data?.items ?? [];
  const doneToday = todaysVisits.filter((v) => v.status === 'done');
  const orderedToday = doneToday.filter((v) => v.outcome === 'ordered');
  const noSaleToday = doneToday.filter((v) => v.outcome === 'no_sale');

  const loading = orders.isLoading || visits.isLoading;

  return (
    <Screen
      onRefresh={() => {
        orders.refetch();
        visits.refetch();
      }}
      loading={loading}
      error={orders.error ?? visits.error}
      onRetry={() => {
        orders.refetch();
        visits.refetch();
      }}>
      <Text tone="muted" variant="caption">{t('eodSummary.hint')}</Text>

      <SectionHeader title={t('eodSummary.sales')} />
      <Card>
        <DetailRow label={t('eodSummary.ordersConfirmed')} value={String(invoicedToday.length)} />
        <DetailRow label={t('eodSummary.totalSales')} valueNode={<Money value={totalSales} currency={currency} variant="title" />} />
        <DetailRow label={t('eodSummary.returns')} value={String(returnsToday)} />
      </Card>

      <SectionHeader title={t('eodSummary.visits')} />
      <Card>
        <DetailRow label={t('eodSummary.visitsDone')} value={String(doneToday.length)} />
        <DetailRow label={t('eodSummary.visitsOrdered')} value={String(orderedToday.length)} />
        <DetailRow label={t('eodSummary.visitsNoSale')} value={String(noSaleToday.length)} />
      </Card>
    </Screen>
  );
}
