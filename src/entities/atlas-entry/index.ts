import { api } from '@/shared/api/client';
import type { Bilingual } from '@/shared/i18n';
import type { BlockId } from '@/entities/term';

export type Section = 'glossary' | 'research' | 'incidents' | 'benchmarks';
export const SECTIONS: Section[] = ['glossary', 'research', 'incidents', 'benchmarks'];
export const SECTION_LABEL: Record<Section, [string, string]> = { glossary: ['Глоссарий', 'Glossary'], research: ['Исследования', 'Research'], incidents: ['Инциденты', 'Incidents'], benchmarks: ['Рейтинги', 'Rankings'] };
export const SECTION_TAG: Record<Section, string> = { glossary: 'term', research: 'research', incidents: 'incident', benchmarks: 'benchmark' };
export const isSection = (s: string | undefined): s is Section => !!s && (SECTIONS as string[]).includes(s);

/** Краткая запись любого раздела из content.list */
export interface AtlasEntry {
  id: number; uid: string; key: string;
  title: Bilingual;
  domain: { domain: BlockId };
  kind: { kind: string };
  topic: { topic: string } | null;
  date: { ym: string; year: number; month: number | null } | null;
  status: { status: string } | null;
  severity: { sev: number } | null;
  text: Bilingual | null;
  aliases: string[];
}

/** Полная запись из content.get */
export interface AtlasRecord {
  id: number; uid: string; key: string; tag: string;
  title: Bilingual | null; text: Bilingual | null; response: Bilingual | null; origin: Bilingual | null;
  domain: BlockId | null; kind: string | null; topic: string | null; status: string | null; sev: number | null; course: string | null;
  date: { ym: string; year: number; month: number | null } | null;
  aliases: string[]; sources: { title: string | null; url: string }[];
  results: Record<string, number> | null;
}

export const atlasApi = {
  list: (section: Section) => api.get<{ items: AtlasEntry[] }>('/' + section).then(r => r.items),
  get: (section: Section, key: string) => api.get<AtlasRecord>(`/${section}/${encodeURIComponent(key)}`)
};

/** Переводы видов записей (kind) по разделам */
export const KIND_LABEL: Record<string, [string, string]> = {
  technique: ['техника', 'technique'], product: ['продукт', 'product'], standard: ['стандарт', 'standard'], concept: ['понятие', 'concept'],
  study: ['исследование', 'study'], report: ['отчёт', 'report'], exam: ['экзамен', 'exam'], bench: ['бенчмарк', 'benchmark'], arena: ['арена', 'arena'], index: ['индекс', 'index'],
  'инцидент': ['инцидент', 'incident'], 'исследование': ['исследование', 'study'], 'патч': ['патч', 'patch']
};
