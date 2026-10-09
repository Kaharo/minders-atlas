import { useMemo, type CSSProperties } from 'react';
import { useLocale } from '@/shared/i18n';
import { BLOCKS, BLOCK_BY_ID, FIRST_YEAR } from '@/entities/term';
import type { AtlasEntry } from '@/entities/atlas-entry';
import s from './TimelineBand.module.css';

interface Props {
  entries: AtlasEntry[];          // все записи раздела (до фильтра по году)
  shown: AtlasEntry[];            // после всех фильтров
  year: string; onYear: (y: string | null) => void;
  zone: string; onZone: (z: string | null) => void;
  selected: string | null; onPick: (key: string) => void;
  counts: Record<string, number>;
  style?: CSSProperties;
}

const OLD_W = 0.11;   // доля ширины под сегмент «до 2017»

/** Шкала времени: сжатый сегмент до 2017 и линейные годы до текущего; точка — запись, столбик — записи одного месяца. */
export function TimelineBand({ entries, shown, year, onYear, zone, onZone, selected, onPick, counts, style }: Props) {
  const { t, locale } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const now = new Date().getFullYear();
  const span = now + 1 - FIRST_YEAR;
  const xOf = (y: number, m: number | null) => { if (y < FIRST_YEAR) return OLD_W * Math.max(0, Math.min(1, (y - 1940) / (FIRST_YEAR - 1940))) * 0.9; return OLD_W + (1 - OLD_W) * ((y - FIRST_YEAR + ((m ?? 6) - 0.5) / 12) / span); };
  const years = useMemo(() => {
    const out: { k: string; label: string; x: number; w: number }[] = [{ k: 'old', label: t('до 2017', 'pre-2017'), x: 0, w: OLD_W }];
    for (let y = FIRST_YEAR; y <= now; y++) out.push({ k: String(y), label: String(y), x: OLD_W + (1 - OLD_W) * ((y - FIRST_YEAR) / span), w: (1 - OLD_W) / span });
    return out;
  }, [now, span, t]);
  const dots = useMemo(() => {
    const shownKeys = new Set(shown.map(e => e.key));
    const stack = new Map<string, number>();
    return entries.filter(e => e.date).map(e => {
      const d = e.date!, slot = d.year < FIRST_YEAR ? 'old' : d.ym, n = stack.get(slot) ?? 0; stack.set(slot, n + 1);
      const on = shownKeys.has(e.key), sel = selected === e.key, color = BLOCK_BY_ID[e.domain.domain]?.color ?? '#999';
      return { key: e.key, x: xOf(d.year, d.month), y: 20 + Math.min(n, 5) * 7, sz: sel ? 10 : 6, color, op: on ? 1 : 0.18, sel, tip: e.title.ru ?? e.key };
    });
  }, [entries, shown, selected]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={s.band} style={style}>
      <div className={s.head}>
        <span className={s.title}>{t('Шкала времени', 'Timeline')}</span>
        <span className={s.count}>{shown.length === entries.length ? entries.length : `${shown.length} / ${entries.length}`}</span>
        {(year || zone) && <button type="button" className={s.reset} onClick={() => { onYear(null); onZone(null); }}>{t('Сбросить', 'Reset')} ×</button>}
      </div>
      <div className={s.rail}>
        <span className={s.axis} />
        {years.map(y => (
          <button key={y.k} type="button" className={s.year} style={{ left: y.x * 100 + '%', width: y.w * 100 + '%' }} onClick={() => onYear(year === y.k ? null : y.k)} aria-pressed={year === y.k}>
            <span className={s.tick} /><span className={`${s.yl} ${year === y.k ? s.ylOn : ''}`}>{y.label}</span>
          </button>
        ))}
        {dots.map(d => <button key={d.key} type="button" className={s.dot} title={d.tip} onClick={() => onPick(d.key)} style={{ left: d.x * 100 + '%', bottom: d.y, width: d.sz, height: d.sz, background: d.color, opacity: d.op, boxShadow: d.sel ? `0 0 0 3px ${d.color}44` : 'none' }} />)}
      </div>
      <div className={s.zones}>
        {BLOCKS.map(b => (
          <button key={b.id} type="button" className={`${s.zone} ${zone === b.id ? s.zoneOn : ''}`} onClick={() => onZone(zone === b.id ? null : b.id)}>
            <i style={{ background: b.color }} />{b.label[li]}{counts[b.id] ? ` · ${counts[b.id]}` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
