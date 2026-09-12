import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DevSettings, I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import i18n, { type Locale } from './index';

const STORAGE_KEY = 'locale.v1';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  isRTL: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// I18nManager's RTL flag is native and persists across app launches on its own (independent of
// our AsyncStorage key) — but it only takes full effect, for every already-mounted native view,
// after the app process restarts. Updates.reloadAsync() does that in a standalone/EAS build;
// it throws in Expo Go, where DevSettings.reload() (a JS-context reload) is the closest
// available substitute — good enough to re-render this session RTL-correct in most cases, though
// a manual force-close from Expo Go's own app switcher is the only way to be 100% sure.
async function reloadApp() {
  try {
    await Updates.reloadAsync();
  } catch {
    if (__DEV__) DevSettings.reload();
  }
}

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

    const rtl = l === 'ar';
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
      reloadApp();
    }
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
