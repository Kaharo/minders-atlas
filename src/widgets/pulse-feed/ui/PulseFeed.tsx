import { useLocale } from '@/shared/i18n';
import { Button, Card, Empty } from '@/shared/ui';
import { PERSONAS, PERSONA_BY_ID, PersonaGlyph, inPersona, primaryPersona, type PersonaId } from '@/entities/persona';
import { NewsItem, type PulseDigest, type PulseItem } from '@/entities/pulse-item';
import s from './PulseFeed.module.css';

interface Props {
  items: PulseItem[];
  digests: Record<string, PulseDigest>;
  persona: PersonaId | 'all';
  searching: boolean;
  onPersona: (p: PersonaId | 'all') => void;
  onOpenPersonas: () => void;
  onMore?: (() => void) | null;
  loading: boolean;
}

/** Главное за три дня + группы по персонам (режим «все») или одна персона с её разбором. */
export function PulseFeed({ items, digests, persona, searching, onPersona, onOpenPersonas, onMore, loading }: Props) {
  const { t, locale, pick } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const all = persona === 'all';

  const recent = items.filter(x => Date.now() - x.ts < 3 * 864e5);
  const top = all && !searching ? (recent.length >= 5 ? recent : items).slice().sort((a, b) => b.score - a.score).slice(0, 5) : [];
  const topIds = new Set(top.map(x => x.id));

  const groups = PERSONAS.filter(p => all || p.id === persona).map(p => {
    const list = items.filter(x => (all ? !topIds.has(x.id) && (p.id !== 'prism' ? primaryPersona(x.ps) === p.id : inPersona(x.ps, p.id)) : inPersona(x.ps, p.id)));
    const limit = all && !searching ? 3 : 200;
    return { p, list: list.slice(0, limit), rest: Math.max(0, list.length - limit), digest: all && !searching ? pick(digests[p.id]) : '' };
  }).filter(g => g.list.length);

  const lens = !all ? PERSONA_BY_ID[persona] : null;
  const take = lens ? pick(digests[lens.id]) : '';

  return (
    <div className={s.col}>
      {lens && (
        <Card pad className={s.lens}>
          <PersonaGlyph id={lens.id} />
          <div className={s.lensBody}>
            <div className={s.lensHead}>
              <span className={s.name}>{lens.name}</span>
              <span className={s.domain} style={{ color: lens.ink }}>{lens.domain[li]}</span>
              {digests[lens.id]?.day && <span className={s.date}>{digests[lens.id].day}</span>}
            </div>
            <span className={s.q}>{lens.question[li]}</span>
            <span className={`${s.take} ${take ? '' : s.takeEmpty}`}>{take || t('Разбор персоны появится после ежедневной сборки. Пока ниже все новости, которые попали к ней по теме.', 'The persona’s take appears after the daily build. Below are all stories filed under it.')}</span>
            <Button variant="link" onClick={onOpenPersonas} style={{ alignSelf: 'flex-start', fontSize: 12 }}>{t('Все персоны и как они работают', 'All personas and how they work')}</Button>
          </div>
        </Card>
      )}
      {top.length > 0 && (
        <Card>
          <div className={s.secHead}>
            <h2 className={s.h2}>{t('Главное', 'Top stories')}</h2>
            <span className={s.sub}>{t('за последние три дня', 'last three days')}</span>
          </div>
          {top.map(x => <NewsItem key={x.id} item={x} lens={primaryPersona(x.ps)} big />)}
        </Card>
      )}
      {groups.map(g => (
        <Card key={g.p.id}>
          <button type="button" className={s.groupHead} onClick={() => onPersona(all ? g.p.id : 'all')}>
            <span className={s.gdot} style={{ background: g.p.color, boxShadow: `0 0 0 4px ${g.p.id === 'prism' ? 'rgba(14,18,48,0.06)' : g.p.color + '22'}` }} />
            <span className={s.gname}>{g.p.name}</span>
            <span className={s.gdomain}>{g.p.domain[li]}</span>
            <span className={s.spacer} />
            {g.rest > 0 && <span className={s.more}>+{g.rest}</span>}
          </button>
          {g.digest && <p className={s.digest}>{g.digest}</p>}
          {g.list.map(x => <NewsItem key={x.id} item={x} lens={g.p.id} />)}
        </Card>
      ))}
      {!loading && !groups.length && !top.length && <Empty>{searching ? t('По этому запросу новостей нет.', 'No stories match this query.') : t('Новости появятся после первой ежедневной сборки.', 'Stories appear after the first daily build.')}</Empty>}
      {onMore && <Button variant="ghost" className={s.loadMore} onClick={onMore} disabled={loading}>{t('Показать раньше', 'Show earlier')}</Button>}
    </div>
  );
}
