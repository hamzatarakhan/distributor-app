import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import i18n, { type Locale } from './index';

const STORAGE_KEY = 'locale.v1';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  isRTL: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Mirroring is done manually (every row-laying-out component reads `isRTL` from this context
// and picks 'row' vs 'row-reverse' itself) instead of via I18nManager.forceRTL(). That native
// flag only takes full effect after a real OS-level relaunch — something no app can trigger on
// itself on iOS or Android, and Expo Go can't use expo-updates' reloadAsync() to fake one either
// (importing expo-updates crashes Expo Go outright). Manual mirroring flips instantly, in Expo
// Go and any standalone build alike, with no restart and no dead ends.
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'en' || v === 'ar') {
          setLocaleState(v);
          i18n.changeLanguage(v);
        }
      })
      .catch(() => {});
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    i18n.changeLanguage(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  };

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, isRTL: locale === 'ar' }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
