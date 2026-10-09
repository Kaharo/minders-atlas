import { useCallback, useEffect, useRef, useState } from 'react';
import type { Hit, Step } from './buildTrace';

export interface TraceState { steps: Step[] | null; step: number | null; hits: Hit[]; runId: number; open: boolean }

/** Проигрывает шаги с таймингами прототипа (_runStep): пауза на переход между зонами, задержка на чтение. */
export function useTraceRunner() {
  const [st, setSt] = useState<TraceState>({ steps: null, step: null, hits: [], runId: 0, open: false });
  const tt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const at = useRef<string | null>(null);
  const id = useRef(0);
  const pending = useRef<Hit[]>([]);
  const stepsRef = useRef<Step[] | null>(null);
  const clear = () => { if (tt.current) clearTimeout(tt.current); tt.current = null; };

  const runStep = useCallback((i: number) => {
    clear();
    const steps = stepsRef.current; if (!steps) return;
    if (i >= steps.length) return;
    const my = ++id.current, from = at.current, to = steps[i].key;
    const go = () => {
      if (my !== id.current || stepsRef.current !== steps) return;
      at.current = to;
      setSt(s => ({ ...s, step: i, runId: my, hits: steps[i].fan ? pending.current : s.hits }));
      tt.current = setTimeout(() => runStep(i + 1), i === steps.length - 1 ? 2600 : 2200);
    };
    if (from && from !== to) tt.current = setTimeout(go, 950);
    else if (i === 0) tt.current = setTimeout(go, 560);
    else go();
  }, []);

  const start = useCallback((steps: Step[], hits: Hit[] = []) => {
    clear(); stepsRef.current = steps; at.current = null; pending.current = hits;
    setSt({ steps, step: null, hits: [], runId: id.current, open: false });
    runStep(0);
  }, [runStep]);
  const jump = useCallback((i: number) => { setSt(s => ({ ...s, open: true })); runStep(i); }, [runStep]);
  const stop = useCallback(() => { clear(); stepsRef.current = null; at.current = null; id.current++; setSt({ steps: null, step: null, hits: [], runId: 0, open: false }); }, []);
  const clearHits = useCallback(() => { clear(); stepsRef.current = null; at.current = null; id.current++; setSt(s => ({ ...s, steps: null, step: null, hits: [] })); }, []);
  useEffect(() => clear, []);
  return { ...st, start, jump, stop, clearHits, setOpen: (open: boolean) => setSt(s => ({ ...s, open })) };
}
