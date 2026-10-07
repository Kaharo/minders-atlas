// Разборы персон: каждая персона читает свои новости и пишет дайджест + заметку к каждой новости.
// Запуск после build-pulse.mjs. Без ANTHROPIC_API_KEY тихо пропускается.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { KEY, askJSON } from './claude.mjs';

if (!KEY) { console.log('reflect: ANTHROPIC_API_KEY не задан, пропускаю'); process.exit(0); }

const pulse = JSON.parse(await readFile('atlas-pulse.json', 'utf8'));
const ORD = ['apex', 'meridian', 'gaya', 'archive', 'lexicon', 'orbix'];
const cross = (x) => (x.ps || []).filter(k => k !== 'orbix').length >= 2;
const today = new Date().toISOString().slice(0, 10);
const shared = await readFile('personas/_shared.md', 'utf8');
const PER = Number(process.env.ATLAS_PER_PERSONA || 6);
pulse.personas = pulse.personas || {};

for (const id of ['orbix', 'apex', 'meridian', 'lexicon', 'archive', 'gaya', 'prism']) {
  const profile = await readFile(`personas/${id}.md`, 'utf8');
  const pool = pulse.items
    .filter(x => id === 'prism' ? cross(x) : (x.ps || []).includes(id))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, PER);
  if (!pool.length) { console.log(id, ': нет новостей'); continue; }
  let ctx = '';
  if (id === 'prism') {
    const others = Object.fromEntries(ORD.map(k => [k, pulse.personas[k]]).filter(([, v]) => v && v.date === today).map(([k, v]) => [k, v.ru]));
    ctx = '\n\nРазборы других персон за сегодня:\n' + JSON.stringify(others, null, 1);
  }
  const user = `Дата: ${today}\nНовости (id | заголовок | источник | теги персон):\n`
    + pool.map(x => `- ${x.id} | ${x.title} | ${x.src} | ${(x.ps || []).join(',')}`).join('\n')
    + ctx + '\n\nВерни только JSON по формату из инструкции.';
  try {
    const out = await askJSON(shared + '\n\n' + profile, user);
    pulse.personas[id] = { date: today, ru: out.digest_ru, en: out.digest_en, ids: pool.map(x => x.id) };
    for (const n of out.notes || []) {
      const it = pulse.items.find(x => x.id === n.id);
      if (it) (it.notes = it.notes || {})[id] = { ru: n.ru, en: n.en };
    }
    console.log(id, ': ok,', (out.notes || []).length, 'заметок');
  } catch (e) { console.error(id, ':', e.message); }
}

await writeFile('atlas-pulse.json', JSON.stringify(pulse, null, 1));
await mkdir('pulse-archive', { recursive: true });
await writeFile(`pulse-archive/${today}.json`, JSON.stringify({ date: today, personas: pulse.personas, items: pulse.items.filter(x => x.notes) }, null, 1));
