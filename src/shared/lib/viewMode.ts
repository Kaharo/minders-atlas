import { useSyncExternalStore } from 'react';

/** Режим экрана атласа: «просто» показывает главное и раскрывает детали по запросу, «подробно» — все панели сразу. */
export type ViewMode = 'simple' | 'detail';
const KEY = 'atlas.view';
const read = (): ViewMode => { try { return localStorage.getItem(KEY) === 'detail' ? 'detail' : 'simple'; } catch { return 'simple'; } };
let mode: ViewMode = read();
const subs = new Set<() => void>();

export function setViewMode(m: ViewMode) {
  mode = m;
  try { localStorage.setItem(KEY, m); } catch { /* хранилище недоступно: режим живёт до перезагрузки */ }
  subs.forEach(f => f());
}
export const useViewMode = (): ViewMode => useSyncExternalStore(cb => { subs.add(cb); return () => { subs.delete(cb); }; }, () => mode, () => 'simple');
