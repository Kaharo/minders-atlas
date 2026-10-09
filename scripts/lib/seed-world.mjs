// Посев мира: data/*.json + сборки Пульса → таблицы ECS. Используется scripts/seed.mjs (Turso) и сервером в режиме без базы (память).
// Контент (term/research/incident/benchmark) синхронизируется целиком; новости Пульса только добавляются.

/**
 * @param {{ batch(stmts: {sql:string,args:unknown[]}[], mode:'write'): Promise<unknown>, execute(sql:string): Promise<unknown> }} db
 * @param {{ glossary?: any[], research?: any[], incidents?: any[], scores?: any, relations?: any[], pulse?: any[] }} src  pulse: массив сборок {updated, personas, items}
 */
export async function seedWorld(db, src) {
  const stmts = [];
  const push = (sql, args = []) => stmts.push({ sql, args });
  const flush = async () => { for (let i = 0; i < stmts.length; i += 200) await db.batch(stmts.slice(i, i + 200), 'write'); stmts.length = 0; };

  // Сущность ищется по uid, id берётся подзапросом, чтобы не ходить в базу за каждым id.
  const q = (v) => v == null || v === '' ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
  const E = (uid) => `(SELECT id FROM entity WHERE uid = ${q(uid)})`;
  const spawn = (uid, tag) => { push(`INSERT OR IGNORE INTO entity (uid) VALUES (${q(uid)})`); push(`INSERT OR IGNORE INTO c_tag (entity, tag) VALUES (${E(uid)}, ${q(tag)})`); };
  const set = (uid, table, cols, vals, conflict = ['entity']) => {
    const upd = cols.filter(c => !conflict.includes(c)).map(c => `${c} = excluded.${c}`);
    push(`INSERT INTO ${table} (entity, ${cols.join(',')}) VALUES (${E(uid)}, ${vals.map(q).join(',')}) ON CONFLICT(${conflict.join(',')}) DO ${upd.length ? 'UPDATE SET ' + upd.join(', ') : 'NOTHING'}`);
  };
  const bi = (uid, table, ru, en, k) => set(uid, table, ['ru', 'en'], [ru?.[k] ?? null, en?.[k] ?? null]);
  const ym = (d) => { if (!d) return null; const [y, m] = String(d).split('-'); return { ym: m ? `${y}-${m}` : `${y}-00`, year: +y, month: m ? +m : null }; };
  const plain = (o) => o == null ? '' : typeof o === 'string' ? o : Array.isArray(o) ? o.map(plain).join(' ') : typeof o === 'object' ? Object.values(o).map(plain).join(' ') : String(o);

  // ─── контент ──────────────────────────────────────────────────────────────
  const { glossary = [], research = [], incidents = [], scores = {} } = src;
  const content = [];
  const entry = (tag, x) => {
    const uid = `${tag}:${x.id}`; content.push(uid); spawn(uid, tag);
    const ru = x.ru ?? x, en = x.en ?? null;
    bi(uid, 'c_title', ru, en, 'title'); bi(uid, 'c_text', ru, en, 'text'); bi(uid, 'c_response', ru, en, 'response'); bi(uid, 'c_origin', ru, en, 'where');
    if (x.domain) set(uid, 'c_domain', ['domain'], [x.domain]);
    if (x.kind) set(uid, 'c_kind', ['kind'], [x.kind]);
    if (x.topic) set(uid, 'c_topic', ['topic'], [x.topic]);
    if (x.course) set(uid, 'c_course', ['course'], [x.course]);
    if (x.status) set(uid, 'c_status', ['status'], [x.status]);
    if (x.sev) set(uid, 'c_severity', ['sev'], [x.sev]);
    const d = ym(x.date); if (d) set(uid, 'c_date', ['ym', 'year', 'month'], [d.ym, d.year, d.month]); else push(`DELETE FROM c_date WHERE entity = ${E(uid)}`);
    push(`DELETE FROM c_alias WHERE entity = ${E(uid)}`); (x.aliases ?? []).forEach(a => set(uid, 'c_alias', ['alias'], [a], ['entity', 'alias']));
    push(`DELETE FROM c_source WHERE entity = ${E(uid)}`); (x.sources ?? []).forEach((s, n) => set(uid, 'c_source', ['n', 'title', 'url'], [n, s.t ?? null, s.u], ['entity', 'n']));
    push(`DELETE FROM fts WHERE entity = ${E(uid)}`);
    push(`INSERT INTO fts (entity, tag, body) VALUES (${E(uid)}, ${q(tag)}, ${q([plain(ru), plain(en), (x.aliases ?? []).join(' ')].join(' '))})`);
  };
  glossary.forEach(x => entry('term', x));
  research.forEach(x => entry('research', x));
  // Старые домены инцидентов → пять блоков карты
  const OLD_TO = { prompting: 'd_context', context: 'd_context', knowledge: 'd_context', memory: 'd_context', tools: 'd_runtime', agents: 'd_runtime', evaluation: 'd_quality', observability: 'd_quality', deployment: 'd_quality', optimization: 'd_quality', guardrails: 'd_trust', security: 'd_trust' };
  incidents.forEach(x => entry('incident', { ...x, domain: OLD_TO[x.domain] ?? x.domain, topic: x.domain in OLD_TO ? x.domain : undefined, ru: { where: x.where, title: x.title, text: x.text, response: x.response }, en: x.en }));
  let nRes = 0;
  for (const b of scores.benchmarks ?? []) {
    entry('benchmark', { ...b, ru: b.ru ?? { title: b.title ?? b.name ?? b.id, text: b.text ?? b.desc ?? null }, en: b.en ?? null });
    push(`DELETE FROM c_result WHERE entity = ${E('benchmark:' + b.id)}`);
    for (const [model, v] of Object.entries(scores.results?.[b.id] ?? {})) if (typeof v === 'number') { set('benchmark:' + b.id, 'c_result', ['model', 'value'], [model, v], ['entity', 'model']); nRes++; }
  }
  await flush();
  // связи между записями
  await db.execute('DELETE FROM c_relation');
  for (const r of src.relations ?? []) if (r.from && r.to && r.pred) push(`INSERT OR IGNORE INTO c_relation (entity, target, pred, basis) SELECT a.id, b.id, ${q(r.pred)}, ${q(r.basis ?? 'editorial')} FROM entity a, entity b WHERE a.uid = ${q(r.from)} AND b.uid = ${q(r.to)}`);
  if (scores.checked) push(`INSERT INTO meta (key, value) VALUES ('scores_checked', ${q(scores.checked)}) ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
  await flush();
  // удалить записи контента, которых больше нет в data/
  const keep = content.map(q).join(',');
  await db.execute(`DELETE FROM entity WHERE id IN (SELECT entity FROM c_tag WHERE tag IN ('term','research','incident','benchmark')) AND uid NOT IN (${keep || "''"})`);

  // ─── пульс ────────────────────────────────────────────────────────────────
  const items = new Map(); let updated = null; const digests = [];
  for (const j of src.pulse ?? []) {
    if (!j) continue;
    for (const x of j.items ?? []) if (x.id && x.title) items.set(x.id, { ...items.get(x.id), ...x, notes: { ...(items.get(x.id)?.notes ?? {}), ...(x.notes ?? {}) } });
    if (j.updated && (!updated || j.updated > updated)) updated = j.updated;
    const day = (j.updated ?? '').slice(0, 10);
    for (const [p, d] of Object.entries(j.personas ?? {})) if (d && day) digests.push({ p, day: d.date ?? day, ru: typeof d === 'string' ? d : d.ru, en: typeof d === 'string' ? null : d.en });
  }
  for (const x of items.values()) {
    const uid = 'pulse:' + x.id; spawn(uid, 'pulse');
    set(uid, 'c_title', ['ru', 'en'], [x.title, null]);
    set(uid, 'c_link', ['url', 'src'], [x.url ?? null, x.src ?? null]);
    set(uid, 'c_timestamp', ['ts'], [Number(x.ts) || 0]);
    set(uid, 'c_score', ['score'], [Number(x.score) || 0]);
    (x.ps ?? []).forEach(p => set(uid, 'c_persona', ['persona'], [p], ['entity', 'persona']));
    for (const [p, n] of Object.entries(x.notes ?? {})) set(uid, 'c_note', ['persona', 'ru', 'en'], [p, typeof n === 'string' ? n : n?.ru ?? null, typeof n === 'string' ? null : n?.en ?? null], ['entity', 'persona']);
    push(`DELETE FROM fts WHERE entity = ${E(uid)}`);
    push(`INSERT INTO fts (entity, tag, body) VALUES (${E(uid)}, 'pulse', ${q([x.title, plain(x.notes)].join(' '))})`);
  }
  for (const d of digests) { const uid = `digest:${d.p}:${d.day}`; spawn(uid, 'digest'); set(uid, 'c_digest', ['persona', 'day', 'ru', 'en'], [d.p, d.day, d.ru ?? null, d.en ?? null]); }
  if (updated) push(`INSERT INTO meta (key, value) VALUES ('pulse_updated', ${q(updated)}) ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
  push(`INSERT INTO meta (key, value) VALUES ('synced', ${q(new Date().toISOString())}) ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
  await flush();
  return { terms: glossary.length, research: research.length, incidents: incidents.length, benchmarks: (scores.benchmarks ?? []).length, results: nRes, pulse: items.size, digests: digests.length };
}
