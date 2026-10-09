// @ts-nocheck
// Расчёт «где помещается модель»: перенесён из _rvRaw прототипа, без UI.
export function hwInfo(scene) {
  const A = scene.A, m = scene.M && scene.M.byModel[scene.mid];
  if (!A || !m) return null;
  const hw = scene._hw();
  const n = (x) => Number(x).toLocaleString('ru-RU'), pl = (k, f) => { const a = k % 10, b = k % 100; return a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && (b < 12 || b > 14) ? f[1] : f[2]; };
  const tiers = [['Телефон', '8–12 ГБ ОЗУ · до ~5B в 4 бит'], ['Ноутбук', '32 ГБ · до ~30B в 4 бит'], ['1 GPU', 'H100 80 ГБ'], ['Сервер', '8 × H100 · 640 ГБ'], ['Кластер', 'несколько серверов']];
  const kv1k = A.kvBytesTok * 1000 / 1048576, perW = hw.native / hw.G;
  const fr = /frontier/.test((m.tags || []).join(' ') + ' ' + (m.s || []).join(' ')) || (m.cost || 0) >= 2;
  const depT = (m.dep || []).map(x => ({ api: 'API', cloud: 'облако', weights: 'веса', selfhost: 'свой сервер', finetune: 'дообучение', edge: 'устройство', local: 'локально' })[x] || x).join(' · ');
  const head = hw.hid ? (fr ? 'Скорее всего, кластер серверов' : 'Серверы провайдера') : hw.tier === 0 ? 'Помещается в телефон' : hw.tier === 1 ? 'Помещается в ноутбук' : hw.tier === 2 ? 'Одна GPU H100' : hw.tier === 3 ? 'Один сервер · ' + hw.G + ' GPU' : hw.nodes + ' ' + pl(hw.nodes, ['сервер', 'сервера', 'серверов']) + ' · ' + hw.G + ' GPU';
  const sub = hw.hid ? m.orgName + ' не публикует размер модели. Веса закрыты, модель работает только в дата-центрах провайдера и доступна через API, поэтому на своём железе её не запустить. ' + (fr ? 'Модели этого класса обычно занимают сотни гигабайт и обслуживаются группами серверов с GPU или TPU.' : 'Облегчённые версии обычно меньше флагманов, но точный объём неизвестен.') + (m.ctx && m.ctx !== '—' ? ' Длинный контекст (' + m.ctx + ') дополнительно требует памяти под KV-кэш.' : '') : hw.tier <= 1 ? 'В 4 битах веса занимают ' + n(Math.round(hw.q4 * 10) / 10) + ' ГБ. Остаток памяти уходит под KV-кэш.' : hw.G === 1 ? 'Веса занимают ' + n(Math.round(hw.native)) + ' из 80 ГБ одной H100. Остаток — под KV-кэш.' : 'Веса делятся между GPU примерно поровну: по ' + n(Math.round(perW)) + ' ГБ на карту из 80. Остаток — под KV-кэш.';
  const caps = [12, 32, 80, 640, Infinity], capT = ['12 ГБ', '32 ГБ', '80 ГБ', '640 ГБ', '> 640'];
  const eT = hw.hid ? (fr ? 4 : 3) : hw.tier;
  const ladder = tiers.map(([name], i) => ({ name, cap: hw.hid && i === eT ? 'оценка' : capT[i], tip: tiers[i][1], on: i === eT, ok: i >= eT, hid: hw.hid }));
  const wPct = Math.min(100, perW / 80 * 100);
  const servers = hw.hid || hw.tier < 3 ? [] : Array.from({ length: Math.min(hw.nodes, 3) }, (_, si) => { const used = Math.max(0, Math.min(8, hw.G - si * 8)); return { name: (hw.nodes > 1 ? 'Сервер ' + (si + 1) : 'Сервер') + ' · 8 × H100', sub: used + ' из 8 GPU', gpus: Array.from({ length: 8 }, (_, gi) => ({ used: gi < used, w: wPct, tip: gi < used ? 'GPU ' + (si * 8 + gi + 1) + ' · веса ' + n(Math.round(perW)) + ' из 80 ГБ' : 'не занята' })) }; });
  const devTier = !hw.hid && hw.tier <= 2, devGB = hw.tier <= 1 ? hw.q4 : hw.native, devCapN = caps[hw.tier] || 80;
  const dev = devTier ? { name: ['Телефон', 'Ноутбук', 'H100'][hw.tier], cap: n(Math.round(devGB * 10) / 10) + ' из ' + devCapN + ' ГБ' + (hw.tier <= 1 ? ' · 4 бит' : ''), w: Math.min(100, devGB / devCapN * 100) } : null;
  const rows = hw.hid
    ? [['Параметры', 'не раскрыты'], ['Веса', m.lic && /open|apache|mit/i.test(m.lic) ? 'открыты' : 'закрыты'], ['Доступ', depT || 'API'], ['Контекст', m.ctx || '—'], ['Запуск на своём железе', 'нет']]
    : [['Веса в ' + A.qn, n(Math.round(hw.native)) + ' ГБ'], ['В 4 битах', n(Math.round(hw.q4 * 10) / 10) + ' ГБ'], ['На одну GPU', hw.G > 1 ? n(Math.round(perW)) + ' из 80 ГБ' : '—'], ['KV-кэш на 1 000 ток.', (kv1k < 10 ? n(Math.round(kv1k * 10) / 10) : n(Math.round(kv1k))) + ' МБ']];
  const facts = [['Параметры', ru(m.par)], ['Активных', m.act === '—' ? 'все' : ru(m.act)], ['Слоёв', n(A.L)], ['d_model', n(A.d)], ['Головы Q / KV', A.H + ' / ' + A.KV], ['Эксперты', A.E ? A.E + ' → ' + A.k : 'плотная'], ['Словарь', n(A.V)]];
  const srcNote = A.src === 'cfg' ? '' : A.src === 'est' ? 'Конфиг не опубликован: слои и размерности оценены по размеру модели.' : 'Архитектура не раскрыта: форма условная.';
  return { head, sub, ladder, servers, more: hw.nodes > 3 && servers.length ? 'и ещё ' + (hw.nodes - 3) + ' ' + pl(hw.nodes - 3, ['сервер', 'сервера', 'серверов']) : '', dev, rows, facts, hid: hw.hid, srcNote, model: { id: m.id, name: m.name, org: m.orgName, arch: m.arch, par: ru(m.par), act: m.act, ctx: m.ctx, lic: m.lic, s: m.s || [], tags: m.tags || [] } };
}
const ru = (v) => ({ undisclosed: 'не раскрыто', compact: 'компактная' })[v] || v;
