// Пульс: лента, архив с поиском, дайджесты персон.
import { defineSystem, type Row } from '../ecs/core';
import { ftsQuery } from './_shared';

export interface FeedInput { q?: string | null; persona?: string | null; from?: string | null; to?: string | null; before?: number | null; limit: number }
export interface FeedItem { id: string; title: string; url: string | null; src: string | null; ts: number; score: number; ps: string[]; notes: Record<string, { ru: string | null; en: string | null }> }

export const feed = defineSystem<FeedInput, { items: FeedItem[]; next: number | null; updated: string | null; digests: Record<string, { day: string; ru: string | null; en: string | null }> }>('pulse.feed', async (w, i) => {
  const where: string[] = ["g.tag = 'pulse'"], args: (string | number)[] = [];
  const fts = ftsQuery(i.q);
  if (fts) { where.push('e.id IN (SELECT entity FROM fts WHERE fts MATCH ?)'); args.push(fts); }
  if (i.persona) { where.push('EXISTS (SELECT 1 FROM c_persona p WHERE p.entity = e.id AND p.persona = ?)'); args.push(i.persona); }
  const from = Date.parse(i.from ?? ''), to = Date.parse(i.to ?? '');
  if (from) { where.push('ts.ts >= ?'); args.push(from); }
  if (to) { where.push('ts.ts < ?'); args.push(to + 86_400_000); }
  if (i.before) { where.push('ts.ts < ?'); args.push(i.before); }
  const r = await w.run(
    `SELECT e.id, e.uid, t.ru AS title, l.url, l.src, ts.ts, COALESCE(s.score, 0) AS score
     FROM entity e JOIN c_tag g ON g.entity = e.id JOIN c_title t ON t.entity = e.id JOIN c_timestamp ts ON ts.entity = e.id
     LEFT JOIN c_link l ON l.entity = e.id LEFT JOIN c_score s ON s.entity = e.id
     WHERE ${where.join(' AND ')} ORDER BY ts.ts DESC LIMIT ?`, [...args, i.limit + 1]);
  const rows = r.rows.slice(0, i.limit);
  const ids = rows.map(x => Number(x.id));
  const ps = new Map<number, string[]>(), notes = new Map<number, FeedItem['notes']>();
  if (ids.length) {
    const ph = ids.map(() => '?').join(',');
    const [p, n] = await Promise.all([
      w.run(`SELECT entity, persona FROM c_persona WHERE entity IN (${ph})`, ids),
      w.run(`SELECT entity, persona, ru, en FROM c_note WHERE entity IN (${ph})`, ids)
    ]);
    for (const x of p.rows) { const k = Number(x.entity); ps.set(k, [...(ps.get(k) ?? []), String(x.persona)]); }
    for (const x of n.rows) { const k = Number(x.entity); notes.set(k, { ...(notes.get(k) ?? {}), [String(x.persona)]: { ru: x.ru as string | null, en: x.en as string | null } }); }
  }
  const items: FeedItem[] = rows.map(x => ({ id: String(x.uid).slice(6), title: String(x.title), url: x.url as string | null, src: x.src as string | null, ts: Number(x.ts), score: Number(x.score), ps: ps.get(Number(x.id)) ?? [], notes: notes.get(Number(x.id)) ?? {} }));
  const [meta, dg] = await Promise.all([
    w.run("SELECT value FROM meta WHERE key = 'pulse_updated'"),
    w.run('SELECT persona, day, ru, en FROM c_digest d WHERE day = (SELECT MAX(day) FROM c_digest x WHERE x.persona = d.persona)')
  ]);
  const digests = Object.fromEntries((dg.rows as unknown as Row[]).map(x => [String(x.persona), { day: String(x.day), ru: x.ru as string | null, en: x.en as string | null }]));
  return { items, next: r.rows.length > i.limit ? items[items.length - 1].ts : null, updated: meta.rows[0] ? String(meta.rows[0].value) : null, digests };
});

export const counts = defineSystem<{ days: number }, { total: number; byPersona: Record<string, number> }>('pulse.counts', async (w, i) => {
  const since = Date.now() - i.days * 86_400_000;
  const [t, p] = await Promise.all([
    w.run("SELECT COUNT(*) AS n FROM c_tag g JOIN c_timestamp ts ON ts.entity = g.entity WHERE g.tag = 'pulse' AND ts.ts >= ?", [since]),
    w.run("SELECT p.persona, COUNT(*) AS n FROM c_persona p JOIN c_timestamp ts ON ts.entity = p.entity WHERE ts.ts >= ? GROUP BY p.persona", [since])
  ]);
  return { total: Number(t.rows[0].n), byPersona: Object.fromEntries(p.rows.map(x => [String(x.persona), Number(x.n)])) };
});
