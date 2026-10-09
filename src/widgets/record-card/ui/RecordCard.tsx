import { useState } from 'react';
import { useLocale } from '@/shared/i18n';
import { useLoad } from '@/shared/lib/useLoad';
import { ErrorNote } from '@/shared/ui';
import { BLOCK_BY_ID, BLOCK_NAME, TOPICS } from '@/entities/term';
import { modelById } from '@/entities/model';
import { board, floor, fmt, unit } from '@/entities/benchmark';
import { atlasApi, courseFor, dateLabel, entryColor, EntryGlyph, KIND_LABEL, SECTION_L, type Section } from '@/entities/atlas-entry';
import { FavoriteButton } from '@/features/favorites';
import s from './RecordCard.module.css';

const PRED: Record<string, [string, string]> = { is_a: ['разновидность', 'kind of'], uses: ['использует', 'uses'], related_to: ['связано', 'related'] };
const PHRASE: Record<string, [string, string]> = { is_a: ['— разновидность', 'is a kind of'], uses: ['использует', 'uses'], related_to: ['связано с', 'is related to'] };

interface Props { section: Section; recordKey: string; modelId: string; onClose: () => void; onOpen: (section: Section, key: string) => void; onModel: (id: string) => void }

/** Карточка записи поверх карты. Перенос блока hasEvent прототипа: текст, ответ, связи, рейтинг, глиф, факты, источники, курс. */
export function RecordCard({ section, recordKey, modelId, onClose, onOpen, onModel }: Props) {
  const { t, locale, pick } = useLocale();
  const en = locale === 'en', li = en ? 1 : 0;
  const rec = useLoad(`rec:${section}:${recordKey}`, () => atlasApi.get(section, recordKey));
  const [all, setAll] = useState(false);
  const x = rec.data;
  const block = x?.domain ? BLOCK_BY_ID[x.domain] : null;
  const color = x ? entryColor({ kind: x.kind, sev: x.sev }) : '#888';
  const L = SECTION_L[section];
  const bd = x?.results ? board({ id: x.key, key: x.key, title: { ru: null, en: null }, kind: x.kind ?? '', results: x.results }) : [];
  const top = bd[0]?.[1] ?? 100, mine = bd.findIndex(r => r[0] === modelId), lim = 10;
  const idx = bd.map((_, i) => i).filter(i => all || i < lim || i === mine);
  const crs = x ? courseFor(x.course, x.domain) : null;
  const tagSection = (tag: string): Section => (tag === 'term' ? 'glossary' : tag === 'research' ? 'research' : tag === 'incident' ? 'incidents' : 'benchmarks');
  const status = !x ? '' : x.status === 'draft' ? t('черновик · источники указаны, редактор не проверял', 'draft · sources listed, not yet reviewed') : x.sources.length ? t('подтверждено источниками', 'confirmed by sources') + (x.checked ? t(' · проверено ', ' · checked ') + x.checked : '') : t('источник не зафиксирован', 'no source recorded');
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.box} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={s.col}>
          <div className={s.kick}><i style={{ background: color }} />{[L.kicker[li], x?.kind ? KIND_LABEL[x.kind]?.[li] ?? x.kind : '', block ? BLOCK_NAME[block.id][li] : '', section === 'glossary' && x?.topic ? TOPICS[x.topic]?.[li] : ''].filter(Boolean).join(' · ')}</div>
          {rec.error && <ErrorNote>{rec.error}</ErrorNote>}
          {x && (
            <>
              <h2 className={s.h}>{pick(x.title)}</h2>
              {pick(x.text) && <p className={s.text}>{pick(x.text)}</p>}
              {pick(x.response) && <div className={s.resp}><span className={s.label}>{L.response[li]}</span><span>{pick(x.response)}</span></div>}
              {x.relations.length > 0 && (
                <div className={s.rels}>
                  <span className={s.label}>{t('Связи', 'Relations')}</span>
                  {x.relations.map((r, i) => { const a = r.dir === 'out' ? pick(x.title) : pick(r.other.title), b = r.dir === 'out' ? pick(r.other.title) : pick(x.title); return (
                    <button key={i} type="button" className={s.rel} onClick={() => onOpen(tagSection(r.other.tag), r.other.key)}>
                      <span className={s.relS}>«{a}» {PHRASE[r.pred]?.[li] ?? r.pred} «{b}»</span>
                      <span className={s.relM}>{(PRED[r.pred]?.[li] ?? r.pred) + ' · ' + (r.basis === 'evidence' ? t('по источникам', 'from sources') : t('редакционно', 'editorial'))}</span>
                    </button>
                  ); })}
                </div>
              )}
              {bd.length > 0 && (
                <div className={s.lb}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span className={s.label} style={{ flex: 1 }}>{t('Рейтинг моделей', 'Model ranking')}</span><span className={s.relM}>{(unit(x.key) === 'elo' ? t('Эло · ', 'Elo · ') : '% · ') + bd.length + t(' моделей', ' models') + (x.checked ? t(' · проверено ', ' · checked ') + x.checked : '')}</span></div>
                  {idx.map(i => { const [id, v] = bd[i], m = modelById(id), me = id === modelId; return (
                    <button key={id} type="button" className={s.lbRow} style={{ background: me ? 'rgba(59,91,253,0.09)' : 'transparent' }} title={me ? t('Выбранная модель', 'Selected model') : t('Выбрать эту модель', 'Select this model')} onClick={() => onModel(id)}>
                      <span className={s.rank} style={{ background: i === 0 ? '#0b0b14' : i < 3 ? 'rgba(14,18,48,0.12)' : 'transparent', color: i === 0 ? '#fff' : i < 3 ? '#0b0b14' : '#6b7186' }}>{i + 1}</span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}><span className={s.lbName}>{m?.name ?? id}</span><span className={s.lbOrg}>{m ? m.orgName + ' · ' + (en ? m.countryEn : m.countryRu) : ''}</span></span>
                      <span className={s.bar}><i style={{ width: Math.max(3, (v - floor(x.key)) / (top - floor(x.key)) * 100).toFixed(1) + '%', background: i < 3 ? '#3b5bfd' : 'rgba(59,91,253,0.38)' }} /></span>
                      <span className={s.lbV}>{fmt(x.key, v, true)}</span>
                    </button>
                  ); })}
                  {bd.length > lim && <button type="button" className={s.more} onClick={() => setAll(a => !a)}>{all ? t('Показать первые 10', 'Show top 10') : t('Показать все ', 'Show all ') + bd.length}</button>}
                </div>
              )}
            </>
          )}
        </div>
        <div className={s.col}>
          <button type="button" className={s.close} onClick={onClose}>{t('закрыть', 'close')}</button>
          {x && (
            <>
              <EntryGlyph domain={x.domain ?? 'd_models'} color={color} seed={x.id * 131} />
              <dl className={s.facts}>
                <dt>{L.found[li]}</dt><dd className={s.mono}>{dateLabel(x.date, en)}</dd>
                <dt>{L.where[li]}</dt><dd>{pick(x.origin) || '—'}</dd>
                <dt>{t('статус', 'status')}</dt><dd style={{ display: 'flex', alignItems: 'center', gap: 6, color: x.status !== 'draft' && x.sources.length ? '#15803d' : '#a16207' }}><i style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />{status}</dd>
                {x.aliases.length > 0 && <><dt>{t('также', 'also')}</dt><dd>{x.aliases.join(' · ')}</dd></>}
              </dl>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className={s.label}>{t('Источники', 'Sources')}</span>
                {x.sources.map((src, i) => <a key={i} className={s.src} href={src.url} target="_blank" rel="noopener">{src.title || src.url} ↗</a>)}
                {!x.sources.length && <span className={s.relM}>—</span>}
              </div>
              {crs && (
                <a className={s.crs} href={crs.url} target="_blank" rel="noopener">
                  <span className={s.label}>{t('Разобрать в программе', 'Learn it in the programme')}</span>
                  <span className={s.crsName}>{en ? crs.en : crs.ru} →</span>
                  <span className={s.relM}>{(en ? crs.lvl.en : crs.lvl.ru) + ' · minders ' + crs.lvl.prog}</span>
                </a>
              )}
              <div><FavoriteButton uid={x.uid} /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
