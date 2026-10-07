import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { userApi, useSession } from '@/entities/user';

interface FavoritesValue { has: (uid: string) => boolean; toggle: (uid: string) => Promise<void>; uids: string[]; ready: boolean }
const Ctx = createContext<FavoritesValue>({ has: () => false, toggle: async () => {}, uids: [], ready: false });

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [uids, setUids] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!user) { setUids([]); setReady(false); return; }
    userApi.favorites.list().then(items => { setUids(items.map(i => i.uid)); setReady(true); }).catch(() => setReady(false));
  }, [user]);
  const toggle = useCallback(async (uid: string) => {
    const on = uids.includes(uid);
    setUids(u => (on ? u.filter(x => x !== uid) : [...u, uid]));       // оптимистично
    try { on ? await userApi.favorites.remove(uid) : await userApi.favorites.add(uid); }
    catch { setUids(u => (on ? [...u, uid] : u.filter(x => x !== uid))); }
  }, [uids]);
  const value = useMemo(() => ({ uids, ready, has: (uid: string) => uids.includes(uid), toggle }), [uids, ready, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useFavorites = () => useContext(Ctx);
