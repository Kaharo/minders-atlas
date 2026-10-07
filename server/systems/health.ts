import { defineSystem, systems } from '../ecs/core';
import { storageMode } from '../storage/turso';

export const health = defineSystem<void, Record<string, unknown>>('health', async (w) => {
  const [tags, meta] = await Promise.all([
    w.run('SELECT tag, COUNT(*) AS n FROM c_tag GROUP BY tag'),
    w.run("SELECT key, value FROM meta WHERE key IN ('synced','pulse_updated')")
  ]);
  return {
    ok: true, storage: storageMode,
    note: storageMode === 'memory' ? 'База не подключена: данные из JSON репозитория, аккаунты не сохраняются. Добавьте TURSO_DATABASE_URL и TURSO_AUTH_TOKEN.' : undefined,
    entities: Object.fromEntries(tags.rows.map(r => [String(r.tag), Number(r.n)])),
    meta: Object.fromEntries(meta.rows.map(r => [String(r.key), r.value])),
    systems: systems()
  };
});
