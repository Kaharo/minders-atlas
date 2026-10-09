import { Fragment } from 'react';
import { useLocale } from '@/shared/i18n';
import type { Step } from '@/features/trace';
import s from './LearnPanel.module.css';

/** Подробности шага учебного режима (глоссарий): токены, вектор, состав контекста, строки фактов. */
export function LearnPanel({ steps, step, onClose }: { steps: Step[]; step: number; onClose: () => void }) {
  const { t } = useLocale();
  const x = steps[step];
  if (!x) return null;
  return (
    <div className={s.panel}>
      <div className={s.head}><i style={{ background: x.color }} /><span className={s.kicker}>{t('Шаг ', 'Step ') + (step + 1) + t(' из ', ' of ') + steps.length}</span><button type="button" className={s.close} onClick={onClose}>{t('закрыть', 'close')}</button></div>
      <div className={s.title}>{x.title}</div>
      <div className={s.text}>{x.text}{x.note ? ' ' + x.note : ''}</div>
      {x.tchips && <div className={s.chips}>{x.tchips.map((c, i) => <span key={i} className={s.tok} style={{ background: c.bg, borderColor: c.bd }}><span>{c.w}</span><span style={{ color: c.fg }}>{c.id}</span></span>)}</div>}
      {x.vec && (
        <div className={s.box}>
          {x.vec.map((r, i) => <div key={i} className={s.vrow}><span className={s.vw}>{r.w}</span><div className={s.cells}>{r.cells.map((q, j) => <span key={j} style={{ background: q.c }} />)}</div></div>)}
          <span className={s.note}>{x.vecNote}</span>
        </div>
      )}
      {x.bars && <div className={s.box}>{x.bars.map((b, i) => <div key={i} className={s.brow}><span className={s.bk}>{b.k}</span><span className={s.bar} style={{ background: b.c, width: b.w }} /><span className={s.bv}>{b.v}</span></div>)}</div>}
      {x.rows && x.rows.length > 0 && <dl className={s.rows}>{x.rows.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>}
    </div>
  );
}
