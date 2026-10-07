// Сверка рейтингов с Artificial Analysis → data/scores.json. Workflow открывает PR с таблицей изменений.
// Ключ: секрет AA_API_KEY (бесплатный, artificialanalysis.ai → API). Arena и SWE-bench обновляются вручную.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const KEY = process.env.AA_API_KEY;
if (!KEY) { console.log('scores: AA_API_KEY не задан, пропускаю'); process.exit(0); }

// бенчмарк атласа → поле в evaluations ответа API (первое найденное)
const FIELDS = { hle: ['hle'], gpqa: ['gpqa'], tbench: ['terminalbench_hard', 'terminal_bench_hard', 'terminalbench'] };
const MANUAL = { arena: 'https://arena.ai/leaderboard/text', swe: 'https://www.swebench.com/verified.html' };

const r = await fetch('https://artificialanalysis.ai/api/v2/data/llms/models', { headers: { 'x-api-key': KEY } });
if (!r.ok) { console.error('scores: API', r.status, (await r.text()).slice(0, 200)); process.exit(1); }
const models = (await r.json()).data || [];
const db = JSON.parse(await readFile('data/scores.json', 'utf8'));
const known = new Set(Object.values(db.results).flatMap(Object.keys));
const pct = (v) => Math.round((v <= 1 ? v * 100 : v) * 10) / 10;
const changes = [], fresh = [];

for (const [bid, keys] of Object.entries(FIELDS)) {
  const cur = db.results[bid] || (db.results[bid] = {});
  for (const m of models) {
    const ev = m.evaluations || {}, k = keys.find(k => typeof ev[k] === 'number');
    if (!k || !m.slug) continue;
    const v = pct(ev[k]);
    if (!known.has(m.slug)) { fresh.push([bid, m.slug, m.name, v]); continue; }
    if (cur[m.slug] === undefined || Math.abs(cur[m.slug] - v) >= 0.1) { changes.push([bid, m.slug, cur[m.slug], v]); cur[m.slug] = v; }
  }
}
if (!changes.length) { console.log('scores: изменений нет'); process.exit(0); }

const d = new Date();
db.checked = String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0') + '.' + d.getUTCFullYear();
await writeFile('data/scores.json', JSON.stringify(db, null, 1) + '\n');

const top = fresh.sort((a, b) => b[3] - a[3]).slice(0, 15);
const md = [`Сверка с Artificial Analysis, ${db.checked}. Изменений: ${changes.length}.`, '',
  '| Бенчмарк | Модель | Было | Стало |', '|---|---|---|---|',
  ...changes.map(([b, m, o, n]) => `| ${b} | ${m} | ${o ?? '—'} | ${n} |`), '',
  top.length ? '**Новые модели, которых нет в атласе** (не добавлены; чтобы добавить, заведите карточку в atlas-models-v2.js и впишите результат в data/scores.json):' : '',
  ...top.map(([b, m, name, v]) => `- ${b}: ${name} (\`${m}\`) — ${v}`), '',
  '**Вручную:** ' + Object.entries(MANUAL).map(([k, u]) => `[${k}](${u})`).join(', ') + '. Если там есть новые результаты, допишите их в эту ветку.'];
await mkdir('drafts', { recursive: true });
await writeFile('drafts/SCORES.md', md.join('\n'));
console.log('scores:', changes.length, 'изменений,', fresh.length, 'новых моделей вне атласа');
