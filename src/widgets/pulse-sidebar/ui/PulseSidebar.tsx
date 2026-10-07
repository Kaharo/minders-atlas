import { Link } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { ROUTES } from '@/shared/config/routes';
import { ymLabel } from '@/shared/lib/format';
import { useLoad } from '@/shared/lib/useLoad';
import { Card, Kicker } from '@/shared/ui';
import { termApi } from '@/entities/term';
import { PersonaList } from '@/features/persona-filter';
import s from './PulseSidebar.module.css';

const CAT: Record<string, { color: string; label: [string, string]; route: (k: string) => string | null }> = {
  term: { color: '#3b5bfd', label: ['Термины', 'Terms'], route: k => ROUTES.term(k) },
  research: { color: '#a855f7', label: ['Исследования', 'Research'], route: () => null },
  incident: { color: '#ef4444', label: ['Инциденты', 'Incidents'], route: () => null },
  benchmark: { color: '#f59e0b', label: ['Рейтинги', 'Rankings'], route: () => null }
};

export function PulseSidebar({ counts, onOpenPersonas }: { counts: Record<string, number> | null; onOpenPersonas: () => void }) {
  const { t, locale, pick } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const recent = useLoad('recent', () => termApi.recent(10));
  return (
    <aside className={s.aside}>
      <Card>
        <div className={s.head}>
          <Kicker>{t('Персоны', 'Personas')}</Kicker>
          <button type="button" className={s.who} onClick={onOpenPersonas}>
            {t('Кто это', 'Who are they')}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
          </button>
        </div>
        <PersonaList counts={counts} />
      </Card>
      <Card>
        <div className={s.title}>
          <h2 className={s.h2}>{t('В атласе', 'In the atlas')}</h2>
          <span className={s.sub}>{t('Последние записи. Открываются на своём месте в архитектуре.', 'Latest entries. Each opens at its place in the architecture.')}</span>
        </div>
        {(recent.data ?? []).map(it => {
          const c = CAT[it.tag] ?? CAT.term, to = c.route(it.key);
          const inner = (
            <>
              <span className={s.dot} style={{ background: c.color }} />
              <div className={s.body}>
                <span className={s.t}>{pick(it.title)}</span>
                <span className={s.m}>{[c.label[li], ymLabel(it.ym), pick(it.where)].filter(Boolean).join(' · ')}</span>
              </div>
            </>
          );
          return to ? <Link key={it.uid} to={to} className={s.item}>{inner}</Link> : <div key={it.uid} className={s.item} style={{ cursor: 'default' }}>{inner}</div>;
        })}
      </Card>
    </aside>
  );
}
