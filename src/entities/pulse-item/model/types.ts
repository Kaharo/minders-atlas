import type { Bilingual } from '@/shared/i18n';

export interface PulseItem {
  id: string;
  title: string;
  url: string | null;
  src: string | null;
  ts: number;
  score: number;
  ps: string[];
  notes: Record<string, Bilingual>;
}

export interface PulseDigest { day: string; ru: string | null; en: string | null }

export interface PulseFeed {
  items: PulseItem[];
  next: number | null;
  updated: string | null;
  digests: Record<string, PulseDigest>;
}

export interface PulseQuery { q?: string; persona?: string; before?: number | null; limit?: number; from?: string; to?: string }
