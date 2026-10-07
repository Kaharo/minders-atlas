import { useLocale } from '@/shared/i18n';
import { ago } from '@/shared/lib/format';
import { PERSONA_BY_ID, primaryPersona, type PersonaId } from '@/entities/persona';
import type { PulseItem } from '../model/types';
import s from './NewsItem.module.css';

/**
 * Одна новость в ленте. lens — персона, в чьей группе показана новость:
 * от неё зависят цвет точки, заметка и перечень «других» персон.
 */
export function NewsItem({ item, lens, big }: { item: PulseItem; lens: PersonaId; big?: boolean }) {
  const { locale, pick } = useLocale();
  const prim = primaryPersona(item.ps);
  const colorOf = lens === 'prism' ? prim : lens;
  const note = pick(item.notes[lens]);
  const also = item.ps.filter(k => k !== lens && !(lens === 'prism' && k === prim) && k in PERSONA_BY_ID) as PersonaId[];
  const when = ago(item.ts, locale);
  return (
    <a className={s.row} href={item.url ?? '#'} target="_blank" rel="noopener">
      <span className={s.lead} style={{ background: PERSONA_BY_ID[colorOf].color }} />
      <div className={s.body}>
        <span className={`${s.title} ${big ? s.titleBig : ''}`}>{item.title}</span>
        {note && <span className={s.note}><span className={s.tag} style={{ color: PERSONA_BY_ID[lens].ink }}>{PERSONA_BY_ID[lens].name}</span> {note}</span>}
        <div className={s.meta}>
          {big && <span className={s.tag} style={{ color: PERSONA_BY_ID[prim].ink }}>{PERSONA_BY_ID[prim].name}</span>}
          {also.length > 0 && <div className={s.also}>{also.map(k => <span key={k} style={{ background: PERSONA_BY_ID[k].color }} />)}</div>}
          <span className={s.metaText}>{item.src}{when ? ' · ' + when : ''}</span>
        </div>
      </div>
    </a>
  );
}
