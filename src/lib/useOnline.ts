import { useEffect, useState } from 'react';

// @react-native-community/netinfo is a third-party native module, not a guaranteed part of
// Expo Go's bundled set — and this hook is used from the ALWAYS-mounted root layout (offline
// banner), so a plain top-level `import` here would crash the entire app at launch if that
// module isn't actually linked in this Expo Go build, Phase 1 included. Deferred + guarded
// require means a missing/broken module degrades to "assume online" instead of taking the app
// down — the same lesson this project already learned once from expo-updates crashing Expo Go.
type NetInfoModule = typeof import('@react-native-community/netinfo');
let netInfo: NetInfoModule['default'] | null | undefined;

function getNetInfo() {
  if (netInfo === undefined) {
    try {
      netInfo = (require('@react-native-community/netinfo') as NetInfoModule).default;
    } catch {
      netInfo = null;
    }
  }
  return netInfo;
}

export function useIsOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const NetInfo = getNetInfo();
    if (!NetInfo) return; // module unavailable in this runtime — stay "online", never throw
    try {
      const unsub = NetInfo.addEventListener((state) => setOnline(state.isConnected !== false));
      return unsub;
    } catch {
      return undefined;
    }
  }, []);
  return online;
}
