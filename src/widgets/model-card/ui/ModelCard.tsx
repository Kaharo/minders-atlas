import { Fragment, useState } from 'react';
import { useLocale } from '@/shared/i18n';
import { modelById, ru, tagLabel, undisclosed } from '@/entities/model';
import { fmt, rankOf, type Bench } from '@/entities/benchmark';
import { HwPanel, type HwData } from '@/widgets/arch-map';
import s from './ModelCard.module.css';

interface Props { modelId: string; onOpenPicker: () => void; onBench: (bid: string) => void; hw: HwData | null; benches: Bench[] | null; className?: string; compact?: boolean }

/** Правая колонка карты: модель, характеристики, сильные стороны и ограничения, место в рейтингах, «где помещается». Перенос mc/mcR/hw прототипа. */
export function ModelCard({ modelId, onOpenPicker, onBench, hw, benches, className, compact }: Props) {
  const { t, locale } = useLocale();
  const en = locale === 'en';
  const [open, setOpen] = useState(false);
  const m = modelById(modelId);
  if (!m) return null;
  const lim = m.l ?? [], strong = Array.from(new Set([...(m.s ?? []), ...(m.u ?? []), ...(m.tags ?? [])])).filter(k => k !== 'frontier' && !lim.includes(k));
  const DEP: Record<string, string> = { api: 'API', cloud: t('облако', 'cloud'), finetune: t('дообучение', 'fine-tuning'), local: t('локально', 'local'), selfhost: t('свой сервер', 'self-host'), edge: t('устройство', 'device'), weights: t('веса', 'weights') };
  const specs: [string, string][] = [
    [t('Параметры', 'Parameters'), undisclosed(m.par) ? t('не раскрыты', 'undisclosed') : ru(m.par)],
    [t('Контекст, токенов', 'Context, tokens'), undisclosed(m.ctx) ? t('не указан', 'not stated') : m.ctx],
    [t('Веса', 'Weights'), m.lic === 'Proprietary' ? t('закрытые', 'closed') : t('открытые · ', 'open · ') + (m.lic ?? '')],
    [t('Выпуск', 'Released'), m.rel ?? '—']
  ];
  const extra: [string, string][] = [
    [t('Активных параметров', 'Active parameters'), undisclosed(m.act) ? '—' : ru(m.act)],
    [t('Доступ', 'Access'), (m.dep ?? []).map(d => DEP[d] ?? d).join(', ') || '—'],
    [t('Языки', 'Languages'), m.lang === 'Multilingual' ? t('много языков', 'many') : m.lang ?? '—']
  ];
  const ranks = (benches ?? []).map(b => ({ b, r: rankOf(b, m.id) }));
  const rk = (r: number | null) => ({ background: !r ? 'transparent' : r === 1 ? '#0b0b14' : r <= 3 ? 'rgba(14,18,48,0.12)' : 'transparent', color: !r ? '#8a90a6' : r === 1 ? '#fff' : r <= 3 ? '#0b0b14' : '#6b7186' });
  return (
    <div className={`${s.card} ${className ?? ''}`}>
      <span className={s.kicker}>{t('Модель', 'Model')}</span>
      <button type="button" className={s.pickWrap} onClick={onOpenPicker}>
        <div className={s.pickText}><span className={s.org}>{m.orgName} · {m.flag ? m.flag + ' ' : ''}{en ? m.countryEn : m.countryRu}</span><span className={s.name}>{m.name}</span></div>
        <span className={s.caret}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></span>
      </button>
      <div className={s.specs}>{specs.map(([k, v]) => <div key={k} className={s.spec}><span>{k}</span><span>{v}</span></div>)}</div>
      {!compact && (
        <>
          {strong.length > 0 && <div className={s.sec}><span className={s.strongK}>{t('Сильные стороны', 'Strengths')}</span><div className={s.tags}>{strong.map(k => <span key={k} className={s.tag}>{tagLabel(k, en)}</span>)}</div></div>}
          {lim.length > 0 && <div className={s.sec}><span className={s.strongK}>{t('Ограничения', 'Limitations')}</span><div className={s.tags}>{lim.map(k => <span key={k} className={s.lim}>{tagLabel(k, en)}</span>)}</div></div>}
          {ranks.length > 0 && (
            <div className={s.sec}>
              <span className={s.strongK}>{t('Место в рейтингах', 'Place in rankings')}</span>
              {ranks.map(({ b, r }) => (
                <button key={b.id} type="button" className={s.rank} onClick={() => onBench(b.id)}>
                  <span className={s.rankNo} style={rk(r?.rank ?? null)}>{r ? '#' + r.rank : '—'}</span>
                  <span className={s.rankName}>{en ? b.title.en ?? b.title.ru : b.title.ru}</span>
                  <span className={s.rankV} style={{ color: r ? '#22263a' : '#8a90a6' }}>{r ? fmt(b.id, r.v) : t('нет данных', 'no data')}</span>
                </button>
              ))}
            </div>
          )}
          <button type="button" className={s.more} onClick={() => setOpen(o => !o)}>{open ? t('Скрыть подробности', 'Hide details') : t('Архитектура и доступ', 'Architecture and access')}</button>
          {open && (
            <>
              <div className={s.archLine}>{undisclosed(m.arch) || m.arch === 'Undisclosed' ? t('Архитектура не раскрыта.', 'Architecture not disclosed.') : m.arch}</div>
              <dl className={s.extra}>{extra.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
              {hw && <dl className={s.extra}>{hw.facts.slice(2).map(([k, v]: [string, string]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>}
              <div className={s.note}>{hw && !hw.hid && hw.srcNote !== undefined ? (hw.srcNote ? hw.srcNote + ' ' : '') + t('Обвязка вокруг — та же для любой модели.', 'The scaffolding around is the same for any model.') : t('Архитектура не раскрыта — форма ядра условная. Обвязка модели вокруг от модели не зависит.', 'Architecture undisclosed: the core shape is schematic. The scaffolding around does not depend on the model.')}</div>
            </>
          )}
        </>
      )}
      {hw && <div className={s.hw}><HwPanel hw={hw} compact={compact} /></div>}
    </div>
  );
}
