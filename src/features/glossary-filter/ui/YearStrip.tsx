import { useLocale } from '@/shared/i18n';
import { FIRST_YEAR, type Facets } from '@/entities/term';
import { useGlossaryFilter } from '../model/useGlossaryFilter';
import s from './filters.module.css';

/** Шкала времени: 2026 → 2017, «до 2017» и «без даты». Высота столбика точек = число терминов. */
export function YearStrip({ facets }: { facets: Facets | null }) {
  const { t } = useLocale();
  const f = useGlossaryFilter();
  const now = new Date().getFullYear();
  const byKey = Object.fromEntries((facets?.year ?? []).map(y => [y.k, Number(y.n)]));
  const years: { k: string; label: string }[] = [];
  for (let y = now; y >= FIRST_YEAR; y--) years.push({ k: String(y), label: String(y) });
  years.push({ k: 'old', label: t('до 2017', 'before 2017') }, { k: 'none', label: t('без даты', 'undated') });
  const max = Math.max(1, ...years.map(y => byKey[y.k] ?? 0));
  return (
    <div className={s.years} role="tablist">
      {years.map(y => {
        const n = byKey[y.k] ?? 0, h = n ? Math.max(1, Math.round((n / max) * 16)) : 0;
        return (
          <button key={y.k} type="button" className={`${s.year} ${f.year === y.k ? s.yearOn : ''}`} onClick={() => f.setYear(f.year === y.k ? null : y.k)} title={`${y.label}: ${n}`} aria-pressed={f.year === y.k}>
            <div className={s.bars}>{Array.from({ length: 16 }, (_, i) => <span key={i} className={i >= h ? s.off : ''} />)}</div>
            <span className={s.yl}>{y.label}</span>
          </button>
        );
      })}
    </div>
  );
}
