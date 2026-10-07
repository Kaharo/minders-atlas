import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { LocaleContext, type Locale, type Bilingual } from '@/shared/i18n';

const KEY = 'atlas.locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => (localStorage.getItem(KEY) === 'en' ? 'en' : 'ru'));
  const setLocale = useCallback((l: Locale) => { localStorage.setItem(KEY, l); setLocaleState(l); document.documentElement.lang = l; }, []);
  const value = useMemo(() => ({
    locale, setLocale,
    t: (ru: string, en: string) => (locale === 'en' ? en : ru),
    pick: (b: Bilingual | null | undefined) => (b ? (locale === 'en' ? b.en || b.ru : b.ru || b.en) || '' : '')
  }), [locale, setLocale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
