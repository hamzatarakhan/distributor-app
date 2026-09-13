import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, MapsChooserSheet, Screen, Text } from '@/src/components';
import { useVisits } from '@/src/hooks/data';
import { distanceMeters } from '@/src/lib/geo';
import { useMapsNavigate } from '@/src/lib/maps';
import { visitStatusKey, visitStatusTone } from '@/src/lib/status';
import type { Visit } from '@/src/api/types';
import { useLocale } from '@/src/i18n/LocaleProvider';
import { useTheme } from '@/src/theme/ThemeProvider';

type GeoVisit = Visit & { geoLat: number; geoLng: number };

// Greedy nearest-neighbor from the rep's current spot — not the mathematically optimal route
// (that's the NP-hard traveling-salesman problem), but for a handful of stops in one day it gets
// close enough without pulling in a routing library.
function nearestFirst(start: { lat: number; lng: number }, points: GeoVisit[]): GeoVisit[] {
  const remaining = [...points];
  const ordered: GeoVisit[] = [];
  let current = start;
  while (remaining.length) {
    let bestIndex = 0;
    let bestDist = Infinity;
    remaining.forEach((p, i) => {
      const d = distanceMeters(current.lat, current.lng, p.geoLat, p.geoLng);
      if (d < bestDist) { bestDist = d; bestIndex = i; }
    });
    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next);
    current = { lat: next.geoLat, lng: next.geoLng };
  }
  return ordered;
}

// react-native-maps is a third-party native module. expo-router's file-based routing requires
// every file under app/ to build its route table, so a plain top-level `import` here would run
// at app STARTUP (not only when this screen opens) — if the module isn't actually linked in
// this Expo Go build, that crashes the whole app, Phase 1 included. Deferred + guarded require
// means a missing module degrades to a message on this one screen instead.
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
} catch {
  // not available in this runtime — screen below shows a fallback instead of crashing
}

// Android needs a Google Maps API key configured (app.json > android.config.googleMaps) before
// tiles render — without one the map still loads, just blank/grey. iOS uses Apple Maps by
// default and needs no key.
export default function VisitsMap() {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useLocale();
  const visits = useVisits({});
  const { chooserTarget, navigate, closeChooser } = useMapsNavigate();
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {
        // no location, no problem — falls back to scheduled-time order below
      }
    })();
  }, []);

  const byTime = useMemo(
    () =>
      (visits.data?.items ?? [])
        .filter((v): v is GeoVisit => v.geoLat != null && v.geoLng != null)
        .sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '')),
    [visits.data],
  );
  // Reorder nearest-stop-first from wherever the rep actually is right now, once we have that —
  // otherwise the schedule order (set above) is exactly what shows.
  const items = useMemo(
    () => (myLocation ? nearestFirst(myLocation, byTime) : byTime),
    [myLocation, byTime],
  );

  // Straight-line, not a real route — a rough "how far apart are today's stops" figure, not
  // turn-by-turn driving distance (that would need a routing API/key we don't have).
  const routeKm = useMemo(() => {
    let sum = 0;
    let from = myLocation;
    for (const v of items) {
      if (from) sum += distanceMeters(from.lat, from.lng, v.geoLat, v.geoLng);
      from = { lat: v.geoLat, lng: v.geoLng };
    }
    return sum / 1000;
  }, [items, myLocation]);

  const doneCount = items.filter((v) => v.status === 'done').length;

  const toneColor = {
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    neutral: colors.textFaint,
    special: colors.special,
  } as const;

  if (!MapView) {
    return (
      <Screen>
        <Text tone="muted">{t('visitsMap.unavailable')}</Text>
      </Screen>
    );
  }

  return (
    <>
      <Screen
        padded={false}
        scroll={false}
        loading={visits.isLoading}
        error={visits.error}
        onRetry={visits.refetch}
        empty={!visits.isLoading && items.length === 0}
        emptyText={t('visitsMap.emptyText')}
        header={
          items.length > 0 ? (
            <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
              <Card style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <Text variant="h2">{items.length}</Text>
                  <Text variant="caption" tone="muted">{t('visitsMap.stopsLabel')}</Text>
                </View>
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <Text variant="h2" tone="success">{doneCount}/{items.length}</Text>
                  <Text variant="caption" tone="muted">{t('visitsMap.doneLabel')}</Text>
                </View>
                <View style={{ alignItems: 'center', gap: 2 }}>
                  <Text variant="h2">{routeKm.toFixed(1)}</Text>
                  <Text variant="caption" tone="muted">{t('visitsMap.kmLabel')}</Text>
                </View>
              </Card>
              <Text variant="caption" tone="faint" style={{ textAlign: 'center', marginTop: 6 }}>
                {myLocation ? t('visitsMap.nearestFirst') : t('visitsMap.scheduleOrder')}
              </Text>
            </View>
          ) : null
        }>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: myLocation?.lat ?? items[0]?.geoLat ?? 31.9552,
            longitude: myLocation?.lng ?? items[0]?.geoLng ?? 35.9106,
            latitudeDelta: 0.3,
            longitudeDelta: 0.3,
          }}>
          {items.length > 0 ? (
            <Polyline
              coordinates={[
                ...(myLocation ? [{ latitude: myLocation.lat, longitude: myLocation.lng }] : []),
                ...items.map((v) => ({ latitude: v.geoLat, longitude: v.geoLng })),
              ]}
              strokeColor={colors.primary}
              strokeWidth={3}
              lineDashPattern={[8, 6]}
            />
          ) : null}
          {myLocation ? (
            <Marker coordinate={{ latitude: myLocation.lat, longitude: myLocation.lng }} title={t('visitsMap.youAreHere')}>
              <View style={{
                width: 18, height: 18, borderRadius: 9,
                backgroundColor: colors.info, borderWidth: 3, borderColor: colors.card,
              }} />
            </Marker>
          ) : null}
          {items.map((v, i) => (
            <Marker
              key={v.id}
              coordinate={{ latitude: v.geoLat, longitude: v.geoLng }}
              title={`${i + 1}. ${v.customerName}`}
              description={`${v.scheduledTime ?? ''} · ${t(visitStatusKey[v.status])}`}
              // A single tap must trigger this directly — react-native-maps requires a second
              // tap on the callout bubble for onCalloutPress, which nobody discovers on their own.
              onPress={() => navigate({ lat: v.geoLat, lng: v.geoLng })}>
              <View
                style={{
                  width: 30, height: 30, borderRadius: 15,
                  backgroundColor: toneColor[visitStatusTone[v.status]],
                  borderWidth: 2, borderColor: colors.card,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Text variant="captionSemi" style={{ color: colors.onPrimary }}>{i + 1}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      </Screen>

      <MapsChooserSheet target={chooserTarget} onClose={closeChooser} />
    </>
  );
}
