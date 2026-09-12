import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Badge, Button, Card, ConfirmSheet, DetailRow, Icon, Screen, StickyActionBar, Text,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useConfirmVisit, useVisit } from '@/src/hooks/data';
import { visitStatusKey, visitStatusTone } from '@/src/lib/status';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function VisitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const visitId = Number(id);
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const { data, isLoading, error, refetch, isRefetching } = useVisit(visitId);
  const confirmVisit = useConfirmVisit(visitId);
  const [noSaleConfirm, setNoSaleConfirm] = useState(false);
  const [noSaleError, setNoSaleError] = useState<string | null>(null);

  const openMaps = () => {
    if (!data?.address) return;
    const q = encodeURIComponent(`${data.address}, ${data.city ?? ''}`);
    Linking.openURL(`geo:0,0?q=${q}`);
  };
  const call = () => data?.phone && Linking.openURL(`tel:${data.phone.replace(/\s/g, '')}`);

  const planned = data?.status === 'planned';

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
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, padding: spacing.lg, gap: spacing.sm }}>
              <StickyActionBar
                label={t('visitDetail.startOrder')}
                onPress={() => router.push(`/orders/new?visitId=${visitId}`)}
              />
              <Button
                variant="ghost"
                title={t('visitDetail.noPurchase')}
                onPress={() => setNoSaleConfirm(true)}
              />
            </View>
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
    </>
  );
}
