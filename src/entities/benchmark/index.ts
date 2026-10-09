import { api } from '@/shared/api/client';

/** Таблицы результатов бенчмарков для карточки модели и пикера. Перенос ATLAS_SCORES. */
export interface Bench { id: string; key: string; title: { ru: string | null; en: string | null }; kind: string; results: Record<string, number> | null }
const UNIT: Record<string, 'elo' | '%'> = { arena: 'elo' };
export const unit = (bid: string) => UNIT[bid] ?? '%';
export const fmt = (bid: string, v: number, bare?: boolean) => (unit(bid) === 'elo' ? String(Math.round(v)) : v.toFixed(1) + (bare ? '' : '%'));
export const floor = (bid: string) => (unit(bid) === 'elo' ? 1150 : 0);
export const board = (b: Bench) => Object.entries(b.results ?? {}).sort((a, c) => c[1] - a[1]);
export const rankOf = (b: Bench, mid: string) => { const bd = board(b), i = bd.findIndex(r => r[0] === mid); return i < 0 ? null : { rank: i + 1, n: bd.length, v: bd[i][1] }; };

let cache: Promise<Bench[]> | null = null;
/** Все бенчмарки с результатами: один запрос на сессию. */
export const loadBenches = () => (cache ??= api.get<{ items: { key: string; title: { ru: string | null; en: string | null }; kind: { kind: string } }[] }>('/benchmarks').then(r =>
  Promise.all(r.items.map(it => api.get<{ results: Record<string, number> | null }>('/benchmarks/' + encodeURIComponent(it.key)).then(x => ({ id: it.key, key: it.key, title: it.title, kind: it.kind.kind, results: x.results }))))));
