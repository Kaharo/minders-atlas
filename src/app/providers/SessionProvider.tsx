import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SessionContext, userApi, type User } from '@/entities/user';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'offline'>('loading');
  const refresh = useCallback(async () => {
    try { setUser(await userApi.me()); setStatus('ready'); }
    catch { setUser(null); setStatus('offline'); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const value = useMemo(() => ({ user, status, setUser, refresh }), [user, status, refresh]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
