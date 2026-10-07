// Поиск по атласу через FTS5.
import { defineSystem, fail } from '../ecs/core';
import { CONTENT_TAGS } from '../components';
import { ftsQuery } from './_shared';

export interface SearchInput { q: string | null; tag?: string | null; limit: number }
export interface Hit { id: number; uid: string; tag: string; key: string; title: { ru: string | null; en: string | null }; domain: string | null; ym: string | null; snippet: string }

export const search = defineSystem<SearchInput, { items: Hit[] }>('search', async (w, i) => {
  const fts = ftsQuery(i.q);
  if (!fts) fail(400, 'Пустой запрос');
  const tagOk = i.tag && (CONTENT_TAGS as string[]).includes(i.tag);
  const r = await w.run(
    `SELECT e.id, e.uid, f.tag, t.ru AS title_ru, t.en AS title_en, d.domain, dt.ym, snippet(fts, 2, '<b>', '</b>', '…', 14) AS snippet
     FROM fts f JOIN entity e ON e.id = f.entity JOIN c_title t ON t.entity = e.id LEFT JOIN c_domain d ON d.entity = e.id LEFT JOIN c_date dt ON dt.entity = e.id
     WHERE fts MATCH ? ${tagOk ? 'AND f.tag = ?' : "AND f.tag IN ('term','research','incident','benchmark')"} ORDER BY bm25(fts) LIMIT ?`,
    tagOk ? [fts, i.tag!, i.limit] : [fts, i.limit]);
  return { items: r.rows.map(x => ({ id: Number(x.id), uid: String(x.uid), tag: String(x.tag), key: String(x.uid).split(':').slice(1).join(':'), title: { ru: x.title_ru as string | null, en: x.title_en as string | null }, domain: x.domain as string | null, ym: x.ym as string | null, snippet: String(x.snippet ?? '') })) };
});
