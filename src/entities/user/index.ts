import { createContext, useContext } from 'react';
import { api } from '@/shared/api/client';

export interface User { id: number; email: string; name: string | null; created_at: string }

export interface SessionValue {
  user: User | null;
  status: 'loading' | 'ready' | 'offline';
  setUser: (u: User | null) => void;
  refresh: () => Promise<void>;
}
export const SessionContext = createContext<SessionValue>({ user: null, status: 'loading', setUser: () => {}, refresh: async () => {} });
export const useSession = () => useContext(SessionContext);

export const userApi = {
  me: () => api.get<{ user: User | null }>('/me').then(r => r.user),
  register: (email: string, password: string, name?: string) => api.post<{ user: User }>('/auth/register', { email, password, name }).then(r => r.user),
  login: (email: string, password: string) => api.post<{ user: User }>('/auth/login', { email, password }).then(r => r.user),
  logout: () => api.post<{ ok: true }>('/auth/logout', {}),
  deleteAccount: () => api.del<{ ok: true }>('/me'),
  favorites: {
    list: () => api.get<{ items: { uid: string; tag: string; key: string; title: { ru: string | null; en: string | null }; domain: string | null; created_at: string }[] }>('/favorites').then(r => r.items),
    add: (uid: string) => api.post<{ ok: true }>('/favorites', { uid }),
    remove: (uid: string) => api.del<{ ok: true }>('/favorites', { uid })
  },
  progress: {
    get: () => api.get<{ items: Record<string, { state: string; updated: string }> }>('/progress').then(r => r.items),
    set: (item: string, state: 'started' | 'done' | null) => api.put<{ ok: true }>('/progress', { item, state })
  }
};
