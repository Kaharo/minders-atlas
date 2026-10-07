// Собирает atlas-pulse.json из открытых источников. Запуск: node scripts/build-pulse.mjs
// В GitHub Actions выполняется ежедневно (.github/workflows/pulse.yml).
import { readFile, writeFile } from 'node:fs/promises';

const DAYS = 14, since = Math.floor(Date.now() / 1000) - DAYS * 86400;
const J = (u) => fetch(u, { headers: { 'user-agent': 'minders-atlas-pulse' } }).then(r => r.ok ? r.json() : Promise.reject(r.status));

const personas = (t, src) => {
  const s = (t || '').toLowerCase(), R = {
    apex: /(regulat|\bban\b|banned|government|military|defen[cs]e|pentagon|china|chinese|export|sanction|antitrust|congress|senate|white house|\beu\b|ai act|policy|court|judge|\bftc\b|\bdoj\b|monopol|sovereign|geopolit|national security|surveillance|election|lawsuit|sued|president|minister|treaty)/,
    meridian: /(funding|raises|raised|valuation|\bipo\b|revenue|billion|\$\d|market|investor|invest|layoff|laid off|\bjobs\b|hiring|workforce|pricing|\bprice|\bcost|acqui|startup|profit|econom|stock|\bdeal\b|earnings|productivity)/,
    gaya: /(energy|power grid|electricity|climate|carbon|emission|\bwater\b|data ?cent|nuclear|environment|planet|weather|cooling|solar|sustainab|gigawatt|megawatt)/,
    archive: /(educat|student|school|teacher|universit|\bart\b|artist|music|copyright|writer|author|\bbook|culture|societ|social|child|\bkids\b|teen|mental health|loneliness|relationship|religio|language|misinformation|deepfake|privacy|journalis|wikipedia)/,
    lexicon: /(paper|arxiv|study|research|we show|survey|scaling law|theorem|proof|\bmath|physics|biolog|protein|\bdrug|discover|scientist|neuro|genom|chemist)/,
    orbix: /(model|llm|gpt|claude|gemini|llama|mistral|qwen|deepseek|agent|open[- ]source|open weights|inference|gpu|chip|transformer|release|launch|\bapi\b|framework|robot|compute)/
  };
  const m = Object.keys(R).filter(k => R[k].test(s));
  if (src === 'HF Papers' && m.indexOf('lexicon') < 0) m.unshift('lexicon');
  if (!m.length) m.push('orbix');
  return m;
};
const hn = ['LLM', 'AI agent', 'OpenAI', 'Anthropic', 'Gemini', 'open weights', 'AI regulation', 'AI chips', 'AI funding', 'AI jobs', 'data center energy', 'AI climate', 'AI copyright', 'AI education'].map(q =>
  J(`https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=25&query=${encodeURIComponent(q)}&numericFilters=created_at_i>${since},points>40`)
    .then(j => j.hits.map(h => ({ id: 'hn' + h.objectID, title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, ts: h.created_at_i * 1000, src: 'Hacker News', score: h.points })))
    .catch(() => []));

const hf = J('https://huggingface.co/api/daily_papers?limit=50')
  .then(a => a.map(p => { const q = p.paper || {}; return { id: 'hf' + q.id, title: p.title || q.title, url: `https://huggingface.co/papers/${q.id}`, ts: Date.parse(p.publishedAt || q.publishedAt), src: 'HF Papers', score: q.upvotes || 0 }; }))
  .catch(() => []);

// Сюда же добавляются: AI Incident Database, arXiv cs.CL/cs.AI, лидерборды (LMArena, SWE-bench), блоги лабораторий (RSS).

const items = [].concat(...await Promise.all([...hn, hf]));
const seen = new Set();
const out = items
  .filter(x => x.title && !seen.has(x.id) && seen.add(x.id))
  .map(x => ({ ...x, ps: personas(x.title, x.src) }))
  .sort((a, b) => b.ts - a.ts)
  .slice(0, 120);

// заметки персон и дайджесты из прошлой сборки переносятся, чтобы не терять разборы
let prev = {}; try { prev = JSON.parse(await readFile('atlas-pulse.json', 'utf8')); } catch {}
const notes = Object.fromEntries((prev.items || []).filter(x => x.notes).map(x => [x.id, x.notes]));
out.forEach(x => { if (notes[x.id]) x.notes = notes[x.id]; });
await writeFile('atlas-pulse.json', JSON.stringify({ updated: new Date().toISOString(), days: DAYS, personas: prev.personas || {}, items: out }, null, 1));
console.log(`atlas-pulse.json: ${out.length} items`);
