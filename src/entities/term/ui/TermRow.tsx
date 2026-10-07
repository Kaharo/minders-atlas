import { useLocale } from '@/shared/i18n';
import { ymLabel } from '@/shared/lib/format';
import { BLOCK_BY_ID, KINDS, TOPICS } from '../model/taxonomy';
import type { TermSummary } from '../model/types';
import s from './TermRow.module.css';

export function TermRow({ term, active, onSelect }: { term: TermSummary; active?: boolean; onSelect: (key: string) => void }) {
  const { locale, pick } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const topic = term.topic ? TOPICS[term.topic.topic]?.[li] : '';
  return (
    <button type="button" className={`${s.row} ${active ? s.rowOn : ''}`} onClick={() => onSelect(term.key)} aria-current={active || undefined}>
      <span className={s.dot} style={{ background: BLOCK_BY_ID[term.domain.domain]?.color }} />
      <div className={s.body}>
        <span className={s.title}>{pick(term.title)}</span>
        <span className={s.meta}>{[KINDS[term.kind.kind]?.[li], topic].filter(Boolean).join(' · ')}</span>
      </div>
      <span className={s.date}>{term.date ? ymLabel(term.date.ym) : '—'}</span>
    </button>
  );
}
