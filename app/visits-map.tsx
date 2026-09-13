import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen, Text } from '@/src/components';
import { useVisits } from '@/src/hooks/data';
import { visitStatusTone } from '@/src/lib/status';
import { useTheme } from '@/src/theme/ThemeProvider';

// react-native-maps is a third-party native module. expo-router's file-based routing requires
// every file under app/ to build its route table, so a plain top-level `import` here would run
// at app STARTUP (not only when this screen opens) — if the module isn't actually linked in
// this Expo Go build, that crashes the whole app, Phase 1 included. Deferred + guarded require
// means a missing module degrades to a message on this one screen instead.
let MapView: any = null;
let Marker: any = null;
try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
} catch {
  // not available in this runtime — screen below shows a fallback instead of crashing
}

// Android needs a Google Maps API key configured (app.json > android.config.googleMaps) before
// tiles render — without one the map still loads, just blank/grey. iOS uses Apple Maps by
// default and needs no key.
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

  if (!MapView) {
    return (
      <Screen>
        <Text tone="muted">{t('visitsMap.unavailable')}</Text>
      </Screen>
    );
  }

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
