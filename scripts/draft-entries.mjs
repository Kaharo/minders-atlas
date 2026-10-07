// Черновики записей из Пульса → сразу в data/*.json (status: draft). Workflow открывает PR:
// Merge = публикация, Close = отказ. Описание PR — drafts/ГГГГ-ММ-ДД.md.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { KEY, askJSON } from './claude.mjs';

if (!KEY) { console.log('drafts: ANTHROPIC_API_KEY не задан, пропускаю'); process.exit(0); }

const today = new Date().toISOString().slice(0, 10);
const read = async (f) => JSON.parse(await readFile('data/' + f + '.json', 'utf8'));
const data = { incidents: await read('incidents'), glossary: await read('glossary'), research: await read('research') };
const known = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.map(x => x.id)]));
const pulse = JSON.parse(await readFile('atlas-pulse.json', 'utf8'));
const pool = pulse.items.slice().sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 30);

const system = await readFile('personas/_drafts.md', 'utf8');
const user = 'Уже есть id:\n' + JSON.stringify(known) + '\n\nСуществующие заголовки (не повторять темы):\n'
  + Object.values(data).flat().map(x => '- ' + (x.title || (x.ru && x.ru.title))).join('\n')
  + '\n\nКандидаты из Пульса:\n' + pool.map(x => `- ${x.title} | ${x.url} | ${(x.ps || []).join(',')}`).join('\n')
  + '\n\nВерни только JSON по формату из инструкции.';

const out = await askJSON(system, user, 8000);
const added = [];
for (const e of out.entries || []) {
  const sec = e.section, x = e.record;
  if (!data[sec] || !x || !x.id || known[sec].includes(x.id)) continue;
  if (sec !== 'incidents') x.status = 'draft';
  data[sec].push(x); known[sec].push(x.id); added.push({ sec, x, why: e.why });
}
if (!added.length) { console.log('drafts: подходящих кандидатов нет'); process.exit(0); }
for (const k of Object.keys(data)) await writeFile('data/' + k + '.json', JSON.stringify(data[k], null, 1) + '\n');

const T = (x) => x.title || x.ru.title, TX = (x) => x.text || x.ru.text;
const md = [`Черновики из Пульса за неделю: ${added.length}. Записи уже добавлены в \`data/*.json\` со статусом draft.`, '',
  '**Merge** публикует их на сайте. Ненужные удалите из файлов в этой ветке, текст можно поправить там же. **Close** отклоняет все.', '']
  .concat(...added.map(({ sec, x, why }) => [`### ${T(x)}`, `${sec} · \`${x.id}\` · ${x.domain} · ${x.date}`, '', TX(x), '', ...(x.sources || []).map(s => `- [${s.t}](${s.u})`), '', `> Проверить: ${why || '—'}`, '']));
await mkdir('drafts', { recursive: true });
await writeFile(`drafts/${today}.md`, md.join('\n'));
await writeFile('drafts/LATEST.md', md.join('\n'));
console.log('drafts:', added.length);
