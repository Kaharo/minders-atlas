import { useState } from 'react';
import { useLocale } from '@/shared/i18n';
import { ymLabel } from '@/shared/lib/format';
import { useLoad } from '@/shared/lib/useLoad';
import { ErrorNote } from '@/shared/ui';
import { BLOCK_BY_ID, TOPICS } from '@/entities/term';
import { modelById } from '@/entities/model';
import { atlasApi, KIND_LABEL, type Section } from '@/entities/atlas-entry';
import { FavoriteButton } from '@/features/favorites';
import s from './RecordCard.module.css';

/** Карточка записи поверх карты: текст, ответ/что делать, факты, источники; для рейтингов — таблица результатов. */
export function RecordCard({ section, recordKey, onClose }: { section: Section; recordKey: string; onClose: () => void }) {
  const { t, locale, pick } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const rec = useLoad(`rec:${section}:${recordKey}`, () => atlasApi.get(section, recordKey));
  const [all, setAll] = useState(false);
  const x = rec.data;
  const block = x?.domain ? BLOCK_BY_ID[x.domain] : null;
  const color = block?.color ?? '#6366f1';
  const lb = x?.results ? Object.entries(x.results).sort((a, b) => b[1] - a[1]) : [];
  const lbShown = all ? lb : lb.slice(0, 8), max = lb[0]?.[1] ?? 1;
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.box} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={s.col}>
          <div className={s.kick}><i style={{ background: color }} />{[block?.label[li], x?.kind ? KIND_LABEL[x.kind]?.[li] ?? x.kind : '', x?.topic ? TOPICS[x.topic]?.[li] : ''].filter(Boolean).join(' · ')}</div>
          {rec.error && <ErrorNote>{rec.error}</ErrorNote>}
          {x && (
            <>
              <h2 className={s.h}>{pick(x.title)}</h2>
              {pick(x.text) && <p className={s.text}>{pick(x.text)}</p>}
              {pick(x.response) && <div className={s.resp}><span className={s.label}>{section === 'incidents' ? t('Ответ', 'Response') : section === 'benchmarks' ? t('Как читать', 'How to read') : t('Что это значит', 'What it means')}</span><span>{pick(x.response)}</span></div>}
              {lb.length > 0 && (
                <div className={s.lb}>
                  <span className={s.label}>{t('Результаты', 'Results')} · {lb.length}</span>
                  {lbShown.map(([id, v], i) => { const m = modelById(id); return (
                    <div key={id} className={s.lbRow}>
                      <span className={`${s.rank} ${i === 0 ? s.rank1 : ''}`}>{i + 1}</span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}><span className={s.lbName}>{m?.name ?? id}</span><span className={s.lbOrg}>{m?.orgName ?? ''}</span></span>
                      <span className={s.bar}><i style={{ width: (v / max) * 100 + '%' }} /></span>
                      <span className={s.lbV}>{v}</span>
                    </div>
                  ); })}
                  {lb.length > 8 && <button type="button" className={s.close} style={{ alignSelf: 'flex-start' }} onClick={() => setAll(a => !a)}>{all ? t('Свернуть', 'Show less') : t(`Все ${lb.length}`, `All ${lb.length}`)}</button>}
                </div>
              )}
            </>
          )}
        </div>
        <div className={s.col}>
          <button type="button" className={s.close} onClick={onClose}>{t('Закрыть', 'Close')}</button>
          {x && (
            <>
              <dl className={s.facts}>
                <dt>{t('Когда', 'When')}</dt><dd>{x.date ? ymLabel(x.date.ym) : t('без единой даты', 'no single date')}</dd>
                {pick(x.origin) && <><dt>{t('Где', 'Where')}</dt><dd>{pick(x.origin)}</dd></>}
                {x.sev != null && <><dt>{t('Тяжесть', 'Severity')}</dt><dd>{x.sev} / 3</dd></>}
                {x.status && <><dt>{t('Статус', 'Status')}</dt><dd className={x.status === 'draft' ? s.draft : ''}>{x.status === 'draft' ? t('черновик, источник проверяется', 'draft, source under review') : t('опубликовано', 'published')}</dd></>}
                {x.aliases.length > 0 && <><dt>{t('Также', 'Also')}</dt><dd>{x.aliases.join(' · ')}</dd></>}
              </dl>
              {x.sources.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className={s.label}>{t('Источники', 'Sources')}</span>
                  {x.sources.map((src, i) => <a key={i} className={s.src} href={src.url} target="_blank" rel="noopener">{src.title || src.url} ↗</a>)}
                </div>
              )}
              <div><FavoriteButton uid={x.uid} /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
