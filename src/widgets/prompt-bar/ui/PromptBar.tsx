import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useLocale } from '@/shared/i18n';
import { SAMPLES, SAMPLES_EN, type Hit, type Step } from '@/features/trace';
import s from './PromptBar.module.css';

const CH: Record<string, [string, string, string, string]> = {
  ok: ['rgba(14,18,48,0.05)', '#22263a', 'none', 'rgba(14,18,48,0.07)'], hit: ['rgba(79,70,229,0.12)', '#3730a3', 'none', 'rgba(79,70,229,0.3)'],
  removed: ['rgba(225,29,72,0.08)', '#be123c', 'line-through', 'rgba(225,29,72,0.25)'], added: ['rgba(14,165,233,0.1)', '#0369a1', 'none', 'rgba(14,165,233,0.28)']
};

interface Props {
  onSubmit: (text: string) => void;
  steps: Step[] | null; step: number | null; open: boolean;
  hits: Hit[]; hitLabel: (id: string) => { label: string; color: string } | null; onHit: (id: string) => void;
  onJump: (i: number) => void; onClear: () => void;
  showSamples: boolean; style?: CSSProperties; cardBottom?: number;
}

/** Строка запроса над картой: ввод, образцы, степпер шагов, активированные записи и карточка текущего шага. */
export function PromptBar({ onSubmit, steps, step, open, hits, hitLabel, onHit, onJump, onClear, showSamples, style, cardBottom = 150 }: Props) {
  const { t, locale } = useLocale();
  const [v, setV] = useState('');
  const submit = (text?: string) => { const x = (text ?? v).trim(); if (!x) return; if (text) setV(text); onSubmit(x); };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') submit(); };
  const cur = steps && step != null ? steps[step] : null;
  return (
    <>
      <div className={s.wrap} style={style}>
        <div className={s.bar}>
          <input className={s.input} value={v} onChange={e => setV(e.target.value)} onKeyDown={onKey} placeholder={t('наберите фразу', 'type a phrase')} aria-label={t('Запрос', 'Request')} />
          <button type="button" className={s.go} onClick={() => submit()} aria-label="send">→</button>
        </div>
        {steps && (
          <div className={`${s.row} ${s.stepper}`}>
            {steps.map((x, i) => { const c = step === i, d = step != null && i < step; return (
              <button key={i} type="button" className={`${s.st} ${c ? s.stCur : d ? s.stDone : ''}`} onClick={() => onJump(i)}><i style={{ background: x.color, opacity: c || d ? 1 : 0.35 }} />{i + 1} {x.short}</button>
            ); })}
          </div>
        )}
        {hits.length > 0 && (
          <div className={s.row}>
            <span className={s.lbl}>{t('Активированы', 'Activated')}</span>
            {hits.map(h => { const l = hitLabel(h.id); return l ? <button key={h.id} type="button" className={s.hit} onClick={() => onHit(h.id)}><i style={{ background: l.color }} />{l.label}<b>{h.s.toFixed(2)}</b></button> : null; })}
            <button type="button" className={s.x} onClick={onClear}>×</button>
          </div>
        )}
        {showSamples && !steps && (
          <div className={s.row} style={{ flexWrap: 'wrap' }}>
            {(locale === 'en' ? SAMPLES_EN : SAMPLES).map(x => <button key={x} type="button" className={s.sample} onClick={() => submit(x)}>{x}</button>)}
          </div>
        )}
      </div>
      {cur && open && (
        <div className={s.card} style={{ bottom: cardBottom }}>
          <div className={s.ck}><i style={{ background: cur.color, boxShadow: `0 0 8px ${cur.color}` }} /><span>{(step! + 1) + '/' + steps!.length + ' · ' + cur.where}</span></div>
          <div className={s.ct}>{cur.title}</div>
          <div className={s.cx}>{cur.text}</div>
          {cur.chips.length > 0 && <div className={s.chips}>{cur.chips.map((c, i) => { const k = CH[c.st] ?? CH.ok; return <span key={i} className={s.chip} style={{ background: k[0], color: k[1], textDecoration: k[2], borderColor: k[3] }}>{(c.st === 'added' ? '+ ' : '') + c.w}</span>; })}</div>}
        </div>
      )}
    </>
  );
}
