import { ATLAS_MODELS } from './lib/registry';
export { supportFor, ORDER, type Support } from './lib/support';

export interface ModelInfo { id: string; ver: string; name: string; orgName: string; countryRu: string; countryEn: string; cc: string; flag: string; arch: string; par: string; act: string; ctx: string; lic?: string; rel?: string; lang?: string; dep?: string[]; s?: string[]; u?: string[]; l?: string[]; tags?: string[]; pB: number | null; fam: string; c: string }
export interface Family { key: string; name: string; orgName: string; countryRu: string; countryEn: string; cc: string; flag: string; models: ModelInfo[] }

export const models: ModelInfo[] = ATLAS_MODELS.models;
export const families: Family[] = ATLAS_MODELS.families;
export const modelById = (id: string): ModelInfo | undefined => ATLAS_MODELS.byModel[id];
export const DEFAULT_MODEL: string = 'gpt-oss-120b';
export const tagLabel = (k: string, en: boolean): string => ((ATLAS_MODELS.tags[k] as [string, string] | undefined) ?? [k, k])[en ? 0 : 1];
export const ru = (v: string) => (({ undisclosed: 'не раскрыто', compact: 'компактная' }) as Record<string, string>)[v] ?? v;
export const undisclosed = (x: string | undefined) => !x || x === '—' || x === 'undisclosed';

export interface PickFilter { size?: string; w?: string; arch?: string; ctx?: string }
export const PICK_DEFS = (en: boolean) => [
  { key: 'size' as const, label: en ? 'Size' : 'Размер', opts: [['all', en ? 'all' : 'все'], ['s', '≤ 10B'], ['m', '10–100B'], ['l', '100B–1T'], ['xl', '≥ 1T'], ['na', en ? 'undisclosed' : 'не раскрыт']] },
  { key: 'w' as const, label: en ? 'Weights' : 'Веса', opts: [['all', en ? 'all' : 'все'], ['open', en ? 'open' : 'открытые'], ['closed', en ? 'closed' : 'закрытые']] },
  { key: 'arch' as const, label: en ? 'Architecture' : 'Архитектура', opts: [['all', en ? 'all' : 'все'], ['moe', 'MoE'], ['dense', en ? 'dense' : 'плотная']] },
  { key: 'ctx' as const, label: en ? 'Context' : 'Контекст', opts: [['all', en ? 'any' : 'любой'], ['128', '≥ 128K'], ['1m', '≥ 1M']] }
];
export function pickPass(x: ModelInfo, pf: PickFilter) {
  const pB = x.pB, sz = pf.size || 'all', w = pf.w || 'all', ar = pf.arch || 'all', cx = pf.ctx || 'all';
  if (sz !== 'all') { const b = !pB ? 'na' : pB <= 10 ? 's' : pB < 100 ? 'm' : pB < 1000 ? 'l' : 'xl'; if (b !== sz) return false; }
  if (w !== 'all') { const op = (x.dep || []).includes('weights'); if ((w === 'open') !== op) return false; }
  if (ar !== 'all') { const moe = /moe/i.test(x.arch || ''); if ((ar === 'moe') !== moe) return false; }
  if (cx !== 'all') { const m0 = String(x.ctx || '').match(/([\d.]+)\s*([KM])/i), v = m0 ? parseFloat(m0[1]) * (m0[2].toUpperCase() === 'M' ? 1e6 : 1e3) : 0; if (v < (cx === '1m' ? 1e6 : 128e3)) return false; }
  return true;
}
