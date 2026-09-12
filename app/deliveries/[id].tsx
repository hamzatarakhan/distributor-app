import { router, useLocalSearchParams } from 'expo-router';
import { ActionSheetIOS, Linking, Platform, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge, Card, DetailRow, Icon, Screen, StickyActionBar, Text } from '@/src/components';
import { useDelivery } from '@/src/hooks/data';
import { pickingStatusKey, pickingStatusTone } from '@/src/lib/status';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function DeliveryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deliveryId = Number(id);
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { data, isLoading, error, refetch, isRefetching } = useDelivery(deliveryId);

  // Android's `geo:` scheme already prompts the OS app-chooser when more than one maps app is
  // installed. iOS' `maps://` always opens Apple Maps directly, so on iOS we ask first.
  const openInAppleMaps = (q: string) => Linking.openURL(`maps://?q=${q}`);
  const openInGoogleMaps = async (q: string) => {
    const appUrl = `comgooglemaps://?q=${q}`;
    if (await Linking.canOpenURL(appUrl)) Linking.openURL(appUrl);
    else Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  };
  const openMaps = () => {
    if (!data?.deliveryAddress) return;
    const q = encodeURIComponent(`${data.deliveryAddress}, ${data.deliveryCity ?? ''}`);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('deliveryDetail.appleMaps'), t('deliveryDetail.googleMaps'), t('common.cancel')],
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) openInAppleMaps(q);
          else if (index === 1) openInGoogleMaps(q);
        },
      );
    } else {
      Linking.openURL(`geo:0,0?q=${q}`);
    }
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
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h1" style={{ flexShrink: 1 }}>{data.partnerName}</Text>
            <Badge label={t(pickingStatusKey[data.status])} tone={pickingStatusTone[data.status]} />
          </View>

          <Pressable onPress={openMaps}>
            <Card style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.md }}>
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
            <Card key={l.id} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="title" style={{ flexShrink: 1 }}>{l.product}</Text>
              <Text variant="bodySemi">{l.doneQty}/{l.demandQty} {l.uom}</Text>
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}
