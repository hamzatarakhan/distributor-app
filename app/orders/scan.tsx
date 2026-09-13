import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text } from '@/src/components';
import { useProducts } from '@/src/hooks/data';
import { useTheme } from '@/src/theme/ThemeProvider';

// Phase 2 — matches a scanned barcode against the product catalog's `reference` field, then
// hands the match back to the order builder via a route param (expo-router has no other
// cross-screen channel for "add this one item" without a global store, and a full store is
// more than this needs).
export default function ScanBarcode() {
  const { visitId } = useLocalSearchParams<{ visitId?: string }>();
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);
  const products = useProducts({});

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    const match = products.data?.items.find((p) => p.reference === data || String(p.id) === data);
    if (match) {
      router.replace(`/orders/new?visitId=${visitId ?? ''}&addProductId=${match.id}`);
    } else {
      setNotFound(data);
    }
  };

  if (!permission) return <Screen loading />;

  if (!permission.granted) {
    return (
      <Screen>
        <Text>{t('barcodeScan.permissionHint')}</Text>
        <Button title={t('barcodeScan.grantPermission')} onPress={requestPermission} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      <View style={{ padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.card }}>
        <Text variant="caption" tone="muted" style={{ textAlign: 'center' }}>
          {t('barcodeScan.hint')}
        </Text>
        {notFound ? (
          <>
            <Text tone="danger" variant="caption" style={{ textAlign: 'center' }}>
              {t('barcodeScan.notFound', { code: notFound })}
            </Text>
            <Button
              variant="secondary"
              title={t('barcodeScan.tryAgain')}
              onPress={() => {
                setScanned(false);
                setNotFound(null);
              }}
            />
          </>
        ) : null}
        <Button variant="ghost" title={t('common.cancel')} onPress={() => router.back()} />
      </View>
    </View>
  );
}
