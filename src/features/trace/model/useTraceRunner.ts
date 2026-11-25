import { useCallback, useEffect, useRef, useState } from 'react';
import type { Hit, Step } from './buildTrace';

export interface TraceState { steps: Step[] | null; step: number | null; hits: Hit[]; runId: number; open: boolean; paused: boolean }

/** Проигрывает шаги с таймингами прототипа (_runStep): пауза на переход между зонами, задержка на чтение. */
export function useTraceRunner() {
  const [st, setSt] = useState<TraceState>({ steps: null, step: null, hits: [], runId: 0, open: false, paused: false });
  const tt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const at = useRef<string | null>(null);
  const id = useRef(0);
  const pending = useRef<Hit[]>([]);
  const stepsRef = useRef<Step[] | null>(null);
  const pausedRef = useRef(false), curRef = useRef<number | null>(null);
  const clear = () => { if (tt.current) clearTimeout(tt.current); tt.current = null; };

  const runStep = useCallback((i: number, hold = false) => {
    clear();
    const steps = stepsRef.current; if (!steps) return;
    if (i >= steps.length) return;
    const my = ++id.current, from = at.current, to = steps[i].key;
    const go = () => {
      if (my !== id.current || stepsRef.current !== steps) return;
      at.current = to; curRef.current = i;
      setSt(s => ({ ...s, step: i, runId: my, hits: steps[i].fan ? pending.current : s.hits }));
      // время на чтение растёт с длиной описания шага
      if (!hold && !pausedRef.current) tt.current = setTimeout(() => runStep(i + 1), i === steps.length - 1 ? 2600 : 2400 + Math.min(3200, (steps[i].text || '').length * 20));
    };
    if (from && from !== to) tt.current = setTimeout(go, 950);
    else if (i === 0) tt.current = setTimeout(go, 560);
    else go();
  }, []);

  const start = useCallback((steps: Step[], hits: Hit[] = []) => {
    clear(); stepsRef.current = steps; at.current = null; pending.current = hits; pausedRef.current = false; curRef.current = null;
    setSt({ steps, step: null, hits: [], runId: id.current, open: false, paused: false });
    runStep(0);
  }, [runStep]);
  const jump = useCallback((i: number) => { pausedRef.current = true; setSt(s => ({ ...s, open: true, paused: true })); runStep(i, true); }, [runStep]);
  /** Пауза и продолжение: по нажатию на текущий шаг проход останавливается, по второму идёт дальше. */
  const toggle = useCallback(() => {
    const steps = stepsRef.current; if (!steps) return;
    if (pausedRef.current) { pausedRef.current = false; setSt(s => ({ ...s, paused: false })); const i = curRef.current ?? -1; if (i + 1 < steps.length) runStep(i + 1); }
    else { clear(); pausedRef.current = true; setSt(s => ({ ...s, paused: true })); }
  }, [runStep]);
  const stop = useCallback(() => { clear(); stepsRef.current = null; at.current = null; id.current++; setSt({ steps: null, step: null, hits: [], runId: 0, open: false, paused: false }); }, []);
  const clearHits = useCallback(() => { clear(); stepsRef.current = null; at.current = null; id.current++; setSt(s => ({ ...s, steps: null, step: null, hits: [] })); }, []);
  useEffect(() => clear, []);
  return { ...st, start, jump, toggle, stop, clearHits, setOpen: (open: boolean) => setSt(s => ({ ...s, open })) };
}
