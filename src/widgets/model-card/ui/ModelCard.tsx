import { Fragment, useState } from 'react';
import { useLocale } from '@/shared/i18n';
import { modelById, modelsByOrg } from '@/entities/model';
import { HwPanel, type HwData } from '@/widgets/arch-map';
import s from './ModelCard.module.css';

/** Правая колонка карты: выбор модели, характеристики, «где помещается». */
export function ModelCard({ modelId, onModel, hw, className }: { modelId: string; onModel: (id: string) => void; hw: HwData | null; className?: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const m = modelById(modelId);
  if (!m) return null;
  const specs: [string, string][] = [[t('Параметры', 'Parameters'), hw?.model.par ?? m.par], [t('Активных', 'Active'), m.act === '—' ? t('все', 'all') : m.act], [t('Контекст', 'Context'), m.ctx || '—'], [t('Слоёв', 'Layers'), hw ? hw.facts[2][1] : '—']];
  return (
    <div className={`${s.card} ${className ?? ''}`}>
      <span className={s.kicker}>{t('Модель', 'Model')}</span>
      <div className={s.pickWrap}>
        <div className={s.pickText}><span className={s.org}>{m.orgName} · {m.arch}</span><span className={s.name}>{m.name}</span></div>
        <span className={s.caret}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></span>
        <select className={s.select} value={modelId} onChange={e => onModel(e.target.value)} aria-label={t('Выбрать модель', 'Pick a model')}>
          {modelsByOrg().map(g => <optgroup key={g.org} label={g.org}>{g.items.map(x => <option key={x.id} value={x.id}>{x.name} · {x.par}</option>)}</optgroup>)}
        </select>
      </div>
      <div className={s.specs}>{specs.map(([k, v]) => <div key={k} className={s.spec}><span>{k}</span><span>{v}</span></div>)}</div>
      {m.s && m.s.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className={s.strongK}>{t('Сильные стороны', 'Strengths')}</span>
          <div className={s.tags}>{m.s.map(x => <span key={x} className={s.tag}>{x}</span>)}</div>
        </div>
      )}
      <button type="button" className={s.more} onClick={() => setOpen(o => !o)}>{open ? t('Скрыть архитектуру', 'Hide architecture') : t('Архитектура подробнее', 'Architecture details')}</button>
      {open && hw && (
        <>
          <dl className={s.extra}>{hw.facts.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
          {hw.srcNote && <div className={s.note}>{hw.srcNote}</div>}
        </>
      )}
      {hw && <div className={s.hw}><HwPanel hw={hw} /></div>}
    </div>
  );
}
