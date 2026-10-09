import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { ymLabel } from '@/shared/lib/format';
import { BLOCK_BY_ID } from '@/entities/term';
import { KIND_LABEL, type AtlasEntry, type Section } from '@/entities/atlas-entry';
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
  const kinds = useMemo(() => { const m = new Map<string, number>(); entries.forEach(e => m.set(e.kind.kind, (m.get(e.kind.kind) ?? 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1]); }, [entries]);
  const block = zone ? BLOCK_BY_ID[zone as keyof typeof BLOCK_BY_ID] : null;
  return (
    <div className={`${s.glass} ${s.list} ${className ?? ''}`}>
      <div className={s.head}>
        <span className={s.kicker}>{t('Записи', 'Entries')}<small>{t('по дате появления', 'by date of origin')}</small></span>
        <span className={s.n}>{shown.length === entries.length ? entries.length : `${shown.length} / ${entries.length}`}</span>
      </div>
      {block && <div className={s.pin}><i style={{ background: block.color }} /><span>{block.label[li]}</span><span className={s.n}>{shown.length}</span><button type="button" onClick={() => onZone(null)} aria-label="reset">×</button></div>}
      {kinds.length > 1 && (
        <div className={s.chips}>
          {kinds.map(([k, n]) => <button key={k} type="button" className={`${s.chip} ${kind === k ? s.chipOn : ''}`} onClick={() => onKind(kind === k ? null : k)}>{KIND_LABEL[k]?.[li] ?? k} · {n}</button>)}
        </div>
      )}
      <div className={s.rows}>
        {shown.map((e, i) => {
          const color = BLOCK_BY_ID[e.domain.domain]?.color ?? '#999', on = selected === e.key;
          return (
            <button key={e.key} type="button" className={`${s.row} ${on ? s.rowOn : ''}`} onClick={() => onPick(e.key)}>
              <span className={s.dot} style={{ borderColor: color, color: on ? '#fff' : color, background: on ? color : 'transparent' }}>{i + 1}</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span className={s.rt}>{pick(e.title)}</span>
                <span className={s.rs}>{[e.date ? ymLabel(e.date.ym) : t('без даты', 'undated'), KIND_LABEL[e.kind.kind]?.[li] ?? e.kind.kind, e.severity ? t('тяжесть', 'severity') + ' ' + e.severity.sev : ''].filter(Boolean).join(' · ')}</span>
              </span>
            </button>
          );
        })}
        {!shown.length && <div className={s.empty}>{t('По этим фильтрам записей нет.', 'No entries match these filters.')}</div>}
      </div>
      <div className={s.foot}>
        {section === 'glossary' && <Link to="/glossary">{t('Открыть списком с поиском →', 'Open as a searchable list →')}</Link>}
        {section !== 'glossary' && <span>{t('Точка на карте стоит там, к чему относится запись.', 'Each dot sits where the entry belongs in the architecture.')}</span>}
      </div>
    </div>
  );
}
