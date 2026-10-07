import { useEffect, useRef, useState } from 'react';

export interface Loadable<T> { data: T | null; error: string | null; loading: boolean; reload: () => void }

/** Минимальный загрузчик: перезапрашивает при смене ключа, игнорирует устаревшие ответы. */
export function useLoad<T>(key: string, fn: () => Promise<T>, enabled = true): Loadable<T> {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({ data: null, error: null, loading: enabled });
  const [tick, setTick] = useState(0);
  const seq = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    const my = ++seq.current;
    setState(s => ({ ...s, loading: true, error: null }));
    fn().then(
      data => { if (my === seq.current) setState({ data, error: null, loading: false }); },
      e => { if (my === seq.current) setState(s => ({ ...s, error: (e as Error).message, loading: false })); }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick, enabled]);
  return { ...state, reload: () => setTick(t => t + 1) };
}
