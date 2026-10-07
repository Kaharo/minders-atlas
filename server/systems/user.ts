// Избранное и прогресс: компоненты на сущности пользователя.
import { defineSystem, fail } from '../ecs/core';
import { Favorite, CONTENT_TAGS } from '../components';
import { requireUser } from './_shared';

export const listFavorites = defineSystem<void, { items: unknown[] }>('favorites.list', async (w, _i, ctx) => {
  const u = requireUser(ctx);
  const r = await w.run(
    `SELECT f.target AS id, e.uid, g.tag, f.created_at, t.ru AS title_ru, t.en AS title_en, d.domain
     FROM c_favorite f JOIN entity e ON e.id = f.target JOIN c_tag g ON g.entity = e.id AND g.tag IN ('term','research','incident','benchmark')
     LEFT JOIN c_title t ON t.entity = e.id LEFT JOIN c_domain d ON d.entity = e.id WHERE f.entity = ? ORDER BY f.created_at DESC`, [u]);
  return { items: r.rows.map(x => ({ id: Number(x.id), uid: x.uid, tag: x.tag, key: String(x.uid).split(':').slice(1).join(':'), created_at: x.created_at, title: { ru: x.title_ru, en: x.title_en }, domain: x.domain })) };
});

export const addFavorite = defineSystem<{ uid?: unknown }, { ok: true }>('favorites.add', async (w, i, ctx) => {
  const u = requireUser(ctx);
  if (typeof i.uid !== 'string' || !(CONTENT_TAGS as string[]).includes(i.uid.split(':')[0])) fail(400, 'Нужен uid записи, например term:cot');
  const target = (await w.find(i.uid)) ?? fail(404, 'Запись не найдена');
  await w.set(u, Favorite, { target });
  return { ok: true };
});

export const removeFavorite = defineSystem<{ uid: string | null }, { ok: true }>('favorites.remove', async (w, i, ctx) => {
  const u = requireUser(ctx);
  if (!i.uid) fail(400, 'Нужен uid');
  const target = await w.find(i.uid);
  if (target != null) await w.run('DELETE FROM c_favorite WHERE entity = ? AND target = ?', [u, target]);
  return { ok: true };
});

export const getProgress = defineSystem<void, { items: Record<string, { state: string; updated: string }> }>('progress.get', async (w, _i, ctx) => {
  const r = await w.run('SELECT item, state, updated_at FROM c_progress WHERE entity = ?', [requireUser(ctx)]);
  return { items: Object.fromEntries(r.rows.map(x => [String(x.item), { state: String(x.state), updated: String(x.updated_at) }])) };
});

/** { item: "course:prompt/3", state: "started" | "done" | null } — null сбрасывает */
export const setProgress = defineSystem<{ item?: unknown; state?: unknown }, { ok: true }>('progress.set', async (w, i, ctx) => {
  const u = requireUser(ctx);
  if (typeof i.item !== 'string' || !i.item || i.item.length > 120) fail(400, 'Нужен item');
  if (i.state == null) { await w.run('DELETE FROM c_progress WHERE entity = ? AND item = ?', [u, i.item as string]); return { ok: true }; }
  if (i.state !== 'started' && i.state !== 'done') fail(400, 'state: started или done');
  await w.run(`INSERT INTO c_progress (entity, item, state) VALUES (?, ?, ?) ON CONFLICT(entity, item) DO UPDATE SET state = excluded.state, updated_at = datetime('now')`, [u, i.item as string, i.state as string]);
  return { ok: true };
});
