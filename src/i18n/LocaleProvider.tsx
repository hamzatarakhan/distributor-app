import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, DevSettings, I18nManager } from 'react-native';
import i18n, { type Locale } from './index';

const STORAGE_KEY = 'locale.v1';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  isRTL: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// I18nManager's RTL flag is native and persists across app launches on its own (independent of
// our AsyncStorage key), but no app is allowed to kill/relaunch its own process on iOS or
// Android — that's an OS restriction, not something any RN API works around. So a language
// switch that flips RTL can only be *fully* mirrored (every already-mounted native view included)
// starting from the app's next real cold start; forceRTL/allowRTL below persists the flag for
// that. `expo-updates`' Updates.reloadAsync() would do a full native reload in a standalone/EAS
// build, but it isn't supported in Expo Go at all — importing it crashes Expo Go outright, so it
// can't be used while this app's primary target is still Expo Go. DevSettings.reload() (dev-only)
// at least re-executes the whole JS bundle against the now-updated native RTL flag, which is
// enough for this app (everything here is plain Yoga flexbox, no custom native views), so it
// usually finishes the mirror in-place — the Alert below tells the dealer to fully close and
// reopen the app if anything still reads left-to-right after that.
function reloadForDirectionChange(rtl: boolean) {
  Alert.alert(
    rtl ? 'تم التبديل إلى العربية' : 'Switched to English',
    rtl
      ? 'سيُعاد تحميل التطبيق الآن. إذا بقي أي جزء من الشاشة بدون انعكاس، أغلق التطبيق بالكامل من قائمة التطبيقات المفتوحة وأعد فتحه.'
      : 'The app will reload now. If anything still looks mirrored, fully close the app from the app switcher and reopen it.',
    [
      {
        text: rtl ? 'حسناً' : 'OK',
        onPress: () => {
          if (__DEV__) DevSettings.reload();
        },
      },
    ],
  );
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
      reloadForDirectionChange(rtl);
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
