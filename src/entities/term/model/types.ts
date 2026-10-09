import type { Bilingual } from '@/shared/i18n';

export type BlockId = 'd_models' | 'd_context' | 'd_runtime' | 'd_quality' | 'd_trust';
export type TermKind = 'technique' | 'product' | 'standard' | 'concept';

/** Краткая запись из списка */
export interface TermSummary {
  id: number;
  uid: string;
  key: string;
  title: Bilingual;
  domain: { domain: BlockId };
  kind: { kind: TermKind };
  topic: { topic: string } | null;
  date: { ym: string; year: number; month: number | null } | null;
  status: { status: string } | null;
  text: Bilingual | null;
  origin: Bilingual | null;
  aliases: string[];
}

/** Полная запись */
export interface Term {
  id: number;
  uid: string;
  key: string;
  title: Bilingual | null;
  text: Bilingual | null;
  response: Bilingual | null;
  origin: Bilingual | null;
  domain: BlockId | null;
  kind: TermKind | null;
  topic: string | null;
  status: string | null;
  date: { ym: string; year: number; month: number | null } | null;
  aliases: string[];
  sources: { title: string | null; url: string }[];
}

export interface FacetRow { k: string; n: number; domain?: string }
export interface Facets { domain: FacetRow[]; topic: FacetRow[]; year: FacetRow[]; total: number }
