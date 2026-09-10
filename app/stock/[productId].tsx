import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Card, DetailRow, Divider, Screen, SectionHeader, Text } from '@/src/components';
import { useProduct } from '@/src/hooks/data';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function ProductDetail() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const id = Number(productId);
  const { data, isLoading, error, refetch, isRefetching } = useProduct(id);
  const { spacing } = useTheme();

  return (
    <Screen
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}>
      {data ? (
        <>
          <Text variant="h1">{data.name}</Text>
          <Text tone="muted" variant="caption">{data.reference ?? '—'}</Text>

          <Card>
            <DetailRow label="On hand" value={`${data.onHand} ${data.uom}`} />
            <DetailRow label="Forecasted" value={`${data.forecasted} ${data.uom}`} />
            <DetailRow label="Reserved" value={`${data.reserved} ${data.uom}`} />
            <DetailRow label="Incoming" value={`${data.incoming} ${data.uom}`} />
            <DetailRow label="Outgoing" value={`${data.outgoing} ${data.uom}`} />
            {data.reorderPoint != null ? (
              <DetailRow label="Reorder point" value={`${data.reorderPoint} ${data.uom}`} />
            ) : null}
          </Card>

          {data.byLocation?.length ? (
            <>
              <SectionHeader title="By location" />
              <Card>
                {data.byLocation.map((l, i) => (
                  <View key={l.location}>
                    {i > 0 ? <Divider /> : null}
                    <DetailRow label={l.location} value={`${l.qty} ${data.uom}`} />
                  </View>
                ))}
              </Card>
            </>
          ) : null}

          <SectionHeader title="Recent moves" />
          {data.moves.length === 0 ? (
            <Card><Text tone="muted" variant="caption">No recent moves.</Text></Card>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {data.moves.map((m) => (
                <Card key={m.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="captionSemi">{m.from} → {m.to}</Text>
                    <Text variant="captionSemi" tone={m.qty < 0 ? 'danger' : 'success'}>
                      {m.qty > 0 ? '+' : ''}{m.qty} {m.uom}
                    </Text>
                  </View>
                  <Text variant="caption" tone="faint">{m.date} · {m.reference ?? ''}</Text>
                </Card>
              ))}
            </View>
          )}
        </>
      ) : null}
    </Screen>
  );
}
