import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Button, Card, ResultSheet, Screen, Text, type ResultState,
} from '@/src/components';
import { errorMessage } from '@/src/components/ErrorBanner';
import { useCheckIn, useVisit } from '@/src/hooks/data';
import { distanceMeters } from '@/src/lib/geo';
import { useTheme } from '@/src/theme/ThemeProvider';

const CLOSE_ENOUGH_METERS = 150;

export default function VisitCheckIn() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const visitId = Number(id);
  const { colors, spacing, radii } = useTheme();
  const { t } = useTranslation();
  const { data: visit } = useVisit(visitId);
  const checkIn = useCheckIn(visitId);

  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<ResultState | null>(null);

  const getLocation = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setLocationError(t('checkIn.permissionDenied'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCoords({ lat, lng });
      if (visit?.geoLat != null && visit?.geoLng != null) {
        setDistance(Math.round(distanceMeters(lat, lng, visit.geoLat, visit.geoLng)));
      } else {
        setDistance(0);
      }
    } catch (e) {
      setLocationError(errorMessage(e));
    } finally {
      setLocating(false);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  };

  const save = () => {
    if (!coords) return;
    checkIn.mutate(
      { checkIn: { lat: coords.lat, lng: coords.lng, distanceMeters: distance ?? 0, at: new Date().toISOString() }, photoUri },
      {
        onSuccess: () =>
          setResult({
            kind: 'success',
            title: t('checkIn.savedTitle'),
            description:
              distance != null && distance > CLOSE_ENOUGH_METERS
                ? t('checkIn.savedFar', { distance })
                : t('checkIn.savedNear'),
          }),
        onError: (e) => setResult({ kind: 'error', title: t('checkIn.couldNotSave'), description: errorMessage(e) }),
      },
    );
  };

  return (
    <>
      <Screen>
        <Text tone="muted" variant="caption">{t('checkIn.hint')}</Text>

        <Card style={{ alignItems: 'center', gap: spacing.sm }}>
          {distance != null ? (
            <Text variant="h1" tone={distance > CLOSE_ENOUGH_METERS ? 'danger' : 'success'}>
              {t('checkIn.metersAway', { distance })}
            </Text>
          ) : (
            <Text tone="muted">{t('checkIn.notLocatedYet')}</Text>
          )}
          {locationError ? <Text tone="danger" variant="caption">{locationError}</Text> : null}
          <Button
            variant="secondary"
            title={t('checkIn.getLocation')}
            onPress={getLocation}
            loading={locating}
          />
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text variant="captionSemi" tone="muted">{t('checkIn.photoLabel')}</Text>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={{ width: '100%', height: 160, borderRadius: radii.md }} />
          ) : null}
          <Button variant="secondary" icon="camera-outline" title={t('checkIn.takePhoto')} onPress={takePhoto} />
        </Card>

        <Button
          title={t('checkIn.save')}
          onPress={save}
          disabled={!coords}
          loading={checkIn.isPending}
          fullWidth
        />
      </Screen>

      <ResultSheet
        state={result}
        onPrimary={() => {
          const ok = result?.kind === 'success';
          setResult(null);
          if (ok) router.back();
          else save();
        }}
        onCancel={result?.kind === 'error' ? () => setResult(null) : undefined}
      />
    </>
  );
}
