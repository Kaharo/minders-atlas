import { api } from '@/shared/api/client';
import type { PulseFeed, PulseQuery } from '../model/types';

export const pulseApi = {
  feed: (q: PulseQuery = {}) => api.get<PulseFeed>('/pulse', { q: q.q, persona: q.persona, before: q.before ?? undefined, limit: q.limit, from: q.from, to: q.to }),
  counts: (days = 14) => api.get<{ total: number; byPersona: Record<string, number> }>('/pulse/counts', { days })
};
