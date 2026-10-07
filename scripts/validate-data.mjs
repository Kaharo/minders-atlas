// data/*.json → проверка структуры. Запуск: node scripts/validate-data.mjs
// Падает с ошибкой, если запись неполная, id повторяется или домен неизвестен.
import { readFile } from 'node:fs/promises';

const read = async (f) => JSON.parse(await readFile('data/' + f + '.json', 'utf8'));
const db = { incidents: await read('incidents'), glossary: await read('glossary'), research: await read('research'), scores: await read('scores') };

export const DOMAINS = {
  incidents: ['prompting', 'context', 'knowledge', 'memory', 'tools', 'agents', 'evaluation', 'guardrails', 'observability', 'deployment', 'optimization', 'security'],
  glossary: ['d_models', 'd_context', 'd_runtime', 'd_quality', 'd_trust'],
  research: ['d_models', 'd_context', 'd_runtime', 'd_quality', 'd_trust']
};
const KINDS = { glossary: ['technique', 'product', 'standard', 'concept'], research: ['study', 'report'] };
const COURSE = ['basics', 'prompt', 'evals', 'verify', 'scale', 'landscape'];
const errs = [], need = (c, m) => { if (!c) errs.push(m); };
const date = (d) => /^\d{4}-(0[1-9]|1[0-2])$/.test(d || '');
const src = (x, w) => need(Array.isArray(x.sources) && x.sources.length && x.sources.every(s => s.t && /^https?:\/\//.test(s.u || '')), w + ': нужен хотя бы один источник с t и https-ссылкой u');

const seen = new Set();
for (const x of db.incidents) {
  const w = 'incidents/' + x.id;
  need(x.id && !seen.has('i:' + x.id), w + ': пустой или повторный id'); seen.add('i:' + x.id);
  need(DOMAINS.incidents.includes(x.domain), w + ': неизвестный domain ' + x.domain);
  need(date(x.date), w + ': date в формате ГГГГ-ММ');
  need([1, 2, 3].includes(x.sev), w + ': sev 1–3');
  for (const k of ['kind', 'where', 'title', 'text', 'response']) need(x[k], w + ': нет поля ' + k);
  src(x, w);
}
for (const sec of ['glossary', 'research']) for (const x of db[sec]) {
  const w = sec + '/' + x.id;
  need(x.id && !seen.has(sec + ':' + x.id), w + ': пустой или повторный id'); seen.add(sec + ':' + x.id);
  need(DOMAINS[sec].includes(x.domain), w + ': неизвестный domain ' + x.domain);
  need(KINDS[sec].includes(x.kind), w + ': kind из ' + KINDS[sec].join('/'));
  need(date(x.date) || (sec === 'glossary' && (!x.date || /^\d{4}$/.test(x.date))), w + ': date в формате ГГГГ-ММ' + (sec === 'glossary' ? ', ГГГГ или пусто' : ''));
  need(x.ru && x.ru.title && x.ru.text, w + ': нет ru.title / ru.text');
  if (sec === 'research') { need(COURSE.includes(x.course), w + ': course из ' + COURSE.join('/')); need(['draft', 'supported'].includes(x.status), w + ': status draft/supported'); }
  src(x, w);
}
for (const b of db.scores.benchmarks) need(db.scores.results[b.id], 'scores/' + b.id + ': нет результатов');
for (const [b, r] of Object.entries(db.scores.results)) for (const [m, v] of Object.entries(r)) need(typeof v === 'number' && isFinite(v), 'scores/' + b + '/' + m + ': значение не число');

if (errs.length) { console.error('Ошибки в data/:\n- ' + errs.join('\n- ')); process.exit(1); }
console.log('data/ в порядке:', db.incidents.length, 'инцидентов,', db.glossary.length, 'терминов,', db.research.length, 'исследований,', db.scores.benchmarks.length, 'бенчмарков');
