import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Один параметр строки запроса как состояние. */
export function useQueryParam(name: string, fallback = ''): [string, (v: string | null) => void] {
  const [sp, setSp] = useSearchParams();
  const value = sp.get(name) ?? fallback;
  const set = useCallback((v: string | null) => {
    setSp(prev => { const n = new URLSearchParams(prev); if (v == null || v === '' || v === fallback) n.delete(name); else n.set(name, v); return n; }, { replace: true });
  }, [name, fallback, setSp]);
  return [value, set];
}
