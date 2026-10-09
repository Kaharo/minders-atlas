import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { useLoad } from '@/shared/lib/useLoad';
import { BLOCK_BY_ID, FIRST_YEAR } from '@/entities/term';
import { atlasApi, isSection, SECTION_LABEL, type Section } from '@/entities/atlas-entry';
import { modelById, DEFAULT_MODEL } from '@/entities/model';
import { useAtlasFilter } from '@/features/atlas-filter';
import { ArchMap, type ArchPoint, type HwData } from '@/widgets/arch-map';
import { AtlasList } from '@/widgets/atlas-list';
import { ModelCard } from '@/widgets/model-card';
import { TimelineBand } from '@/widgets/timeline-band';
import { RecordCard } from '@/widgets/record-card';
import s from './AtlasPage.module.css';

const HEX: Record<string, string> = { d_models: '#6366f1', d_context: '#3b82f6', d_runtime: '#10b981', d_quality: '#f59e0b', d_trust: '#ef4444' };
const ZONE_G: Record<string, string> = { d_trust: 'trust', d_context: 'context', d_runtime: 'runtime', d_quality: 'quality' };

/** Главный экран атласа: 3D-карта архитектуры с записями раздела, список слева, модель справа, шкала времени снизу. */
export function AtlasPage() {
  const { section, key } = useParams<{ section: string; key?: string }>();
  const nav = useNavigate();
  const { t, locale, pick } = useLocale();
  const f = useAtlasFilter();
  const [hw, setHw] = useState<HwData | null>(null);
  const [sheet, setSheet] = useState<'none' | 'list' | 'model'>('none');
  const ok = isSection(section);
  const S = (ok ? section : 'glossary') as Section;
  const list = useLoad('atlas:' + S, () => atlasApi.list(S), ok);
  useEffect(() => { if (ok) document.title = SECTION_LABEL[S][locale === 'en' ? 1 : 0] + ' · minders atlas'; }, [S, ok, locale]);

  const entries = useMemo(() => (list.data ?? []).slice().sort((a, b) => (b.date?.ym ?? '').localeCompare(a.date?.ym ?? '')), [list.data]);
  const byZone = useMemo(() => entries.filter(e => !f.zone || e.domain.domain === f.zone), [entries, f.zone]);
  const shown = useMemo(() => byZone.filter(e => (!f.kind || e.kind.kind === f.kind) && (!f.year || (f.year === 'old' ? !!e.date && e.date.year < FIRST_YEAR : e.date?.year === Number(f.year)))), [byZone, f.kind, f.year]);
  const counts = useMemo(() => { const c: Record<string, number> = {}; entries.forEach(e => { c[e.domain.domain] = (c[e.domain.domain] ?? 0) + 1; }); return c; }, [entries]);
  const points: ArchPoint[] = useMemo(() => shown.map((e, i) => ({ id: e.key, n: i + 1, title: pick(e.title), color: HEX[e.domain.domain] ?? '#999', dom: e.domain.domain })), [shown, pick]);
  const pointsKey = useMemo(() => points.map(p => p.id).join(','), [points]);
  const zoneCounts = useMemo(() => Object.entries(counts).filter(([k]) => ZONE_G[k]).map(([k, n]) => `${ZONE_G[k]}=${n}`).join(';'), [counts]);
  const modelId = modelById(f.model) ? f.model : DEFAULT_MODEL;

  const go = useCallback((k: string | null) => nav(`/atlas/${S}${k ? '/' + encodeURIComponent(k) : ''}${location.search}`), [nav, S]);
  const onZone = useCallback((z: string) => f.setZone(f.zone === z ? null : z), [f]);

  if (!ok) return <Navigate to="/atlas/glossary" replace />;
  const listEl = (cls?: string) => <AtlasList className={cls} section={S} entries={byZone} shown={shown} zone={f.zone} onZone={f.setZone} kind={f.kind} onKind={f.setKind} selected={key ?? null} onPick={go} />;
  return (
    <div className={s.stage}>
      <ArchMap modelId={modelId} focus={S === 'incidents' ? 'incidents' : 'glossary'} points={points} pointsKey={pointsKey} selected={key ?? null} zone={f.zone || null} zoneCounts={zoneCounts}
        insetL={340} insetR={330} insetT={24} insetB={150} hwDock="bottom" hwHidden onPoint={go} onZone={onZone} onHw={setHw} />
      {list.loading && !list.data && <span className={s.status}>{t('Загружаю записи…', 'Loading entries…')}</span>}
      {list.error && <span className={s.status} style={{ color: '#b91c1c' }}>{list.error}</span>}
      <div className={s.left}>{listEl()}</div>
      <div className={s.right}><ModelCard modelId={modelId} onModel={f.setModel} hw={hw} /></div>
      <TimelineBand style={{ left: 362, right: 350 }} entries={byZone} shown={shown} year={f.year} onYear={f.setYear} zone={f.zone} onZone={f.setZone} selected={key ?? null} onPick={go} counts={counts} />
      <div className={s.tabs}>
        {(['list', 'model'] as const).map(k => <button key={k} type="button" className={`${s.tab} ${sheet === k ? s.tabOn : ''}`} onClick={() => setSheet(sheet === k ? 'none' : k)}>{k === 'list' ? t('Записи', 'Entries') : t('Модель', 'Model')}</button>)}
        {f.zone && <button type="button" className={s.tab} onClick={() => f.setZone(null)}>{BLOCK_BY_ID[f.zone as keyof typeof BLOCK_BY_ID]?.label[locale === 'en' ? 1 : 0]} ×</button>}
      </div>
      {sheet !== 'none' && <div className={s.sheet}>{sheet === 'list' ? listEl() : <ModelCard modelId={modelId} onModel={f.setModel} hw={hw} />}</div>}
      {key && <RecordCard section={S} recordKey={key} onClose={() => go(null)} />}
    </div>
  );
}
