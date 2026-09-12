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

  // Note: this flips text direction/alignment via I18nManager on native, which needs an app
  // reload to fully mirror layout — out of scope here, so Arabic renders LTR-laid-out screens
  // with translated (and RTL-shaped, since react-native-web/native handle Arabic script
  // shaping natively) text. Good enough for a demo; a real RTL flip is a follow-up.
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
