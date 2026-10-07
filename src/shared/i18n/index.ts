import { createContext, useContext } from 'react';

export type Locale = 'ru' | 'en';
export interface Bilingual { ru: string | null; en: string | null }

export interface LocaleValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** t('по-русски', 'in English') */
  t: (ru: string, en: string) => string;
  /** Берёт строку нужного языка из двуязычного объекта с откатом на другой язык */
  pick: (b: Bilingual | null | undefined) => string;
}

export const LocaleContext = createContext<LocaleValue>({ locale: 'ru', setLocale: () => {}, t: (ru) => ru, pick: (b) => b?.ru ?? '' });
export const useLocale = () => useContext(LocaleContext);
