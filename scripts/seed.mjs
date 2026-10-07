// Посев Turso из Git-источников. Запуск: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/seed.mjs
import { createClient } from '@libsql/client';
import { readFile, readdir } from 'node:fs/promises';
import { seedWorld } from './lib/seed-world.mjs';

const db = createClient({ url: process.env.TURSO_DATABASE_URL ?? 'file:local.db', authToken: process.env.TURSO_AUTH_TOKEN });
const read = async (f, d) => { try { return JSON.parse(await readFile(f, 'utf8')); } catch { return d; } };
const files = ['atlas-pulse.json'];
try { (await readdir('pulse-archive')).filter(f => f.endsWith('.json')).sort().forEach(f => files.push('pulse-archive/' + f)); } catch {}
const st = await seedWorld(db, {
  glossary: await read('data/glossary.json', []), research: await read('data/research.json', []), incidents: await read('data/incidents.json', []), scores: await read('data/scores.json', {}),
  pulse: await Promise.all(files.map(f => read(f, null)))
});
console.log(`посев: ${st.terms} терминов, ${st.research} исследований, ${st.incidents} инцидентов, ${st.benchmarks} бенчмарков (${st.results} результатов), ${st.pulse} новостей, ${st.digests} дайджестов`);
