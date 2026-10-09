import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { ymLabel } from '@/shared/lib/format';
import { BLOCK_BY_ID, BLOCK_NAME, TOPICS } from '@/entities/term';
import { entryColor, KIND_FILTERS, KIND_LABEL, LEGEND, SECTION_L, type AtlasEntry, type Section } from '@/entities/atlas-entry';
import s from './AtlasList.module.css';

interface Props {
  section: Section; entries: AtlasEntry[]; shown: AtlasEntry[];
  zone: string; onZone: (z: string | null) => void;
  kind: string; onKind: (k: string | null) => void;
  selected: string | null; onPick: (key: string) => void;
  className?: string;
}

/** Левая колонка карты: записи раздела по дате, фильтр по виду, закреплённый блок. */
export function AtlasList({ section, entries, shown, zone, onZone, kind, onKind, selected, onPick, className }: Props) {
  const { t, locale, pick } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const L = SECTION_L[section];
  const kinds = useMemo(() => KIND_FILTERS[section].filter(([k]) => entries.some(e => e.kind.kind === k)), [entries, section]);
  const block = zone ? BLOCK_BY_ID[zone as keyof typeof BLOCK_BY_ID] : null;
  return (
    <div className={`${s.glass} ${s.list} ${className ?? ''}`}>
      <div className={s.head}>
        <span className={s.kicker}>{L.points[li]}<small>{L.byDate[li]}</small></span>
        <span className={s.n}>{shown.length === entries.length ? entries.length : `${shown.length} / ${entries.length}`}</span>
      </div>
      {block && <div className={s.pin}><i style={{ background: block.color }} /><span>{block.label[li]}</span><span className={s.n}>{shown.length}</span><button type="button" onClick={() => onZone(null)} aria-label="reset">×</button></div>}
      <div className={s.chips}>
        <button type="button" className={`${s.chip} ${!kind ? s.chipOn : ''}`} onClick={() => onKind(null)}>{t('все', 'all')}</button>
        {kinds.map(([k, lbl]) => <button key={k} type="button" className={`${s.chip} ${kind === k ? s.chipOn : ''}`} onClick={() => onKind(kind === k ? null : k)}>{lbl[li]}</button>)}
      </div>
      <div className={s.rows}>
        {shown.map(e => {
          const color = entryColor(e), on = selected === e.key;
          return (
            <button key={e.key} type="button" className={`${s.row} ${on ? s.rowOn : ''}`} onClick={() => onPick(e.key)}>
              <span className={s.dot} style={{ borderColor: color, background: color }} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span className={s.rt}>{pick(e.title)}</span>
                <span className={s.rs}>{section === 'glossary' ? [e.date ? ymLabel(e.date.ym) : '', KIND_LABEL[e.kind.kind]?.[li] ?? e.kind.kind, zone ? (e.topic ? TOPICS[e.topic.topic]?.[li] : '') : BLOCK_NAME[e.domain.domain]?.[li]].filter(Boolean).join('  ·  ') : [e.date ? ymLabel(e.date.ym) : '', pick(e.origin)].filter(Boolean).join('  ·  ')}</span>
              </span>
            </button>
          );
        })}
        {!shown.length && <div className={s.empty}>{L.empty[li]}</div>}
      </div>
      <div className={s.foot}>
        {LEGEND[section].map(lg => <span key={lg.c} className={s.lg}><i style={{ background: lg.c }} />{lg.t[li]}</span>)}
        {section === 'glossary' && <Link to="/glossary">{t('списком →', 'as a list →')}</Link>}
      </div>
    </div>
  );
}
