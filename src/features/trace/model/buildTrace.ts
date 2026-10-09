// Учебный режим: запрос → шаги по карте. Перенос _learnSubmit / _submit прототипа.
import type { Locale } from '@/shared/i18n';
import { ATLAS_ARCH } from '@/entities/model/lib/arch';
import { modelById } from '@/entities/model';
import type { AtlasEntry } from '@/entities/atlas-entry';

export interface Chip { w: string; st: 'ok' | 'hit' | 'removed' | 'added' }
export interface TokChip { w: string; id: string; bg: string; bd: string; fg: string }
export interface Step {
  key: string; short: string; title: string; text: string; done: string; color: string; where: string;
  chips: Chip[]; fan?: boolean;
  tchips?: TokChip[] | null; rows?: [string, string][]; bars?: { k: string; v: string; c: string; w: string }[];
  vec?: { w: string; cells: { c: string }[] }[]; vecNote?: string; note?: string;
}
export interface Hit { id: string; s: number; dom: string }

export const SAMPLES = ['агент вызывает инструмент', 'поиск по документам', 'инъекция обошла ограждения'];
export const SAMPLES_EN = ['an agent calls a tool', 'search over documents', 'an injection bypassed the guardrails'];

const LEX: Record<string, string[]> = {
  prompting: ['промпт', 'инструкц', 'пример', 'формат', 'роль', 'шаблон', 'prompt', 'few'], context: ['контекст', 'окно', 'токен', 'история', 'сжат', 'документ', 'context'],
  knowledge: ['знан', 'поиск', 'rag', 'индекс', 'embedding', 'вектор', 'источник', 'граф'], memory: ['памят', 'помн', 'забы', 'сессия', 'профил', 'memory'],
  tools: ['инструмент', 'функц', 'api', 'вызов', 'tool', 'mcp', 'интеграц'], agents: ['агент', 'план', 'шаг', 'цикл', 'задач', 'автоном', 'agent'],
  evaluation: ['оцен', 'эвал', 'метрик', 'тест', 'бенчмарк', 'качеств', 'eval'], guardrails: ['огражд', 'политик', 'отказ', 'guardrail', 'фильтр', 'джейл'],
  observability: ['лог', 'трасс', 'монитор', 'наблюда', 'trace'], deployment: ['деплой', 'релиз', 'выкат', 'сервер', 'масштаб', 'версия', 'прод'],
  optimization: ['стоимост', 'цена', 'задерж', 'кэш', 'квантиз', 'быстр', 'оптимиз'], security: ['атак', 'инъекц', 'взлом', 'защит', 'уязвим', 'утечк', 'доступ', 'security']
};
const VOCAB: Record<string, string[]> = {
  d_context: ['инструкция', 'пример', 'формат', 'окно', 'история', 'источник', 'индекс', 'фрагмент', 'профиль', 'сессия'],
  d_runtime: ['вызов', 'схема', 'результат', 'параметр', 'план', 'шаг', 'проверка', 'итерация', 'цель'],
  d_quality: ['метрика', 'набор', 'прогон', 'сравнение', 'трасса', 'событие', 'релиз', 'версия', 'кэш', 'латентность'],
  d_trust: ['политика', 'отказ', 'граница', 'проверка', 'изоляция', 'права', 'аудит'],
  d_models: ['слой', 'внимание', 'вектор', 'токен', 'вероятность']
};
const HUE: Record<string, number> = { d_models: 228, d_context: 192, d_runtime: 268, d_quality: 300, d_trust: 150 };
const ROLE: Record<string, [string, string]> = { d_trust: ['Защита', 'Guards'], d_context: ['Сборка контекста', 'Context assembly'], d_runtime: ['Инструменты', 'Tools'], d_quality: ['Наблюдаемость', 'Observability'], d_models: ['Модель', 'Model'] };

export const tokenize = (s: string) => String(s).split(/[\s,.;:!?()"«»—-]+/).filter(w => w.length).slice(0, 18);

// ── лексический вектор текста: хэш символьных 3-грамм ──
const D = 256;
const STOP = new Set('и в на с по для что как это его она они при или не из от до так уже без под над the and for with that this from into are was were have has you your can'.split(' '));
const h32 = (x: string) => { let h = 2166136261; for (let i = 0; i < x.length; i++) { h ^= x.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
export function vec(s: string): Float32Array {
  const v = new Float32Array(D);
  const words = (s || '').toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  for (let w of words) { if (STOP.has(w) || w.length < 2) continue; w = w.slice(0, 7); const t = ' ' + w + ' '; for (let i = 0; i + 3 <= t.length; i++) { const h = h32(t.slice(i, i + 3)); v[h % D] += 1; } }
  let L = 0; for (let i = 0; i < D; i++) L += v[i] * v[i]; L = Math.sqrt(L) || 1; for (let i = 0; i < D; i++) v[i] /= L;
  return v;
}
export const cos = (a: Float32Array, b: Float32Array) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

/** Векторы записей раздела (заголовок + текст), с центрированием на среднем. */
export function indexEntries(entries: AtlasEntry[], locale: Locale) {
  const raw = entries.map(e => vec([locale === 'en' ? e.title.en ?? e.title.ru : e.title.ru, e.text ? (locale === 'en' ? e.text.en ?? e.text.ru : e.text.ru) : '', ...e.aliases].join(' ')));
  const mu = new Float32Array(D); raw.forEach(v => { for (let i = 0; i < D; i++) mu[i] += v[i] / raw.length; });
  const center = (v: Float32Array) => { const o = new Float32Array(D); let L = 0; for (let i = 0; i < D; i++) { o[i] = v[i] - mu[i]; L += o[i] * o[i]; } L = Math.sqrt(L) || 1; for (let i = 0; i < D; i++) o[i] /= L; return o; };
  const byId = new Map(entries.map((e, i) => [e.key, center(raw[i])]));
  return { byId, center };
}

const col = (h: number) => 'hsl(' + h + ',72%,52%)';
const n = (x: number, en: boolean) => Number(x).toLocaleString(en ? 'en-US' : 'ru-RU');

/** Глоссарий: путь запроса через модель. */
export function buildLearnTrace(v: string, modelId: string, locale: Locale): Step[] {
  const en = locale === 'en', T = (r: string, e: string) => (en ? e : r), m = modelById(modelId), ar = m ? ATLAS_ARCH.get(m) : null, hid = !ar || ar.src === 'hidden';
  const toks: string[] = [];
  v.split(/(\s+)/).forEach(w => { if (!w.trim()) return; const cyr = /[а-яё]/i.test(w), sp = toks.length ? '·' : ''; if (w.length <= (cyr ? 4 : 6)) toks.push(sp + w); else { let i = 0, f = true; while (i < w.length) { const k = Math.min(w.length - i, cyr ? 3 : 4); toks.push((f ? sp : '') + w.slice(i, i + k)); i += k; f = false; } } });
  const V = ar ? ar.V : 128000, d = ar ? ar.d : 4096, ids = toks.map(t => 1000 + h32(t) % (V - 1000));
  const inj = /(игнорир|ignore|забудь|forget|system prompt|системн\S* промпт|jailbreak)/i.test(v), pii = /[\w.+-]+@[\w-]+\.\w+|\+?\d[\d ()-]{8,}\d/.test(v);
  const Ntot = 1180 + 300 + toks.length, kvB = ar ? ar.kvBytesTok : 0;
  const fb = (b: number) => b / 1048576 >= 1 ? n(Math.round(b / 104857.6) / 10, en) + T(' МБ', ' MB') : n(Math.round(b / 1024), en) + T(' КБ', ' KB');
  const PAL = [['#e0e7ff', '#6366f1'], ['#f3e8ff', '#a855f7'], ['#e0f2fe', '#0284c7'], ['#fef3c7', '#d97706'], ['#dcfce7', '#16a34a']];
  const st: Step[] = [];
  const add = (key: string, short: string, title: string, text: string, done: string, color: string, viz: Partial<Step> = {}) => st.push({ key, short, title, text, done, color, where: short, chips: [], ...viz });
  add('in', T('запрос', 'request'), T('Запрос', 'Request'), T('Пользователь отправил фразу. Дальше её обрабатывает обвязка, и только потом модель.', 'The user sends a phrase. The scaffolding handles it first, the model comes later.'), n(toks.length, en) + T(' ток.', ' tok'), '#6366f1', { rows: [[T('Символов', 'Characters'), n(v.length, en)]] });
  add('d_trust', T('фильтр', 'filter'), T('Входной guardrail', 'Input guardrail'), T('Отдельные классификаторы проверяют текст до модели: попытки prompt injection и персональные данные.', 'Separate classifiers check the text before the model: prompt injection and personal data.'), inj ? T('заблокировано', 'blocked') : T('пропущено', 'passed'), col(150), { rows: [['Prompt injection', inj ? T('0.92 · выше порога 0.5', '0.92 · above 0.5') : T('0.03 · ниже порога 0.5', '0.03 · below 0.5')], [T('Персональные данные', 'Personal data'), pii ? T('найдены → маска', 'found → masked') : T('не найдены', 'none')]] });
  if (!inj) {
    add('d_context', T('контекст', 'context'), T('Сборка контекста', 'Context assembly'), T('К запросу добавляются системные инструкции, описания инструментов и найденные фрагменты документов (RAG).', 'System instructions, tool definitions and retrieved document chunks (RAG) are added to the request.'), n(Ntot, en) + T(' ток.', ' tok'), col(192), { bars: ([['system', 1180, '#6366f1'], ['RAG', 300, '#d97706'], [T('запрос', 'request'), toks.length, '#0b0b14']] as [string, number, string][]).map(([k, x, c]) => ({ k, v: n(x, en), c, w: Math.max(4, x / Ntot * 150) + 'px' })) });
    add('tok', T('токены', 'tokens'), T('Токенизация', 'Tokenization'), T('Текст режется на кусочки по словарю BPE. Каждый токен — просто номер в словаре. Кириллица дробится мельче латиницы.', 'Text is cut into pieces from a BPE vocabulary. Each token is just an ID. Cyrillic splits finer than Latin.'), n(toks.length, en) + T(' ток.', ' tok'), '#3b5bfd', { tchips: toks.slice(0, 18).map((w, i) => ({ w, id: String(ids[i]), bg: PAL[i % 5][0], bd: PAL[i % 5][1] + '55', fg: PAL[i % 5][1] })), rows: [[T('Словарь', 'Vocabulary'), hid ? T('не раскрыт', 'undisclosed') : n(V, en)]], note: T('Разбиение приблизительное.', 'Approximate split.') });
    add('emb', T('эмбеддинг', 'embedding'), T('Эмбеддинг', 'Embedding'), T('Номер токена выбирает строку из матрицы эмбеддингов. С этого места модель работает не с текстом, а с векторами длиной d.', 'The token ID picks a row of the embedding matrix. From here the model works with vectors of length d, not text.'), T('векторы d = ', 'vectors d = ') + n(d, en), '#0ea5e9', { vec: toks.slice(0, 5).map((w, i) => { let s0 = ids[i] >>> 0; return { w, cells: Array.from({ length: 16 }, () => { s0 = (Math.imul(s0 ^ (s0 >>> 15), 2246822507) + 0x9e3779b9) >>> 0; const x = ((s0 >>> 8) / 16777216) * 2 - 1; return { c: x > 0 ? 'rgba(168,85,247,' + (0.2 + 0.8 * x) + ')' : 'rgba(14,165,233,' + (0.2 - 0.8 * x) + ')' }; }) }; }), vecNote: T('показано 16 из ', '16 of ') + n(d, en) + T(' чисел', ' numbers'), rows: [[T('Матрица', 'Matrix'), 'V × d = ' + n(V, en) + ' × ' + n(d, en)]] });
    add('core', T('модель', 'model'), T('Слои модели', 'Model layers'), T('Все токены проходят слои одновременно. В каждом слое attention смешивает информацию между токенами, затем ' + (ar && ar.E ? 'роутер отправляет каждый токен к ' + ar.k + ' из ' + ar.E + ' экспертов.' : 'MLP обрабатывает каждый токен отдельно.'), 'All tokens pass the layers at once. In each layer attention mixes tokens, then ' + (ar && ar.E ? 'a router sends each token to ' + ar.k + ' of ' + ar.E + ' experts.' : 'an MLP processes each token.')), n(ar ? ar.L : 0, en) + T(' слоёв', ' layers'), '#6366f1', { rows: [[T('Слоёв', 'Layers'), n(ar ? ar.L : 0, en)], [T('Головы Q / KV', 'Heads Q / KV'), ar ? ar.H + ' / ' + ar.KV : '—'], [T('Эксперты', 'Experts'), ar && ar.E ? ar.E + ' → ' + ar.k : T('плотная', 'dense')]], fan: true });
    add('kv', T('KV-кэш', 'KV cache'), T('KV-кэш и генерация', 'KV cache and generation'), T('Ответ выходит по одному токену. Каждый новый токен снова проходит все слои, а ключи и значения прошлых токенов берутся из KV-кэша.', 'The answer comes out one token at a time. Each new token passes all layers again; keys and values of past tokens come from the KV cache.'), fb(kvB * Ntot), '#a855f7', { rows: [[T('KV на токен', 'KV per token'), fb(kvB)], [T('Кэш этого запроса', 'Cache for this request'), fb(kvB * Ntot)]] });
    add('d_trust_out', T('проверка', 'check'), T('Выходной guardrail', 'Output guardrail'), T('Готовый ответ проверяется до показа: политика контента, утечка данных, опора на документы.', 'The answer is checked before it is shown: content policy, data leaks, grounding.'), T('пропущено', 'passed'), col(150), { rows: [[T('Политика', 'Policy'), T('соблюдена', 'ok')], [T('Утечки', 'Leaks'), T('не найдены', 'none')]] });
  }
  add('out', T('ответ', 'answer'), inj ? T('Ответ платформы', 'Platform reply') : T('Ответ', 'Answer'), inj ? T('Запрос остановлен на входе, модель не вызывалась.', 'The request was stopped at the input; the model was never called.') : T('Пользователь видит ответ.', 'The user sees the answer.'), T('готово', 'ready'), '#15803d');
  return st;
}

/** Остальные разделы: запрос через обвязку с поиском ближайших записей. */
export function buildHarnessTrace(v: string, entries: AtlasEntry[], index: ReturnType<typeof indexEntries>, locale: Locale): { steps: Step[]; hits: Hit[] } {
  const en = locale === 'en', T = (r: string, e: string) => (en ? e : r);
  const titleOf = (e: AtlasEntry) => (en ? e.title.en ?? e.title.ru : e.title.ru) ?? e.key;
  const q = index.center(vec(v));
  const hits: Hit[] = entries.map(e => ({ id: e.key, s: cos(q, index.byId.get(e.key)!), dom: e.domain.domain })).filter(x => x.s > 0.05).sort((x, y) => y.s - x.s).slice(0, 5);
  const byId = new Map(entries.map(e => [e.key, e]));
  const toks = tokenize(v);
  const BAD = /^(игнор|ignore|забуд|forget|обойд|bypass|jailbreak|систем|system|парол|password|секрет|secret|ключ|key|токен|token|удали|delete|drop|отключ|disable|exfil)/i;
  const flagged = toks.filter(w => BAD.test(w)), clean = toks.filter(w => !BAD.test(w));
  const rel = clean.map(w => ({ w, s: Math.max(0, ...hits.slice(0, 3).map(h => cos(index.center(vec(w)), index.byId.get(h.id)!))) })).filter(x => x.s > 0.04).sort((x, y) => y.s - x.s).slice(0, 3).map(x => x.w);
  const short = (x: string, k: number) => (x.length > k ? x.slice(0, k - 1) + '…' : x);
  const needTool = /инструм|tool|агент|agent|вызов|call|поиск|search|api|функц|function|запус|run|письм|mail|документ/i.test(v) || hits.some(h => h.dom === 'd_runtime');
  const tool = /поиск|search|документ|doc/i.test(v) ? 'search_docs' : /почт|mail|письм/i.test(v) ? 'send_email' : /код|code|запус|run/i.test(v) ? 'run_code' : 'call_api';
  const pool: string[] = []; hits.forEach(h => (VOCAB[h.dom] ?? []).forEach(w => { if (!pool.includes(w)) pool.push(w); }));
  const draft = (pool.length ? pool : [T('контекст', 'context'), T('ответ', 'answer')]).slice(0, 5);
  const dk0 = (k: string) => (k === 'core' ? 'd_models' : k === 'd_trust_out' ? 'd_trust' : k);
  const colOf = (k: string) => (k === 'in' || k === 'out' ? '#6366f1' : col(HUE[dk0(k)]));
  const where = (k: string) => (k === 'in' ? T('запрос', 'request') : k === 'out' ? T('ответ', 'response') : k === 'd_trust_out' ? T('гардрейл вывода', 'output guardrail') : ROLE[dk0(k)][en ? 1 : 0]);
  const st: Step[] = [];
  const add = (key: string, sh: string, title: string, txt: string, chips: Chip[], extra: Partial<Step> = {}) => st.push({ key, short: sh, title, text: txt, chips, color: colOf(key), where: where(key), done: '', ...extra });
  const ch = (w: string, s: Chip['st']): Chip => ({ w, st: s });
  add('in', T('запрос', 'request'), T('Запрос разбит на токены', 'Request split into tokens'), T(toks.length + ' токенов поступают на вход контура.', toks.length + ' tokens enter the harness.'), toks.map(w => ch(w, 'ok')));
  add('d_trust', T('фильтр', 'filter'), T('Фильтр ввода', 'Input filter'), flagged.length ? T('Найдены признаки инъекции — эти фрагменты вырезаны до передачи модели.', 'Injection markers found — these fragments are cut before the model sees them.') : T('Проверка на инъекцию и запрещённые темы: нарушений нет.', 'Checked for injection and banned topics: nothing found.'), toks.map(w => ch(w, flagged.includes(w) ? 'removed' : 'ok')));
  add('d_context', T('контекст', 'context'), T('Сборка контекста', 'Context assembly'), T('К запросу добавлены системные инструкции и найденные фрагменты; выделены слова, ближе всего к атласу.', 'System instructions and retrieved fragments are added; the words closest to the atlas are marked.'), [ch('system prompt', 'added'), ...hits.slice(0, 2).map(h => ch(short(titleOf(byId.get(h.id)!), 22), 'added')), ...clean.map(w => ch(w, rel.includes(w) ? 'hit' : 'ok'))]);
  add('core', T('модель', 'model'), T('Модель ищет связи', 'Model finds associations'), hits.length ? T('Вектор запроса сравнивается с векторами точек атласа; ближайшие загораются.', 'The request vector is compared with every point vector; the closest light up.') : T('Близких точек в атласе не нашлось.', 'No close points in the atlas.'), hits.slice(0, 5).map(h => ch(short(titleOf(byId.get(h.id)!), 18) + ' · ' + h.s.toFixed(2), 'hit')), { fan: true });
  if (needTool) {
    add('d_trust', T('проверка вызова', 'call check'), T('Гардрейл проверяет вызов', 'Guardrail checks the call'), T('Модель предложила вызвать инструмент; политика проверяет права и аргументы до исполнения.', 'The model proposed a tool call; policy checks permissions and arguments before it runs.'), [ch('tool_call: ' + tool, 'ok'), ch(T('права: только чтение', 'scope: read-only'), 'added')]);
    add('d_runtime', T('инструмент', 'tool'), T('Вызов инструмента', 'Tool call'), T('Инструмент исполняется в песочнице; результат возвращается как данные, а не инструкции.', 'The tool runs in a sandbox; the result comes back as data, not instructions.'), [ch(tool + '(' + (rel[0] || clean[0] || 'query') + ')', 'hit'), ch('tool_result', 'added')]);
    add('d_context', T('результат', 'result'), T('Результат в контекст', 'Result into context'), T('Ответ инструмента помечен как недоверенный и добавлен в окно контекста.', 'The tool output is marked untrusted and appended to the context window.'), [ch('tool_result', 'added'), ch(T('метка: недоверенное', 'label: untrusted'), 'ok')]);
    add('core', T('черновик', 'draft'), T('Модель формирует ответ', 'Model drafts the answer'), T('Второй проход модели — уже с результатом инструмента.', 'A second model pass, now with the tool result.'), draft.map(w => ch(w, 'ok')));
  }
  const outRemoved = flagged.slice(0, 2);
  add('d_trust_out', T('гардрейл', 'guardrail'), T('Гардрейл вывода', 'Output guardrail'), outRemoved.length ? T('Черновик повторил вырезанные фрагменты — они удалены из ответа.', 'The draft echoed the cut fragments — they are removed from the answer.') : T('Ответ проверен на утечки данных и политику: нарушений нет.', 'Checked for data leaks and policy: nothing found.'), [...draft.map(w => ch(w, 'ok')), ...outRemoved.map(w => ch(w, 'removed'))]);
  add('d_quality', T('трейс', 'trace'), T('Трейс записан', 'Trace recorded'), T('Каждый шаг сохранён для оценки качества и отладки.', 'Every step is stored for evaluation and debugging.'), [ch((st.length + 2) + T(' шагов', ' steps'), 'ok'), ch('~' + (toks.length * 3 + draft.length * 2 + 120) + T(' токенов', ' tokens'), 'ok')]);
  add('out', T('ответ', 'answer'), T('Ответ пользователю', 'Answer to the user'), T('Прошёл все проверки контура.', 'Passed every harness check.'), draft.map(w => ch(w, 'ok')));
  const DN: Record<string, string> = {
    [T('запрос', 'request')]: toks.length + T(' токенов', ' tokens'), [T('фильтр', 'filter')]: flagged.length ? T('вырезано: ', 'cut: ') + flagged.length : T('проверено', 'passed'),
    [T('контекст', 'context')]: T('контекст собран', 'context built'), [T('модель', 'model')]: hits.length ? T('связей: ', 'links: ') + hits.length : T('связей нет', 'no links'),
    [T('проверка вызова', 'call check')]: T('вызов разрешён', 'call allowed'), [T('инструмент', 'tool')]: T('выполнено', 'done'), [T('результат', 'result')]: T('добавлено', 'added'),
    [T('черновик', 'draft')]: T('черновик готов', 'draft ready'), [T('гардрейл', 'guardrail')]: outRemoved.length ? T('удалено: ', 'removed: ') + outRemoved.length : T('проверено', 'passed'),
    [T('трейс', 'trace')]: T('трейс записан', 'trace saved'), [T('ответ', 'answer')]: T('готово', 'ready')
  };
  st.forEach(x => { x.done = DN[x.short] || T('готово', 'done'); });
  return { steps: st, hits };
}
export { LEX };
