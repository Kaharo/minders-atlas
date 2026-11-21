// Архив Пульса: новости из atlas-pulse.json дописываются в pulse-archive/ГГГГ-ММ.json (по месяцу новости).
// Ключ модели не нужен. Запуск: node scripts/archive-pulse.mjs [файл сборки]. В workflow pulse выполняется каждый день.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const src = process.argv[2] || 'atlas-pulse.json';
const build = JSON.parse(await readFile(src, 'utf8'));
const day = (build.updated || new Date().toISOString()).slice(0, 10);
const byMonth = new Map();
for (const x of build.items || []) {
  const ts = Number(x.ts);
  if (!x.id || !x.title || !Number.isFinite(ts) || ts <= 0) continue;
  const m = new Date(ts).toISOString().slice(0, 7);
  if (!byMonth.has(m)) byMonth.set(m, []);
  byMonth.get(m).push(x);
}
// разборы персон за день сборки хранятся в месяце этого дня
const digests = Object.entries(build.personas || {}).filter(([, d]) => d && (d.ru || d.en)).map(([p, d]) => ({ p, day: d.date || day, ru: d.ru ?? null, en: d.en ?? null }));
if (digests.length && !byMonth.has(day.slice(0, 7))) byMonth.set(day.slice(0, 7), []);

await mkdir('pulse-archive', { recursive: true });
let added = 0;
for (const [month, fresh] of byMonth) {
  const file = `pulse-archive/${month}.json`;
  let old = { items: [], digests: [] };
  try { old = JSON.parse(await readFile(file, 'utf8')); } catch { /* первого файла за месяц ещё нет */ }
  const items = new Map((old.items || []).map(x => [x.id, x]));
  for (const x of fresh) {
    const was = items.get(x.id);
    if (!was) added++;
    const notes = { ...(was?.notes || {}), ...(x.notes || {}) };
    const rec = { ...was, ...x };
    if (Object.keys(notes).length) rec.notes = notes; else delete rec.notes;
    items.set(x.id, rec);
  }
  const dg = new Map((old.digests || []).map(d => [d.p + ':' + d.day, d]));
  if (month === day.slice(0, 7)) for (const d of digests) dg.set(d.p + ':' + d.day, d);
  const out = { month, updated: build.updated && (!old.updated || build.updated > old.updated) ? build.updated : old.updated || build.updated || null,
    items: [...items.values()].sort((a, b) => b.ts - a.ts), digests: [...dg.values()].sort((a, b) => (a.day + a.p < b.day + b.p ? 1 : -1)) };
  await writeFile(file, JSON.stringify(out, null, 1) + '\n');
}
console.log('архив Пульса:', added, 'новых записей,', byMonth.size, 'мес.');
