import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/shared/i18n';
import { dateTime } from '@/shared/lib/format';
import { useLoad } from '@/shared/lib/useLoad';
import { ErrorNote, Kicker } from '@/shared/ui';
import { PERSONAS, inPersona } from '@/entities/persona';
import { pulseApi, type PulseItem } from '@/entities/pulse-item';
import { usePersonaFilter } from '@/features/persona-filter';
import { PulseSearch, usePulseSearch } from '@/features/pulse-search';
import { PulseFeed } from '@/widgets/pulse-feed';
import { PulseSidebar } from '@/widgets/pulse-sidebar';
import { PersonasModal } from '@/widgets/personas-modal';
import s from './PulsePage.module.css';

const PAGE = 60;

export function PulsePage() {
  const { t, locale } = useLocale();
  const [persona, setPersona] = usePersonaFilter();
  const [q] = usePulseSearch();
  const [modal, setModal] = useState(false);
  const [extra, setExtra] = useState<PulseItem[]>([]);
  const [next, setNext] = useState<number | null>(null);
  const [moreBusy, setMoreBusy] = useState(false);

  // В режиме «все» и без поиска берём общую ленту, группировку делает виджет; в режиме персоны фильтр на сервере.
  const serverPersona = persona !== 'all' && persona !== 'prism' ? persona : undefined;
  const key = `pulse:${serverPersona ?? ''}:${q}`;
  const feed = useLoad(key, () => pulseApi.feed({ q: q || undefined, persona: serverPersona, limit: PAGE }));
  useEffect(() => { setExtra([]); setNext(feed.data?.next ?? null); }, [feed.data]);
  useEffect(() => { document.title = t('Пульс · minders atlas', 'Pulse · minders atlas'); }, [t]);

  const items = useMemo(() => [...(feed.data?.items ?? []), ...extra], [feed.data, extra]);
  const counts = useMemo(() => {
    if (!feed.data || q || serverPersona) return null;
    const c: Record<string, number> = { all: items.length };
    PERSONAS.forEach(p => { c[p.id] = items.filter(x => inPersona(x.ps, p.id)).length; });
    return c;
  }, [feed.data, items, q, serverPersona]);

  const loadMore = next == null ? null : async () => {
    setMoreBusy(true);
    try { const r = await pulseApi.feed({ q: q || undefined, persona: serverPersona, before: next, limit: PAGE }); setExtra(e => [...e, ...r.items]); setNext(r.next); }
    finally { setMoreBusy(false); }
  };

  const status = feed.error ? t('Сервер новостей недоступен.', 'The news server is unavailable.')
    : feed.loading && !feed.data ? t('Загружаю публикации…', 'Loading posts…')
    : feed.data?.updated ? t('Собрано автоматически · ', 'Built automatically · ') + dateTime(feed.data.updated, locale)
    : t('Первая сборка новостей ещё не прошла.', 'The first news build has not run yet.');

  return (
    <div className={s.page}>
      <div className={s.head}>
        <Kicker className={s.kicker}><span className={s.live} />{t('обновляется автоматически', 'updates automatically')}</Kicker>
        <h1 className={s.h1}>{t('Пульс', 'Pulse')}</h1>
        <span className={s.status}>{status}</span>
      </div>
      <div className={s.search}><PulseSearch /></div>
      {feed.error && <ErrorNote>{feed.error}</ErrorNote>}
      <div className={s.grid}>
        <div className={s.feed}>
          <PulseFeed items={items} digests={feed.data?.digests ?? {}} persona={persona} searching={!!q} onPersona={setPersona} onOpenPersonas={() => setModal(true)} onMore={loadMore} loading={feed.loading || moreBusy} />
        </div>
        <div className={s.side}>
          <PulseSidebar counts={counts} onOpenPersonas={() => setModal(true)} />
        </div>
      </div>
      <PersonasModal open={modal} onClose={() => setModal(false)} counts={counts} onPick={p => { setModal(false); setPersona(p); }} />
    </div>
  );
}
