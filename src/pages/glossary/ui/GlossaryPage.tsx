import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { ROUTES } from '@/shared/config/routes';
import { useLoad } from '@/shared/lib/useLoad';
import { plural } from '@/shared/lib/format';
import { Card, Empty, ErrorNote, Input } from '@/shared/ui';
import { FIRST_YEAR, TOPICS, TermRow, termApi, type Facets, type TermSummary } from '@/entities/term';
import { BlockTabs, YearStrip, useGlossaryFilter } from '@/features/glossary-filter';
import { TermCard } from '@/widgets/term-card';
import s from './GlossaryPage.module.css';

/** Счётчики фильтров считаются на клиенте из полного списка: 340 записей, один запрос. */
function computeFacets(all: TermSummary[]): Facets {
  const dom = new Map<string, number>(), top = new Map<string, { domain: string; n: number }>(), yr = new Map<string, number>();
  for (const x of all) {
    dom.set(x.domain.domain, (dom.get(x.domain.domain) ?? 0) + 1);
    if (x.topic) { const k = x.topic.topic, cur = top.get(k); top.set(k, { domain: x.domain.domain, n: (cur?.n ?? 0) + 1 }); }
    const yk = !x.date ? 'none' : x.date.year < FIRST_YEAR ? 'old' : String(x.date.year);
    yr.set(yk, (yr.get(yk) ?? 0) + 1);
  }
  return { domain: [...dom].map(([k, n]) => ({ k, n })), topic: [...top].map(([k, v]) => ({ k, n: v.n, domain: v.domain })), year: [...yr].map(([k, n]) => ({ k, n })), total: all.length };
}

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

  const all = useLoad('terms:all', () => termApi.list());
  const facets = useMemo(() => (all.data ? computeFacets(all.data) : null), [all.data]);
  const hits = useLoad(`hits:${f.q}`, () => termApi.search(f.q), f.q.length >= 2);

  const shown: TermSummary[] = useMemo(() => {
    let list = (all.data ?? []).filter(x => (!f.block || x.domain.domain === f.block) && (!f.topic || x.topic?.topic === f.topic)
      && (!f.year || (f.year === 'none' ? !x.date : f.year === 'old' ? !!x.date && x.date.year < FIRST_YEAR : x.date?.year === Number(f.year))));
    list.sort((a, b) => (b.date?.ym ?? '').localeCompare(a.date?.ym ?? '') || (a.title.ru ?? '').localeCompare(b.title.ru ?? ''));
    if (f.q.length < 2) return list;
    const q = f.q.toLowerCase(), rank = new Map((hits.data ?? []).map((h, i) => [h.key, i]));
    list = list.filter(x => rank.has(x.key) || [x.title.ru, x.title.en, ...x.aliases].some(v => (v ?? '').toLowerCase().includes(q)));
    return list.sort((a, b) => (rank.get(a.key) ?? 1e3) - (rank.get(b.key) ?? 1e3));
  }, [all.data, hits.data, f.block, f.topic, f.year, f.q]);

  const groups = useMemo(() => {
    if (!f.block || f.topic || f.q) return [{ topic: null as string | null, items: shown }];
    const m = new Map<string, TermSummary[]>();
    shown.forEach(x => { const k = x.topic?.topic ?? '_'; m.set(k, [...(m.get(k) ?? []), x]); });
    return [...m.entries()].map(([topic, items]) => ({ topic, items }));
  }, [shown, f.block, f.topic, f.q]);

  const total = facets?.total ?? 340;
  return (
    <div className={s.page}>
      <div className={s.head}>
        <h1 className={s.h1}>{t('Глоссарий', 'Glossary')}</h1>
        <p className={s.lead}>{t(`${total} терминов на пяти блоках карты: модель, сборка контекста, инструменты, наблюдаемость и защита. У каждого термина дата появления и ссылки на первоисточники.`, `${total} terms across the five blocks of the map: model, context assembly, tools, observability and guards. Each term carries its origin date and links to primary sources.`)} <Link to={ROUTES.atlas('glossary')}>{t('Открыть на карте →', 'Open on the map →')}</Link></p>
      </div>
      <div className={s.filters}>
        <BlockTabs facets={facets} />
        <YearStrip facets={facets} />
        <div className={s.row}>
          <div className={s.search}><Input type="search" placeholder={t('Поиск по названию, синонимам и тексту…', 'Search titles, aliases and text…')} value={draft} onChange={e => setDraft(e.target.value)} /></div>
          {f.active && <button type="button" className={s.reset} onClick={f.reset}>{t('Сбросить фильтры ×', 'Reset filters ×')}</button>}
        </div>
      </div>
      {all.error && <ErrorNote>{all.error}</ErrorNote>}
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
            {!all.loading && !shown.length && <Empty>{t('По этим фильтрам терминов нет.', 'No terms match these filters.')}</Empty>}
          </div>
        </Card>
        <TermCard termKey={key ?? null} onClose={() => nav(ROUTES.glossary + location.search)} />
      </div>
    </div>
  );
}
