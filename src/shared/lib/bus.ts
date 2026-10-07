// Крошечная шина событий между слоями без прямых импортов (например, «открыть вход» из любой фичи).
type Handler = () => void;
const handlers = new Map<string, Set<Handler>>();
export const bus = {
  on(event: string, h: Handler) { (handlers.get(event) ?? handlers.set(event, new Set()).get(event)!).add(h); return () => { handlers.get(event)?.delete(h); }; },
  emit(event: string) { handlers.get(event)?.forEach(h => h()); }
};
export const EVENTS = { openAuth: 'auth:open' } as const;
