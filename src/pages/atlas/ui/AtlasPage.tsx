import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { useLoad } from '@/shared/lib/useLoad';
import { plural } from '@/shared/lib/format';
import { BLOCK_BY_ID, BLOCK_DEF, BLOCK_NAME, FIRST_YEAR, type BlockId } from '@/entities/term';
import { atlasApi, entryColor, isSection, SECTION_LABEL, type Section } from '@/entities/atlas-entry';
import { modelById, DEFAULT_MODEL, supportFor } from '@/entities/model';
import { loadBenches } from '@/entities/benchmark';
import { useAtlasFilter } from '@/features/atlas-filter';
import { buildHarnessTrace, buildLearnTrace, indexEntries, useTraceRunner, SAMPLES, SAMPLES_EN } from '@/features/trace';
import { ArchMap, type ArchPoint, type HwData } from '@/widgets/arch-map';
import { AtlasList } from '@/widgets/atlas-list';
import { ModelCard } from '@/widgets/model-card';
import { ModelPicker } from '@/widgets/model-picker';
import { TimelineBand } from '@/widgets/timeline-band';
import { RecordCard } from '@/widgets/record-card';
import { PromptBar } from '@/widgets/prompt-bar';
import { LearnPanel } from '@/widgets/learn-panel';
import { GpuStrip } from '@/widgets/gpu-strip';
import s from './AtlasPage.module.css';

const ZONE_G: Record<string, string> = { d_trust: 'trust', d_context: 'context', d_runtime: 'runtime', d_quality: 'quality' };
const useWidth = () => { const [w, setW] = useState(() => window.innerWidth); useEffect(() => { const f = () => setW(window.innerWidth); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []); return w; };

/** Главный экран атласа: карта архитектуры с записями раздела, запрос через контур, список слева, модель справа, шкала времени снизу. */
export function AtlasPage() {
  const { section, key } = useParams<{ section: string; key?: string }>();
  const nav = useNavigate();
  const { t, locale, pick } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const f = useAtlasFilter();
  const cw = useWidth();
  const [hw, setHw] = useState<HwData | null>(null);
  const [picker, setPicker] = useState(false);
  const [sheet, setSheet] = useState<'none' | 'blocks' | 'points' | 'model'>('none');
  const simple = true; // режим «Подробно» убран: пример запроса вынесен в отдельный пункт меню
  const [show, setShow] = useState({ list: false, model: false });
  const tr = useTraceRunner();
  // «Запрос» — отдельный режим карты: путь фразы по шагам. Остальные пункты меню показывают записи своего раздела точками.
  const req = section === 'example' || section === 'request';
  const ok = isSection(section) || req;
  const S = (isSection(section) ? section : 'glossary') as Section;
  const list = useLoad('atlas:' + S, () => atlasApi.list(S), ok);
  const benches = useLoad('benches', loadBenches);
  useEffect(() => { if (ok) document.title = (req ? (li ? 'Example' : 'Пример') : SECTION_LABEL[S][li]) + ' · minders atlas'; }, [S, ok, li, req]);
  useEffect(() => { tr.stop(); }, [S, req]); // eslint-disable-line react-hooks/exhaustive-deps

  const entries = useMemo(() => (list.data ?? []).slice().sort((a, b) => (b.date?.ym ?? '').localeCompare(a.date?.ym ?? '')), [list.data]);
  const byZone = useMemo(() => entries.filter(e => !f.zone || e.domain.domain === f.zone), [entries, f.zone]);
  const shown = useMemo(() => byZone.filter(e => (!f.kind || e.kind.kind === f.kind) && (!f.year || (f.year === 'old' ? !!e.date && e.date.year < FIRST_YEAR : e.date?.year === Number(f.year)))), [byZone, f.kind, f.year]);
  const counts = useMemo(() => { const c: Record<string, number> = {}; entries.forEach(e => { c[e.domain.domain] = (c[e.domain.domain] ?? 0) + 1; }); return c; }, [entries]);
  const narrowNow = cw < 760;
  // простой режим: точки записей появляются, когда человек открыл список, выбрал область или запись
  const browse = simple && !narrowNow && !req;
  const ptsOn = req ? false : browse || !simple || (narrowNow ? sheet === 'points' : show.list) || !!f.zone || !!key || tr.hits.length > 0;
  const points: ArchPoint[] = useMemo(() => (ptsOn ? entries.map((e, i) => ({ id: e.key, n: i + 1, title: pick(e.title), color: S === 'glossary' ? BLOCK_BY_ID[e.domain.domain as BlockId]?.color ?? entryColor(e) : entryColor(e), dom: e.domain.domain })) : []), [entries, pick, ptsOn, S]);
  const pointsKey = useMemo(() => S + ':' + locale + ':' + points.length, [S, locale, points.length]);
  const noun = S === 'glossary' ? (li ? ['term', 'terms', 'terms'] : ['термин', 'термина', 'терминов']) : li ? ['incident', 'incidents', 'incidents'] : ['инцидент', 'инцидента', 'инцидентов'];
  const zoneCounts = useMemo(() => Object.keys(ZONE_G).map(k => `${ZONE_G[k]}=${counts[k] ?? 0} ${plural(counts[k] ?? 0, noun as [string, string, string], locale)}`).join(';'), [counts, noun, locale]);
  const modelId = modelById(f.model) ? f.model : DEFAULT_MODEL;
  const support = useMemo(() => supportFor(modelId), [modelId]);
  const index = useMemo(() => indexEntries(entries, locale), [entries, locale]);

  const go = useCallback((k: string | null) => nav(`/atlas/${req ? 'example' : S}${k && !req ? '/' + encodeURIComponent(k) : ''}${location.search}`), [nav, S, req]);
  const goTo = useCallback((sec: Section, k: string) => nav(`/atlas/${sec}/${encodeURIComponent(k)}`), [nav]);
  const onZone = useCallback((z: string) => f.setZone(f.zone === z ? null : z), [f]);
  const onSubmit = useCallback((text: string) => {
    go(null);
    if (req || S === 'glossary') tr.start(buildLearnTrace(text, modelId, locale));
    else { const r = buildHarnessTrace(text, entries, index, locale); tr.start(r.steps, r.hits); }
  }, [S, req, modelId, locale, entries, index, tr, go]);

  const learn = (req || S === 'glossary') && !!tr.steps;
  const sample = (locale === 'en' ? SAMPLES_EN : SAMPLES)[0];
  const preview = useMemo(() => (req ? buildLearnTrace(sample, modelId, locale) : null), [req, sample, modelId, locale]);
  useEffect(() => { if (f.zone) setShow(v => (v.list ? v : { ...v, list: true })); }, [f.zone]);

  if (!ok) return <Navigate to="/atlas/example" replace />;
  const narrow = cw < 760;
  const dock = simple && !narrow, sideW = cw < 1000 ? 272 : cw < 1240 ? 300 : 328;
  const listOn = !narrow && !simple, modelOn = !narrow && (!simple || show.model), timeOn = !narrow && browse;
  const cur = tr.steps && tr.step != null ? tr.steps[tr.step] : null;
  const asideW = !listOn ? 0 : cw < 1000 ? 216 : cw < 1240 ? 250 : 292, leftW = !modelOn ? 0 : cw < 1000 ? 236 : cw < 1240 ? 268 : 304;
  const block = f.zone ? BLOCK_BY_ID[f.zone as BlockId] : null;
  const lvl = f.zone ? support.level[f.zone] : 0;
  const lvlWord = lvl === -1 ? t('не зависит от модели', 'model-independent') : lvl === 2 ? t('зона активна', 'zone active') : lvl === 1 ? t('частичная активация', 'partly active') : t('зона не активирована', 'zone not active');
  const blockEl = block && (
    <div className={s.active} style={simple ? { marginTop: 0, marginBottom: 7 } : undefined}>
      <div className={s.ah}><i style={{ background: block.color, boxShadow: `0 0 8px ${block.color}` }} /><b>{block.label[li]} · {BLOCK_NAME[block.id][li]}</b><button type="button" onClick={() => f.setZone(null)}>{t('сброс', 'reset')}</button></div>
      <div className={s.ad}>{BLOCK_DEF[block.id][li]}</div>
      <div className={s.as}>{lvlWord} · {counts[block.id] ?? 0} {S === 'glossary' ? t('терминов', 'terms') : t('ключ. точек', 'key points')}</div>
    </div>
  );
  const listEl = <AtlasList section={S} entries={byZone} shown={shown} zone={f.zone} onZone={f.setZone} kind={f.kind} onKind={f.setKind} selected={key ?? null} onPick={go} />;
  const modelEl = (compact?: boolean) => <ModelCard modelId={modelId} onOpenPicker={() => setPicker(true)} onBench={bid => goTo('benchmarks', bid)} hw={hw} benches={benches.data} compact={compact} />;
  return (
    <div className={s.stage}>
      <ArchMap modelId={modelId} focus={S === 'incidents' ? 'incidents' : S === 'glossary' ? 'learn' : 'glossary'} points={points} pointsKey={pointsKey} selected={key ?? null} hitsKey={tr.hits.map(h => h.id).join(',')} zone={f.zone || null} zoneCounts={zoneCounts} supportKey={support.key}
        stepKey={cur?.key ?? null} stepN={tr.runId * 1000 + (tr.step ?? -1)} stepTitle={cur?.title} stepDone={cur?.done} stepColor={cur?.color}
        insetL={dock ? sideW + 34 : asideW ? asideW + 34 : 16} insetR={leftW ? leftW + 34 : 16} insetT={narrow ? (tr.steps ? 150 : 124) : dock ? 46 : 190} insetB={narrow ? (learn ? 250 : 64) : timeOn ? 132 : dock ? (cw < 1320 ? 150 : 104) : 104} plain={simple} browse={browse} en={locale === 'en'} hwDock="bottom" hwHidden onPoint={go} onZone={onZone} onHw={setHw} onModelClick={() => (simple ? setShow(v => ({ ...v, model: !v.model })) : setPicker(true))} />
      {!dock && <PromptBar onSubmit={onSubmit} steps={tr.steps} step={tr.step} open={tr.open} hits={tr.hits} hitLabel={id => { const e = entries.find(x => x.key === id); return e ? { label: pick(e.title).length > 26 ? pick(e.title).slice(0, 25) + '…' : pick(e.title), color: entryColor(e) } : null; }} onHit={go} onJump={tr.jump} onClear={tr.clearHits}
        showSamples={!narrow && cw >= 460} cardBottom={narrow ? 60 : timeOn ? 150 : 60} style={{ top: narrow ? 12 : 92, width: narrow ? 'calc(100% - 36px)' : `min(520px, calc(100% - ${2 * (Math.max(leftW, asideW) + 46)}px))` }} />}
      {list.loading && !list.data && <span className={s.status}>{t('Загружаю записи…', 'Loading entries…')}</span>}
      {list.error && <span className={s.status} style={{ color: '#b91c1c' }}>{list.error}</span>}
      {dock && browse && (
        <div className={s.side} style={{ width: sideW }}>
          <div className={s.sideList}>{blockEl}{listEl}</div>
        </div>
      )}
      {dock && !browse && (
        <div className={s.side} style={{ width: sideW }}>
          <PromptBar onSubmit={onSubmit} steps={tr.steps} step={tr.step} open={tr.open} hits={tr.hits} hitLabel={id => { const e = entries.find(x => x.key === id); return e ? { label: pick(e.title).length > 26 ? pick(e.title).slice(0, 25) + '…' : pick(e.title), color: entryColor(e) } : null; }} onHit={go} onJump={tr.jump} onClear={tr.clearHits}
        showSamples docked paused={tr.paused} onToggle={tr.toggle} preview={preview} onPreview={i => { tr.start(preview!); tr.jump(i); }} detail={learn && cur ? <LearnPanel steps={tr.steps!} step={tr.step!} onClose={tr.stop} bare /> : undefined} />
          {(
            <div className={`${s.answer} ${req ? s.answerUp : ''} ${tr.steps && tr.step === tr.steps.length - 1 ? s.answerOn : ''}`} aria-live="polite">
              <b>{t('Ответ', 'Answer')}</b>
              <span>{!tr.steps ? t('Сюда вернётся ответ, когда запрос пройдёт весь путь.', 'The answer returns here once the request has gone the whole way.') : tr.step === tr.steps.length - 1 ? t('Запрос прошёл весь путь: здесь пользователь получает ответ. Атлас показывает путь запроса, сам текст ответа он не генерирует.', 'The request has gone the whole way: this is where the user gets the answer. The atlas shows the path; it does not generate the answer text.') : t(`Запрос в пути: шаг ${(tr.step ?? 0) + 1} из ${tr.steps.length}.`, `Request in progress: step ${(tr.step ?? 0) + 1} of ${tr.steps.length}.`)}</span>
            </div>
          )}
        </div>
      )}
      {listOn && (
        <div className={s.left} style={{ width: asideW }}>
          {learn && cur ? <LearnPanel steps={tr.steps!} step={tr.step!} onClose={tr.stop} /> : listEl}
        </div>
      )}
      {modelOn && (
        <div className={`${s.right} ${simple ? s.under : ''}`} style={{ width: leftW }}>
          {modelEl()}
          {!simple && blockEl}
        </div>
      )}
      {!narrow && !timeOn && !browse && hw && <GpuStrip gb={hw.gb} hiddenNote={hw.hid ? hw.head : undefined} style={cw < 1320 ? { left: dock ? sideW + 34 : asideW + 40, right: leftW ? leftW + 40 : 16, bottom: 56 } : { left: dock ? sideW + 190 : asideW + 40, right: leftW ? leftW + 40 : 196 }} />}
      {timeOn && <TimelineBand section={S} style={{ left: dock ? sideW + 40 : asideW + 40, right: leftW ? leftW + 40 : 24 }} entries={byZone} shown={shown} year={f.year} onYear={f.setYear} zone={f.zone} onZone={f.setZone} selected={key ?? null} onPick={go} counts={counts} />}
      {narrow && !learn && (
        <div className={s.tabs}>
          {(['blocks', 'points', 'model'] as const).map(k => <button key={k} type="button" className={`${s.tab} ${sheet === k ? s.tabOn : ''}`} onClick={() => setSheet(sheet === k ? 'none' : k)}>{k === 'blocks' ? t('Блоки', 'Blocks') : k === 'points' ? t('Точки', 'Points') : t('Модель', 'Model')}</button>)}
        </div>
      )}
      {narrow && sheet !== 'none' && !learn && (
        <div className={s.sheet}>
          {sheet === 'points' ? listEl : sheet === 'model' ? modelEl(true) : (
            <div className={s.active} style={{ marginTop: 0 }}>
              {Object.entries(BLOCK_BY_ID).map(([id, b]) => <button key={id} type="button" className={s.ah} style={{ padding: '7px', borderRadius: 11, background: f.zone === id ? 'rgba(14,18,48,0.05)' : 'transparent' }} onClick={() => onZone(id)}><i style={{ background: b.color }} /><b style={{ fontSize: 12.5, fontWeight: 400 }}>{b.label[li]}</b><span className={s.as}>{counts[id] ?? 0}</span></button>)}
            </div>
          )}
        </div>
      )}
      {narrow && learn && cur && <div className={s.sheet} style={{ bottom: 12 }}><LearnPanel steps={tr.steps!} step={tr.step!} onClose={tr.stop} /></div>}
      {key && <RecordCard section={S} recordKey={key} modelId={modelId} onClose={() => go(null)} onOpen={goTo} onModel={id => { f.setModel(id); }} />}
      {picker && <ModelPicker current={modelId} onPick={id => { f.setModel(id); setPicker(false); }} onClose={() => setPicker(false)} benches={benches.data} benchId={S === 'benchmarks' && key ? key : 'hle'} />}
    </div>
  );
}
