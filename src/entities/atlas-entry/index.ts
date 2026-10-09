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
  origin: Bilingual | null;
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
  relations: { dir: 'in' | 'out'; pred: string; basis: string; other: { uid: string; tag: string; key: string; title: Bilingual } }[];
  checked: string | null;
}

export const atlasApi = {
  list: (section: Section) => api.get<{ items: AtlasEntry[] }>('/' + section).then(r => r.items),
  get: (section: Section, key: string) => api.get<AtlasRecord>(`/${section}/${encodeURIComponent(key)}`)
};

/** Цвет точки записи: тяжесть инцидента, иначе вид. Перенос _evColor. */
export const SEV_COLOR = (s: number) => (s >= 3 ? '#e11d48' : s === 2 ? '#f59e0b' : '#6366f1');
const KIND_COLOR: Record<string, string> = { technique: '#6366f1', product: '#0ea5e9', standard: '#a855f7', concept: '#64748b', study: '#0d9488', report: '#d97706', exam: '#6366f1', agent: '#0d9488', pref: '#d97706', 'инцидент': '#6366f1', 'исследование': '#0d9488', 'патч': '#a855f7' };
export const entryColor = (e: { kind: { kind: string } | string | null; severity?: { sev: number } | null; sev?: number | null }) => {
  const sev = e.severity?.sev ?? e.sev ?? null;
  if (sev) return SEV_COLOR(sev);
  const k = typeof e.kind === 'string' ? e.kind : e.kind?.kind ?? '';
  return KIND_COLOR[k] ?? '#6366f1';
};
/** Легенда списка по разделам */
export const LEGEND: Record<Section, { c: string; t: [string, string] }[]> = {
  glossary: [{ c: '#6366f1', t: ['техника', 'technique'] }, { c: '#0ea5e9', t: ['продукт', 'product'] }, { c: '#a855f7', t: ['стандарт', 'standard'] }, { c: '#64748b', t: ['понятие', 'concept'] }],
  research: [{ c: '#0d9488', t: ['эксперимент', 'experiment'] }, { c: '#d97706', t: ['отчёт', 'report'] }],
  incidents: [{ c: '#e11d48', t: ['критично', 'critical'] }, { c: '#f59e0b', t: ['заметно', 'notable'] }, { c: '#6366f1', t: ['фон', 'background'] }],
  benchmarks: [{ c: '#6366f1', t: ['экзамен знаний', 'knowledge exam'] }, { c: '#0d9488', t: ['агентная задача', 'agent task'] }, { c: '#d97706', t: ['оценка людьми', 'human preference'] }]
};
/** Подписи карточки по разделам: заголовок списка, сортировка, пусто, «обнаружено», «где», «ответ» */
export const SECTION_L: Record<Section, Record<'points' | 'byDate' | 'empty' | 'found' | 'where' | 'response' | 'kicker', [string, string]>> = {
  glossary: { points: ['Термины', 'Terms'], byDate: ['от новых к старым', 'newest first'], empty: ['По этим фильтрам терминов нет.', 'No terms for these filters.'], found: ['появилось', 'introduced'], where: ['кто', 'by'], response: ['как реализовано', 'how it works'], kicker: ['Термин', 'Term'] },
  research: { points: ['Исследования', 'Research'], byDate: ['по дате публикации', 'by publication date'], empty: ['По этим фильтрам исследований нет.', 'No studies for these filters.'], found: ['опубликовано', 'published'], where: ['кто · выборка', 'who · sample'], response: ['что это значит на практике', 'what it means in practice'], kicker: ['Исследование', 'Study'] },
  incidents: { points: ['Инциденты', 'Incidents'], byDate: ['по дате обнаружения', 'by discovery date'], empty: ['По этим фильтрам задокументированных точек нет.', 'No documented points for these filters.'], found: ['обнаружено', 'discovered'], where: ['где', 'where'], response: ['как отреагировали', 'response'], kicker: ['', ''] },
  benchmarks: { points: ['Рейтинги', 'Rankings'], byDate: ['по дате появления бенчмарка', 'by benchmark release date'], empty: ['По этим фильтрам бенчмарков нет.', 'No benchmarks for these filters.'], found: ['появился', 'released'], where: ['кто · объём', 'who · size'], response: ['как читать результат', 'how to read the result'], kicker: ['', ''] }
};
export const KIND_FILTERS: Record<Section, [string, [string, string]][]> = {
  glossary: [['technique', ['техники', 'techniques']], ['product', ['продукты', 'products']], ['standard', ['стандарты', 'standards']], ['concept', ['понятия', 'concepts']]],
  research: [['study', ['эксперименты', 'experiments']], ['report', ['отчёты', 'reports']]],
  incidents: [['инцидент', ['инциденты', 'incidents']], ['патч', ['решения', 'rulings']]],
  benchmarks: [['exam', ['экзамены знаний', 'knowledge exams']], ['agent', ['агентные задачи', 'agent tasks']], ['pref', ['оценка людьми', 'human preference']]]
};
export const MONTHS_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
export const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const dateLabel = (d: { year: number; month: number | null } | null, en: boolean) => !d ? '—' : d.month ? (en ? MONTHS_EN : MONTHS_RU)[d.month - 1] + ' ' + d.year : String(d.year);
export { EntryGlyph } from './ui/EntryGlyph';
export { COURSE, courseFor } from './model/course';

/** Переводы видов записей (kind) по разделам */
export const KIND_LABEL: Record<string, [string, string]> = {
  technique: ['техника', 'technique'], product: ['продукт', 'product'], standard: ['стандарт', 'standard'], concept: ['понятие', 'concept'],
  study: ['исследование', 'study'], report: ['отчёт', 'report'], exam: ['экзамен', 'exam'], bench: ['бенчмарк', 'benchmark'], arena: ['арена', 'arena'], index: ['индекс', 'index'],
  'инцидент': ['инцидент', 'incident'], 'исследование': ['исследование', 'study'], 'патч': ['патч', 'patch']
};
