// Применяет migrations/*.mjs по порядку, запоминая применённые в meta.
// Запуск: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/migrate.mjs   (без переменных: file:local.db)
import { createClient } from '@libsql/client';
import { readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const db = createClient({ url: process.env.TURSO_DATABASE_URL ?? 'file:local.db', authToken: process.env.TURSO_AUTH_TOKEN });
await db.execute('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)');
const done = new Set((await db.execute("SELECT key FROM meta WHERE key LIKE 'migration:%'")).rows.map(r => String(r.key).slice(10)));
for (const f of (await readdir('migrations')).filter(f => f.endsWith('.mjs')).sort()) {
  if (done.has(f)) continue;
  const { sql } = await import(pathToFileURL('migrations/' + f).href);
  await db.executeMultiple(sql);
  await db.execute({ sql: 'INSERT INTO meta (key, value) VALUES (?, ?)', args: ['migration:' + f, new Date().toISOString()] });
  console.log('применена', f);
}
console.log('схема актуальна');
