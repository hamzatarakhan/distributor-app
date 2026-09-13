import { useState } from 'react';
import { Linking, Platform } from 'react-native';

export type MapTarget = { lat?: number; lng?: number; address?: string; city?: string };

function query(t: MapTarget) {
  if (t.lat != null && t.lng != null) return `${t.lat},${t.lng}`;
  return encodeURIComponent(`${t.address ?? ''}${t.city ? `, ${t.city}` : ''}`);
}

export const appleMapsUrl = (t: MapTarget) => `https://maps.apple.com/?q=${query(t)}`;
export const googleMapsUrl = (t: MapTarget) => `https://www.google.com/maps/search/?api=1&query=${query(t)}`;

// Android already shows its own app-chooser for a `geo:` intent when more than one map app is
// installed — no in-app UI needed there. iOS has no such scheme and no equivalent OS-level
// chooser, so `useMapsNavigate` shows an explicit Apple/Google pick instead (see
// MapsChooserSheet). Falls back to the universal Google Maps web link if `geo:` isn't handled.
function openAndroidMaps(t: MapTarget) {
  Linking.openURL(`geo:0,0?q=${query(t)}`).catch(() => Linking.openURL(googleMapsUrl(t)).catch(() => {}));
}

export function useMapsNavigate() {
  const [chooserTarget, setChooserTarget] = useState<MapTarget | null>(null);

  const navigate = (t: MapTarget) => {
    if (Platform.OS === 'ios') setChooserTarget(t);
    else openAndroidMaps(t);
  };

  return { chooserTarget, navigate, closeChooser: () => setChooserTarget(null) };
}
