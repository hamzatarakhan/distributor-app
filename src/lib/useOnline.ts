import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

// Phase 2 offline support starts here: real connectivity detection (no mock involved — this
// reflects the device's actual network state).
export function useIsOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => setOnline(state.isConnected !== false));
    return unsub;
  }, []);
  return online;
}
