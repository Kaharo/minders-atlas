import { useEffect, useState } from 'react';
import { useLocale } from '@/shared/i18n';
import { Input } from '@/shared/ui';
import { useQueryParam } from '@/shared/lib/useQueryParam';

/** Поиск по архиву Пульса: ?q= с задержкой ввода 350 мс. */
export function usePulseSearch() { return useQueryParam('q'); }

export function PulseSearch() {
  const { t } = useLocale();
  const [q, setQ] = usePulseSearch();
  const [draft, setDraft] = useState(q);
  useEffect(() => { setDraft(q); }, [q]);
  useEffect(() => {
    if (draft === q) return;
    const id = setTimeout(() => setQ(draft.trim() || null), 350);
    return () => clearTimeout(id);
  }, [draft, q, setQ]);
  return <Input type="search" placeholder={t('Поиск по архиву новостей…', 'Search the news archive…')} value={draft} onChange={e => setDraft(e.target.value)} aria-label={t('Поиск', 'Search')} />;
}
