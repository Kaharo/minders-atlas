import { api } from '@/shared/api/client';
import type { Facets, Term, TermSummary } from '../model/types';

export const termApi = {
  list: (p: { domain?: string; topic?: string; year?: string; kind?: string } = {}) => api.get<{ items: TermSummary[] }>('/glossary', p).then(r => r.items),
  get: (key: string) => api.get<Term>('/glossary/' + encodeURIComponent(key)),
  facets: () => api.get<Facets>('/glossary/facets'),
  search: (q: string) => api.get<{ items: { key: string; title: { ru: string | null; en: string | null }; snippet: string; domain: string | null; ym: string | null }[] }>('/search', { q, tag: 'term', limit: 30 }).then(r => r.items),
  recent: (limit = 10) => api.get<{ items: { uid: string; tag: string; key: string; title: { ru: string | null; en: string | null }; ym: string | null; where: { ru: string | null; en: string | null } }[] }>('/atlas/recent', { limit }).then(r => r.items)
};
