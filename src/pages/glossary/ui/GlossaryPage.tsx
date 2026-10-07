import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { ROUTES } from '@/shared/config/routes';
import { useLoad } from '@/shared/lib/useLoad';
import { plural } from '@/shared/lib/format';
import { Card, Empty, ErrorNote, Input } from '@/shared/ui';
import { TOPICS, TermRow, termApi, type TermSummary } from '@/entities/term';
import { BlockTabs, YearStrip, useGlossaryFilter } from '@/features/glossary-filter';
import { TermCard } from '@/widgets/term-card';
import s from './GlossaryPage.module.css';

export function GlossaryPage() {
  const { t, locale } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const nav = useNavigate();
  const { key } = useParams<{ key: string }>();
  const f = useGlossaryFilter();
  const [draft, setDraft] = useState(f.q);
  useEffect(() => { setDraft(f.q); }, [f.q]);
  useEffect(() => { if (draft === f.q) return; const id = setTimeout(() => f.setQ(draft.trim() || null), 300); return () => clearTimeout(id); }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.title = t('Глоссарий · minders atlas', 'Glossary · minders atlas'); }, [t]);

  const facets = useLoad('facets', () => termApi.facets());
  const list = useLoad(`terms:${f.block}:${f.topic}:${f.year}`, () => termApi.list({ domain: f.block || undefined, topic: f.topic || undefined, year: f.year || undefined }));
  const hits = useLoad(`hits:${f.q}`, () => termApi.search(f.q), f.q.length >= 2);

  // Поиск: сервер отдаёт ранжированные ключи, список оставляет совпавшие в порядке релевантности.
  const shown: TermSummary[] = useMemo(() => {
    const all = list.data ?? [];
    if (f.q.length < 2) return all;
    const rank = new Map((hits.data ?? []).map((h, i) => [h.key, i]));
    const local = all.filter(x => rank.has(x.key) || [x.title.ru, x.title.en, ...x.aliases].some(v => (v ?? '').toLowerCase().includes(f.q.toLowerCase())));
    return local.sort((a, b) => (rank.get(a.key) ?? 1e3) - (rank.get(b.key) ?? 1e3));
  }, [list.data, hits.data, f.q]);

  // Группировка по подтеме, когда блок выбран, а подтема нет
  const groups = useMemo(() => {
    if (!f.block || f.topic || f.q) return [{ topic: null as string | null, items: shown }];
    const m = new Map<string, TermSummary[]>();
    shown.forEach(x => { const k = x.topic?.topic ?? '_'; m.set(k, [...(m.get(k) ?? []), x]); });
    return [...m.entries()].map(([topic, items]) => ({ topic, items }));
  }, [shown, f.block, f.topic, f.q]);

  const total = facets.data?.total ?? 0;
  return (
    <div className={s.page}>
        <div className={s.head}>
          <h1 className={s.h1}>{t('Глоссарий', 'Glossary')}</h1>
          <p className={s.lead}>{t(`${total || 340} терминов на пяти блоках карты: модель, сборка контекста, инструменты, наблюдаемость и защита. У каждого термина дата появления и ссылки на первоисточники.`, `${total || 340} terms across the five blocks of the map: model, context assembly, tools, observability and guards. Each term carries its origin date and links to primary sources.`)}</p>
        </div>
        <div className={s.filters}>
          <BlockTabs facets={facets.data} />
          <YearStrip facets={facets.data} />
          <div className={s.row}>
            <div className={s.search}><Input type="search" placeholder={t('Поиск по названию, синонимам и тексту…', 'Search titles, aliases and text…')} value={draft} onChange={e => setDraft(e.target.value)} /></div>
            {f.active && <button type="button" className={s.reset} onClick={f.reset}>{t('Сбросить фильтры ×', 'Reset filters ×')}</button>}
          </div>
        </div>
        {list.error && <ErrorNote>{list.error}</ErrorNote>}
        <div className={s.grid}>
          <Card>
            <span className={s.count}>{shown.length} {plural(shown.length, locale === 'en' ? ['term', 'terms', 'terms'] : ['термин', 'термина', 'терминов'], locale)}</span>
            <div className={s.list}>
              {groups.map(g => (
                <div key={g.topic ?? 'all'}>
                  {g.topic && <div className={s.group}>{TOPICS[g.topic]?.[li] ?? g.topic} <small>{g.items.length}</small></div>}
                  {g.items.map(x => <TermRow key={x.key} term={x} active={x.key === key} onSelect={k => nav(ROUTES.term(k) + location.search)} />)}
                </div>
              ))}
              {!list.loading && !shown.length && <Empty>{t('По этим фильтрам терминов нет.', 'No terms match these filters.')}</Empty>}
            </div>
          </Card>
          <TermCard termKey={key ?? null} onClose={() => nav(ROUTES.glossary + location.search)} />
        </div>
      </div>
  );
}
