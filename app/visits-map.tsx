import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/src/components';
import { useVisits } from '@/src/hooks/data';
import { visitStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

// Phase 2. Android needs a Google Maps API key configured (app.json > android.config.googleMaps)
// before tiles render there — without one the map still loads, just blank/grey. iOS uses Apple
// Maps by default and needs no key.
export default function VisitsMap() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const visits = useVisits({});
  const items = (visits.data?.items ?? []).filter((v) => v.geoLat != null && v.geoLng != null);

  const toneColor = {
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    neutral: colors.textFaint,
    special: colors.primary,
  } as const;

  return (
    <Screen
      padded={false}
      scroll={false}
      loading={visits.isLoading}
      error={visits.error}
      onRetry={visits.refetch}
      empty={!visits.isLoading && items.length === 0}
      emptyText={t('visitsMap.emptyText')}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: items[0]?.geoLat ?? 31.9552,
          longitude: items[0]?.geoLng ?? 35.9106,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}>
        {items.map((v) => (
          <Marker
            key={v.id}
            coordinate={{ latitude: v.geoLat!, longitude: v.geoLng! }}
            title={v.customerName}
            description={v.scheduledTime}
            pinColor={toneColor[visitStatusTone[v.status]]}
            onCalloutPress={() => router.push(`/visits/${v.id}`)}
          />
        ))}
      </MapView>
    </Screen>
  );
}
