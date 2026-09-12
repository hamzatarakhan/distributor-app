import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Card, DetailRow, Icon, Screen, StickyActionBar, Text } from '@/src/components';
import { useDelivery } from '@/src/hooks/data';
import { pickingStatusKey, pickingStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function DeliveryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deliveryId = Number(id);
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { data, isLoading, error, refetch, isRefetching } = useDelivery(deliveryId);

  const openMaps = () => {
    if (!data?.deliveryAddress) return;
    const q = encodeURIComponent(`${data.deliveryAddress}, ${data.deliveryCity ?? ''}`);
    Linking.openURL(Platform.select({ ios: `maps://?q=${q}`, default: `geo:0,0?q=${q}` })!);
  };
  const call = () => data?.phone && Linking.openURL(`tel:${data.phone.replace(/\s/g, '')}`);

  const done = data?.status === 'done';

  return (
    <Screen
      onRefresh={refetch}
      refreshing={isRefetching}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      footer={
        data ? (
          <StickyActionBar
            label={done ? t('deliveryDetail.delivered') : t('deliveryDetail.startConfirmation')}
            disabled={done}
            onPress={() => router.push(`/deliveries/confirm/${deliveryId}`)}
          />
        ) : undefined
      }>
      {data ? (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h1" style={{ flexShrink: 1 }}>{data.partnerName}</Text>
            <Badge label={t(pickingStatusKey[data.status])} tone={pickingStatusTone[data.status]} />
          </View>

          <Pressable onPress={openMaps}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Icon name="location-outline" color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="captionSemi">{data.deliveryAddress ?? '—'}</Text>
                <Text variant="caption" tone="faint">{data.deliveryCity ?? ''}</Text>
              </View>
              <Icon name="navigate" size={18} color={colors.primary} />
            </Card>
          </Pressable>

          <Card>
            <DetailRow label={t('deliveryDetail.reference')} value={data.reference} />
            <DetailRow label={t('deliveryDetail.saleOrder')} value={data.saleOrderRef ?? '—'} />
            <DetailRow label={t('deliveryDetail.scheduled')} value={data.scheduledDate ?? '—'} />
            <DetailRow
              label={t('deliveryDetail.phone')}
              valueNode={
                data.phone ? (
                  <Pressable onPress={call}>
                    <Text variant="captionSemi" tone="primary">{data.phone}</Text>
                  </Pressable>
                ) : (
                  <Text variant="captionSemi">—</Text>
                )
              }
            />
          </Card>

          <Text variant="h2" style={{ marginTop: spacing.sm }}>{t('deliveryDetail.items')}</Text>
          {(data.lines ?? []).map((l) => (
            <Card key={l.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="title" style={{ flexShrink: 1 }}>{l.product}</Text>
              <Text variant="bodySemi">{l.doneQty}/{l.demandQty} {l.uom}</Text>
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
