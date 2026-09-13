import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const KEY = 'onboarding.seen.v1';

// null = still reading storage (fold into the splash's loading window so there's no flash of
// the wrong screen), true/false = resolved.
export function useOnboardingSeen() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => setSeen(v === '1'))
      .catch(() => setSeen(true)); // fail open — never block app access over a storage read
  }, []);

  const markSeen = () => {
    setSeen(true);
    AsyncStorage.setItem(KEY, '1').catch(() => {});
  };

  return { seen, markSeen };
}
