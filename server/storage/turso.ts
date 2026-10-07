// Хранилище мира. С TURSO_DATABASE_URL — Turso (постоянная база: аккаунты, избранное, архив Пульса).
// Без неё — libSQL в памяти функции, засеянный из JSON репозитория при холодном старте: сайт работает сразу после пуша,
// но аккаунты не сохраняются между перезапусками функции.
import { createClient, type Client } from '@libsql/client';
import { World } from '../ecs/core';
import { sql as schema } from '../../migrations/0001_ecs.mjs';
import { seedWorld } from '../../scripts/lib/seed-world.mjs';
import glossary from '../../data/glossary.json';
import research from '../../data/research.json';
import incidents from '../../data/incidents.json';
import scores from '../../data/scores.json';
import pulse from '../../atlas-pulse.json';

export type StorageMode = 'turso' | 'memory';
let client: Client | null = null;
let ready: Promise<void> | null = null;
export let storageMode: StorageMode = 'memory';

export async function world(): Promise<World> {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (url) {
      client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
      storageMode = 'turso';
      ready = Promise.resolve();
    } else {
      client = createClient({ url: ':memory:' });
      storageMode = 'memory';
      const c = client;
      ready = (async () => {
        await c.executeMultiple(schema);
        await seedWorld(c, { glossary, research, incidents, scores, pulse: [pulse] });
      })();
    }
  }
  await ready;
  return new World(client);
}
