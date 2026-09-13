import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, Button, Card, ConfirmSheet, DetailRow, Icon, MapsChooserSheet, Screen,
  StickyActionBar, Text,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useConfirmVisit, useCustomer, useVisit } from '@/src/hooks/data';
import { visitStatusKey, visitStatusTone } from '@/src/lib/status';
import { useMapsNavigate } from '@/src/lib/maps';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { usePhase } from '@/src/settings/PhaseProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function VisitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const visitId = Number(id);
  const { colors, spacing, radii } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { phase } = usePhase();
  const { data, isLoading, error, refetch, isRefetching } = useVisit(visitId);
  const customer = useCustomer(phase === 2 ? (data?.customerId ?? 0) : 0);
  const confirmVisit = useConfirmVisit(visitId);
  const [noSaleConfirm, setNoSaleConfirm] = useState(false);
  const [noSaleError, setNoSaleError] = useState<string | null>(null);
  const { chooserTarget, navigate, closeChooser } = useMapsNavigate();

  const openMaps = () => {
    if (!data?.address && data?.geoLat == null) return;
    navigate({ lat: data?.geoLat, lng: data?.geoLng, address: data?.address, city: data?.city });
  };
  const call = () => data?.phone && Linking.openURL(`tel:${data.phone.replace(/\s/g, '')}`);

  const planned = data?.status === 'planned';
  // Phase 2 only — Phase 1 has no check-in concept at all, so it must stay exactly as the
  // client asked: ordering always available once a visit is planned, no extra gate.
  const requireCheckIn = phase === 2 && !data?.checkIn;

  const markNoSale = () => {
    setNoSaleError(null);
    confirmVisit.mutate(
      { outcome: 'no_sale' },
      {
        onSuccess: () => setNoSaleConfirm(false),
        onError: (e) => setNoSaleError(errorMessage(e)),
      },
    );
  };

  return (
    <>
      <Screen
        onRefresh={refetch}
        refreshing={isRefetching}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        footer={
          planned ? (
            <StickyActionBar
              label={t('visitDetail.startOrder')}
              onPress={() => router.push(`/orders/new?visitId=${visitId}`)}
              disabled={requireCheckIn}
              secondaryLabel={t('visitDetail.noPurchase')}
              onSecondaryPress={() => setNoSaleConfirm(true)}
            />
          ) : undefined
        }>
        {data ? (
          <>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h1" style={{ flexShrink: 1 }}>{data.customerName}</Text>
              <Badge label={t(visitStatusKey[data.status])} tone={visitStatusTone[data.status]} />
            </View>

            <Pressable onPress={openMaps}>
              <Card style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.md }}>
                <Icon name="location-outline" color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="captionSemi">{data.address ?? '—'}</Text>
                  <Text variant="caption" tone="faint">{data.city ?? ''}</Text>
                </View>
                <Icon name="navigate" size={18} color={colors.primary} />
              </Card>
            </Pressable>

            <Card>
              <DetailRow label={t('visitDetail.scheduled')} value={data.scheduledTime ?? '—'} />
              <DetailRow
                label={t('visitDetail.phone')}
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

            {phase === 2 && customer.data ? (
              <Card>
                <DetailRow
                  label={t('creditCheck.balance')}
                  valueNode={
                    <Text
                      variant="captionSemi"
                      tone={customer.data.balance >= customer.data.creditLimit ? 'danger' : 'text'}>
                      {customer.data.balance.toFixed(0)} / {customer.data.creditLimit.toFixed(0)} {customer.data.currency}
                    </Text>
                  }
                />
              </Card>
            ) : null}

            {phase === 2 ? (
              <Pressable onPress={() => router.push(`/visits/${visitId}/checkin`)}>
                <Card style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing.md }}>
                  <Icon name="navigate-circle-outline" color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="captionSemi">{t('checkIn.title')}</Text>
                    <Text variant="caption" tone="faint">
                      {data.checkIn
                        ? t('checkIn.metersAway', { distance: data.checkIn.distanceMeters })
                        : t('checkIn.notYet')}
                    </Text>
                  </View>
                  <Icon name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textFaint} />
                </Card>
              </Pressable>
            ) : null}
            {requireCheckIn ? (
              <Text variant="caption" tone="warning" style={{ marginTop: -spacing.sm }}>
                {t('checkIn.requiredHint')}
              </Text>
            ) : null}

            {data.photoUri ? (
              <Card>
                <Text variant="captionSemi" tone="muted">{t('checkIn.photoLabel')}</Text>
                <Image source={{ uri: data.photoUri }} style={{ width: '100%', height: 160, borderRadius: radii.md }} />
              </Card>
            ) : null}

            {!planned ? (
              <Card>
                {data.outcome === 'ordered' && data.orderId ? (
                  <>
                    <Text variant="captionSemi" tone="success">{t('visitDetail.outcomeOrdered')}</Text>
                    <Button
                      variant="secondary"
                      title={t('visitDetail.viewOrder')}
                      onPress={() => router.push(`/orders/${data.orderId}`)}
                    />
                  </>
                ) : (
                  <>
                    <Text variant="captionSemi" tone="muted">{t('visitDetail.outcomeNoSale')}</Text>
                    {data.note ? <Text variant="caption" tone="faint">{data.note}</Text> : null}
                  </>
                )}
              </Card>
            ) : null}
          </>
        ) : null}
      </Screen>

      <ConfirmSheet
        visible={noSaleConfirm}
        title={t('visitDetail.noPurchaseConfirmTitle')}
        description={noSaleError ?? t('visitDetail.noPurchaseConfirmDescription')}
        confirmLabel={t('visitDetail.noPurchase')}
        onConfirm={markNoSale}
        onCancel={() => setNoSaleConfirm(false)}
      />

      <MapsChooserSheet target={chooserTarget} onClose={closeChooser} />
    </>
  );
}
