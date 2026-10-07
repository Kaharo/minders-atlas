import type { Locale } from '@/shared/i18n';

export const ago = (ts: number, locale: Locale) => {
  const h = (Date.now() - ts) / 36e5;
  if (!(h >= 0)) return '';
  if (h < 1) return locale === 'en' ? 'just now' : 'только что';
  if (h < 24) return Math.round(h) + (locale === 'en' ? 'h ago' : ' ч назад');
  const d = Math.round(h / 24);
  return d + (locale === 'en' ? 'd ago' : ' дн назад');
};

export const dateTime = (iso: string | number, locale: Locale) =>
  new Date(iso).toLocaleString(locale === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

/** "2024-03" → "03.2024", "2024-00" → "2024" */
export const ymLabel = (ym: string | null | undefined) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return m && m !== '00' ? `${m}.${y}` : y;
};

export const plural = (n: number, forms: [string, string, string], locale: Locale) => {
  if (locale === 'en') return n === 1 ? forms[0] : forms[1];
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? forms[0] : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? forms[1] : forms[2];
};
