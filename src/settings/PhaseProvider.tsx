import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Phase = 1 | 2;
const STORAGE_KEY = 'app.phase.v1';

type PhaseContextValue = { phase: Phase; setPhase: (p: Phase) => void };
const PhaseContext = createContext<PhaseContextValue | null>(null);

// One flag gates every Phase 2 addition (extra buttons/sections/screens) so the app can drop
// straight back to exactly the client's original Phase 1 scope — flip it in More > App phase.
export function PhaseProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhaseState] = useState<Phase>(1);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === '1' || v === '2') setPhaseState(Number(v) as Phase);
      })
      .catch(() => {});
  }, []);

  const setPhase = (p: Phase) => {
    setPhaseState(p);
    AsyncStorage.setItem(STORAGE_KEY, String(p)).catch(() => {});
  };

  const value = useMemo(() => ({ phase, setPhase }), [phase]);
  return <PhaseContext.Provider value={value}>{children}</PhaseContext.Provider>;
}

export function usePhase() {
  const ctx = useContext(PhaseContext);
  if (!ctx) throw new Error('usePhase must be used within PhaseProvider');
  return ctx;
}
