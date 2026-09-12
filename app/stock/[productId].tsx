import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card, DetailRow, Money, Screen, Text } from '@/src/components';
import { useProducts } from '@/src/hooks/data';

export default function ProductDetail() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const id = Number(productId);
  const { t } = useTranslation();
  // Van stock is a short, already-fetched catalog — reuse the list query's cache instead of a
  // second round trip for a single product.
  const { data: page, isLoading, error, refetch } = useProducts({});
  const data = page?.items.find((p) => p.id === id);

  return (
    <Screen loading={isLoading} error={error} onRetry={refetch} empty={!isLoading && !data}>
      {data ? (
        <>
          <Text variant="h1">{data.name}</Text>
          <Text tone="muted" variant="caption">{data.reference ?? '—'}</Text>

          <Card>
            <DetailRow label={t('productDetail.price')} valueNode={<Money value={data.price} currency={data.currency} variant="captionSemi" />} />
            <DetailRow label={t('productDetail.vanStock')} value={`${data.vanStock} ${data.uom}`} />
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
