// Ядро ECS. Сущность = целое id; компонент = описание таблицы c_*; система = чистая функция (world, input) => output.
import type { Client, InValue, ResultSet } from '@libsql/client';

export type Entity = number;
export type Row = Record<string, InValue>;

export interface ComponentDef<T extends object> {
  readonly name: string;
  readonly table: string;
  /** Поля компонента (без колонки entity) */
  readonly fields: readonly (keyof T & string)[];
  /** multi: несколько строк на сущность; ключ — какие поля образуют первичный ключ вместе с entity */
  readonly multi?: readonly (keyof T & string)[];
}

export function defineComponent<T extends object>(name: string, fields: readonly (keyof T & string)[], multi?: readonly (keyof T & string)[]): ComponentDef<T> {
  return { name, table: 'c_' + name, fields, multi };
}

export interface Stmt { sql: string; args?: InValue[] }

/** Мир: доступ к сущностям и компонентам поверх libSQL. */
export class World {
  constructor(readonly db: Client) {}

  run(sql: string, args: InValue[] = []): Promise<ResultSet> {
    return this.db.execute({ sql, args });
  }
  batch(stmts: Stmt[]): Promise<ResultSet[]> {
    return stmts.length ? this.db.batch(stmts.map(s => ({ sql: s.sql, args: s.args ?? [] })), 'write') : Promise.resolve([]);
  }

  /** Создать или найти сущность по внешнему uid. */
  async spawn(uid: string, tags: string[] = []): Promise<Entity> {
    await this.run('INSERT OR IGNORE INTO entity (uid) VALUES (?)', [uid]);
    const r = await this.run('SELECT id FROM entity WHERE uid = ?', [uid]);
    const id = Number(r.rows[0].id);
    if (tags.length) await this.batch(tags.map(t => ({ sql: 'INSERT OR IGNORE INTO c_tag (entity, tag) VALUES (?, ?)', args: [id, t] })));
    return id;
  }
  async find(uid: string): Promise<Entity | null> {
    const r = await this.run('SELECT id FROM entity WHERE uid = ?', [uid]);
    return r.rows.length ? Number(r.rows[0].id) : null;
  }
  async uid(e: Entity): Promise<string | null> {
    const r = await this.run('SELECT uid FROM entity WHERE id = ?', [e]);
    return r.rows.length ? String(r.rows[0].uid) : null;
  }
  async despawn(e: Entity): Promise<void> {
    await this.run('DELETE FROM entity WHERE id = ?', [e]);
  }

  /** Операторы записи как Stmt, чтобы собирать их в batch. */
  setStmt<T extends object>(e: Entity, c: ComponentDef<T>, data: T): Stmt {
    const cols = ['entity', ...c.fields], vals = [e, ...c.fields.map(f => (data as Row)[f] ?? null)] as InValue[];
    const conflict = c.multi ? ['entity', ...c.multi] : ['entity'];
    const upd = c.fields.filter(f => !c.multi?.includes(f)).map(f => `${f} = excluded.${f}`);
    return { sql: `INSERT INTO ${c.table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')}) ON CONFLICT(${conflict.join(',')}) DO ${upd.length ? 'UPDATE SET ' + upd.join(', ') : 'NOTHING'}`, args: vals };
  }
  clearStmt<T extends object>(e: Entity, c: ComponentDef<T>): Stmt {
    return { sql: `DELETE FROM ${c.table} WHERE entity = ?`, args: [e] };
  }
  set<T extends object>(e: Entity, c: ComponentDef<T>, data: T) { const s = this.setStmt(e, c, data); return this.run(s.sql, s.args); }
  remove<T extends object>(e: Entity, c: ComponentDef<T>) { const s = this.clearStmt(e, c); return this.run(s.sql, s.args); }

  async get<T extends object>(e: Entity, c: ComponentDef<T>): Promise<T | null> {
    const r = await this.run(`SELECT ${c.fields.join(',')} FROM ${c.table} WHERE entity = ?`, [e]);
    return r.rows.length ? (r.rows[0] as unknown as T) : null;
  }
  async getAll<T extends object>(e: Entity, c: ComponentDef<T>): Promise<T[]> {
    const r = await this.run(`SELECT ${c.fields.join(',')} FROM ${c.table} WHERE entity = ?`, [e]);
    return r.rows as unknown as T[];
  }
  async has(e: Entity, tag: string): Promise<boolean> {
    const r = await this.run('SELECT 1 FROM c_tag WHERE entity = ? AND tag = ?', [e, tag]);
    return r.rows.length > 0;
  }

  /**
   * Запрос по архетипу: сущности с тегом и всеми перечисленными одиночными компонентами (INNER JOIN),
   * плюс необязательные (LEFT JOIN). Возвращает плоские строки с префиксом компонента: title_ru, date_year…
   */
  query(q: Query): Promise<Row[]> {
    const { sql, args } = buildQuery(q);
    return this.run(sql, args).then(r => r.rows as unknown as Row[]);
  }
}

export type AnyComponent = ComponentDef<Record<string, unknown>>;
export interface Query {
  tag: string;
  with: AnyComponent[];
  optional?: AnyComponent[];
  where?: { sql: string; args?: InValue[] }[];
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export function buildQuery(q: Query): { sql: string; args: InValue[] } {
  const sel = ['e.id AS id', 'e.uid AS uid'];
  const join: string[] = ['JOIN c_tag t ON t.entity = e.id AND t.tag = ?'];
  const args: InValue[] = [q.tag];
  for (const c of q.with) { sel.push(...c.fields.map(f => `${c.name}.${f} AS ${c.name}_${f}`)); join.push(`JOIN ${c.table} ${c.name} ON ${c.name}.entity = e.id`); }
  for (const c of q.optional ?? []) { sel.push(...c.fields.map(f => `${c.name}.${f} AS ${c.name}_${f}`)); join.push(`LEFT JOIN ${c.table} ${c.name} ON ${c.name}.entity = e.id`); }
  const where = (q.where ?? []).map(w => { args.push(...(w.args ?? [])); return `(${w.sql})`; });
  let sql = `SELECT ${sel.join(', ')} FROM entity e ${join.join(' ')}`;
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  if (q.orderBy) sql += ' ORDER BY ' + q.orderBy;
  if (q.limit) { sql += ' LIMIT ?'; args.push(q.limit); }
  if (q.offset) { sql += ' OFFSET ?'; args.push(q.offset); }
  return { sql, args };
}

/** Система: именованная чистая функция над миром. Реестр нужен роутеру и для самодокументации. */
export interface System<I, O> { readonly name: string; run(world: World, input: I, ctx: Ctx): Promise<O> }
export interface Ctx { user: Entity | null; request: Request }

const registry = new Map<string, System<unknown, unknown>>();
export function defineSystem<I, O>(name: string, run: (world: World, input: I, ctx: Ctx) => Promise<O>): System<I, O> {
  const s = { name, run };
  registry.set(name, s as System<unknown, unknown>);
  return s;
}
export const systems = () => [...registry.keys()];

export class HttpError extends Error { constructor(readonly status: number, message: string) { super(message); } }
export function fail(status: number, message: string): never { throw new HttpError(status, message); }

/** Группирует плоские строки запроса обратно по компонентам: { id, uid, title: {ru,en}, date: {...} } */
export function nest(row: Row): Record<string, unknown> {
  const out: Record<string, unknown> = { id: Number(row.id), uid: row.uid };
  for (const [k, v] of Object.entries(row)) {
    if (k === 'id' || k === 'uid') continue;
    const i = k.indexOf('_');
    const c = k.slice(0, i), f = k.slice(i + 1);
    if (!(c in out)) out[c] = null;
    if (v != null) { if (out[c] == null) out[c] = {}; (out[c] as Row)[f] = v; }
  }
  return out;
}
