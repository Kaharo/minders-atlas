// Системы контента: глоссарий, исследования, инциденты, бенчмарки.
import { defineSystem, nest, fail, type Row } from '../ecs/core';
import { Title, Text, Response, Origin, Domain, Kind, Topic, Course, Status, Severity, DateYM, Alias, Source, Result, CONTENT_TAGS, type Tag } from '../components';

const isTag = (t: string): t is Tag => (CONTENT_TAGS as string[]).includes(t);

export interface ListInput { tag: string; domain?: string | null; topic?: string | null; year?: string | null; kind?: string | null; limit?: number }

/** Список записей архетипа. Коротко: без текста и источников. */
export const listEntries = defineSystem<ListInput, { items: Record<string, unknown>[] }>('content.list', async (w, i) => {
  if (!isTag(i.tag)) fail(404, 'Неизвестный раздел');
  const where: { sql: string; args?: (string | number)[] }[] = [];
  if (i.domain) where.push({ sql: 'domain.domain = ?', args: [i.domain] });
  if (i.topic) where.push({ sql: 'topic.topic = ?', args: [i.topic] });
  if (i.kind) where.push({ sql: 'kind.kind = ?', args: [i.kind] });
  if (i.year === 'none') where.push({ sql: 'date.year IS NULL' });
  else if (i.year === 'old') where.push({ sql: 'date.year < 2017' });
  else if (i.year) where.push({ sql: 'date.year = ?', args: [parseInt(i.year, 10)] });
  const rows = await w.query({
    tag: i.tag, with: [Title, Domain, Kind], optional: [Topic, DateYM, Status, Severity, Course, Text, Origin],
    where, orderBy: 'date.ym DESC NULLS LAST, title.ru COLLATE NOCASE', limit: i.limit ?? 1000
  });
  const ids = rows.map(r => Number(r.id));
  const aliases = new Map<number, string[]>();
  if (ids.length && i.tag === 'term') {
    const a = await w.run(`SELECT entity, alias FROM c_alias WHERE entity IN (${ids.map(() => '?').join(',')})`, ids);
    for (const r of a.rows) { const k = Number(r.entity); aliases.set(k, [...(aliases.get(k) ?? []), String(r.alias)]); }
  }
  return { items: rows.map(r => ({ ...nest(r), key: String(r.uid).split(':').slice(1).join(':'), aliases: aliases.get(Number(r.id)) ?? [] })) };
});

/** Одна запись целиком, со всеми компонентами. */
export const getEntry = defineSystem<{ tag: string; key: string }, Record<string, unknown>>('content.get', async (w, i) => {
  if (!isTag(i.tag)) fail(404, 'Неизвестный раздел');
  const e = (await w.find(`${i.tag}:${i.key}`)) ?? fail(404, 'Запись не найдена');
  const [title, text, response, origin, domain, kind, topic, course, status, sev, date, aliases, sources, results, rel, checked] = await Promise.all([
    w.get(e, Title), w.get(e, Text), w.get(e, Response), w.get(e, Origin), w.get(e, Domain), w.get(e, Kind), w.get(e, Topic), w.get(e, Course),
    w.get(e, Status), w.get(e, Severity), w.get(e, DateYM), w.getAll(e, Alias), w.getAll(e, Source), w.getAll(e, Result),
    w.run(`SELECT r.pred, r.basis, CASE WHEN r.entity = ? THEN 'out' ELSE 'in' END AS dir, o.uid, g.tag, t.ru, t.en
           FROM c_relation r JOIN entity o ON o.id = CASE WHEN r.entity = ? THEN r.target ELSE r.entity END
           JOIN c_tag g ON g.entity = o.id AND g.tag IN ('term','research','incident','benchmark') LEFT JOIN c_title t ON t.entity = o.id
           WHERE r.entity = ? OR r.target = ?`, [e, e, e, e]),
    w.run("SELECT value FROM meta WHERE key = 'scores_checked'")
  ]);
  return {
    id: e, uid: `${i.tag}:${i.key}`, key: i.key, tag: i.tag, title, text, response, origin, topic: topic?.topic ?? null, course: course?.course ?? null,
    domain: domain?.domain ?? null, kind: kind?.kind ?? null, status: status?.status ?? null, sev: sev?.sev ?? null, date,
    aliases: aliases.map(a => a.alias), sources: sources.sort((a, b) => a.n - b.n).map(s => ({ title: s.title, url: s.url })),
    results: results.length ? Object.fromEntries(results.map(r => [r.model, r.value])) : null,
    relations: rel.rows.map(r => ({ dir: r.dir, pred: r.pred, basis: r.basis, other: { uid: r.uid, tag: r.tag, key: String(r.uid).split(':').slice(1).join(':'), title: { ru: r.ru, en: r.en } } })),
    checked: i.tag === 'benchmark' && checked.rows[0] ? String(checked.rows[0].value) : null
  };
});

/** Счётчики для фильтров: по домену, теме, году. */
export const facets = defineSystem<{ tag: string }, { domain: Row[]; topic: Row[]; year: Row[]; total: number }>('content.facets', async (w, i) => {
  if (!isTag(i.tag)) fail(404, 'Неизвестный раздел');
  const [d, t, y, n] = await Promise.all([
    w.run('SELECT d.domain AS k, COUNT(*) AS n FROM c_tag g JOIN c_domain d ON d.entity = g.entity WHERE g.tag = ? GROUP BY d.domain', [i.tag]),
    w.run('SELECT d.domain AS domain, t.topic AS k, COUNT(*) AS n FROM c_tag g JOIN c_topic t ON t.entity = g.entity JOIN c_domain d ON d.entity = g.entity WHERE g.tag = ? GROUP BY d.domain, t.topic', [i.tag]),
    w.run("SELECT CASE WHEN d.year IS NULL THEN 'none' WHEN d.year < 2017 THEN 'old' ELSE CAST(d.year AS TEXT) END AS k, COUNT(*) AS n FROM c_tag g LEFT JOIN c_date d ON d.entity = g.entity WHERE g.tag = ? GROUP BY k ORDER BY k DESC", [i.tag]),
    w.run('SELECT COUNT(*) AS n FROM c_tag WHERE tag = ?', [i.tag])
  ]);
  return { domain: d.rows as unknown as Row[], topic: t.rows as unknown as Row[], year: y.rows as unknown as Row[], total: Number(n.rows[0].n) };
});

/** Последние записи атласа всех типов, для блока «В атласе». */
export const recent = defineSystem<{ limit: number }, { items: Record<string, unknown>[] }>('content.recent', async (w, i) => {
  const r = await w.run(
    `SELECT e.id, e.uid, g.tag, t.ru AS title_ru, t.en AS title_en, d.ym, o.ru AS where_ru, o.en AS where_en
     FROM entity e JOIN c_tag g ON g.entity = e.id JOIN c_title t ON t.entity = e.id LEFT JOIN c_date d ON d.entity = e.id LEFT JOIN c_origin o ON o.entity = e.id
     WHERE g.tag IN ('term','research','incident','benchmark') ORDER BY d.ym DESC NULLS LAST, e.id DESC LIMIT ?`, [i.limit]);
  return { items: r.rows.map(x => ({ id: Number(x.id), uid: x.uid, tag: x.tag, key: String(x.uid).split(':').slice(1).join(':'), title: { ru: x.title_ru, en: x.title_en }, ym: x.ym, where: { ru: x.where_ru, en: x.where_en } })) };
});
