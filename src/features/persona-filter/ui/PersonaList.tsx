import { useLocale } from '@/shared/i18n';
import { PERSONAS, PersonaGlyph, type PersonaId } from '@/entities/persona';
import { usePersonaFilter } from '../model/usePersonaFilter';
import s from './PersonaList.module.css';

/** Список персон с переключением фильтра. counts — число новостей у каждой (ключ 'all' для всех). */
export function PersonaList({ counts }: { counts: Record<string, number> | null }) {
  const { t, locale } = useLocale();
  const [cur, setCur] = usePersonaFilter();
  const li = locale === 'en' ? 1 : 0;
  const rows: { id: PersonaId | 'all'; name: string; ink: string; domain: string }[] = [
    { id: 'all', name: t('ВСЕ', 'ALL'), ink: '#5a6076', domain: t('Все новости', 'All news') },
    ...PERSONAS.map(p => ({ id: p.id, name: p.name, ink: p.ink, domain: p.domain[li] }))
  ];
  return (
    <>
      {rows.map(r => {
        const on = cur === r.id, dim = cur !== 'all' && !on && r.id !== 'all';
        return (
          <button key={r.id} type="button" className={`${s.row} ${on ? s.rowOn : ''} ${dim ? s.rowDim : ''}`} onClick={() => setCur(on && r.id !== 'all' ? 'all' : r.id)} aria-pressed={on}>
            <PersonaGlyph id={r.id} size={28} />
            <div className={s.body}>
              <span className={s.name}>{r.name}</span>
              <span className={s.domain} style={{ color: r.ink }}>{r.domain}</span>
            </div>
            <span className={s.n}>{counts ? counts[r.id] ?? 0 : '·'}</span>
          </button>
        );
      })}
    </>
  );
}
