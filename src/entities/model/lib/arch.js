// @ts-nocheck
// minders Atlas — архитектурные параметры моделей для вкладки «Обучение».
// L слоёв, d скрытая размерность, H голов Q, KV голов K/V, hd размер головы, V словарь, E экспертов, k активных,
// q байт на параметр при типичном инференсе. src: 'cfg' — опубликованный config.json / техотчёт.
export const ATLAS_ARCH = (function () {
  var C = {
    'gpt-oss-120b':    { L: 36, d: 2880, H: 64, KV: 8, hd: 64, V: 201088, E: 128, k: 4, q: 0.53, qn: 'MXFP4', att: 'GQA, чередование окна 128 и полного внимания' },
    'gpt-oss-20b':     { L: 24, d: 2880, H: 64, KV: 8, hd: 64, V: 201088, E: 32, k: 4, q: 0.53, qn: 'MXFP4', att: 'GQA, чередование окна 128 и полного внимания' },
    'gemma-3-27b':     { L: 62, d: 5376, H: 32, KV: 16, hd: 128, V: 262144, att: 'GQA, 5 локальных : 1 глобальный слой' },
    'gemma-3-4b':      { L: 34, d: 2560, H: 8, KV: 4, hd: 256, V: 262144, att: 'GQA, 5 локальных : 1 глобальный слой' },
    'llama-4-maverick':{ L: 48, d: 5120, H: 40, KV: 8, hd: 128, V: 202048, E: 128, k: 1, shared: 1, att: 'GQA, iRoPE' },
    'llama-4-scout':   { L: 48, d: 5120, H: 40, KV: 8, hd: 128, V: 202048, E: 16, k: 1, shared: 1, att: 'GQA, iRoPE' },
    'llama-3-3-70b':   { L: 80, d: 8192, H: 64, KV: 8, hd: 128, V: 128256, att: 'GQA' },
    'phi-4':           { L: 40, d: 5120, H: 40, KV: 10, hd: 128, V: 100352, att: 'GQA' },
    'nemotron-ultra':  { L: 162, d: 16384, H: 128, KV: 8, hd: 128, V: 128256, att: 'GQA, часть блоков удалена NAS' },
    'command-a':       { L: 64, d: 12288, H: 96, KV: 8, hd: 128, V: 256000, att: 'GQA, 3 локальных : 1 глобальный' },
    'jamba-1-6-large': { L: 72, d: 8192, H: 64, KV: 8, hd: 128, V: 65536, E: 16, k: 2, att: 'Mamba + attention 7 : 1' },
    'granite-3-3-8b':  { L: 40, d: 4096, H: 32, KV: 8, hd: 128, V: 49159, att: 'GQA' },
    'dbrx-instruct':   { L: 40, d: 6144, H: 48, KV: 8, hd: 128, V: 100352, E: 16, k: 4, att: 'GQA' },
    'olmo-2-32b':      { L: 64, d: 5120, H: 40, KV: 8, hd: 128, V: 100352, att: 'GQA' },
    'qwen3-235b-a22b': { L: 94, d: 4096, H: 64, KV: 4, hd: 128, V: 151936, E: 128, k: 8, att: 'GQA' },
    'qwen3-32b':       { L: 64, d: 5120, H: 64, KV: 8, hd: 128, V: 151936, att: 'GQA' },
    'deepseek-v3-1':   { L: 61, d: 7168, H: 128, KV: 1, hd: 576, V: 129280, E: 256, k: 8, shared: 1, q: 1, qn: 'FP8', att: 'MLA: общий латентный K/V 512 + 64' },
    'deepseek-r1':     { L: 61, d: 7168, H: 128, KV: 1, hd: 576, V: 129280, E: 256, k: 8, shared: 1, q: 1, qn: 'FP8', att: 'MLA: общий латентный K/V 512 + 64' },
    'kimi-k2':         { L: 61, d: 7168, H: 64, KV: 1, hd: 576, V: 163840, E: 384, k: 8, shared: 1, q: 1, qn: 'FP8', att: 'MLA' },
    'glm-4-5':         { L: 92, d: 5120, H: 96, KV: 8, hd: 128, V: 151552, E: 160, k: 8, shared: 1, att: 'GQA' },
    'minimax-m1':      { L: 80, d: 6144, H: 64, KV: 8, hd: 128, V: 200064, E: 32, k: 2, att: 'lightning attention 7 : 1 softmax' },
    'ernie-4-5':       { L: 54, d: 8192, H: 64, KV: 8, hd: 128, V: 103424, E: 64, k: 8, att: 'GQA' },
    'hunyuan-a13b':    { L: 32, d: 4096, H: 32, KV: 8, hd: 128, V: 128167, E: 64, k: 8, shared: 1, att: 'GQA' },
    'mimo-7b-rl':      { L: 36, d: 4096, H: 32, KV: 8, hd: 128, V: 151680, att: 'GQA' },
    'mistral-large-2': { L: 88, d: 12288, H: 96, KV: 8, hd: 128, V: 32768, att: 'GQA' },
    'devstral-small':  { L: 40, d: 5120, H: 32, KV: 8, hd: 128, V: 131072, att: 'GQA' },
    'sarvam-m':        { L: 40, d: 5120, H: 32, KV: 8, hd: 128, V: 131072, att: 'GQA' },
    'falcon-3-10b':    { L: 40, d: 3072, H: 12, KV: 4, hd: 256, V: 131072, att: 'GQA' },
    'exaone-4-0':      { L: 64, d: 5120, H: 40, KV: 8, hd: 128, V: 102400, att: 'GQA, 3 локальных : 1 глобальный' },
    'apertus-70b':     { L: 80, d: 8192, H: 64, KV: 8, hd: 128, V: 131072, att: 'GQA' },
    'apertus-8b':      { L: 32, d: 4096, H: 32, KV: 8, hd: 128, V: 131072, att: 'GQA' },
    'kazllm-8b':       { L: 32, d: 4096, H: 32, KV: 8, hd: 128, V: 128256, att: 'GQA' },
    'taide-llama3-8b': { L: 32, d: 4096, H: 32, KV: 8, hd: 128, V: 128256, att: 'GQA' },
    'sealion-v3':      { L: 80, d: 8192, H: 64, KV: 8, hd: 128, V: 128256, att: 'GQA' },
    'sakana-tinyswallow': { L: 28, d: 1536, H: 12, KV: 2, hd: 128, V: 151936, att: 'GQA' }
  };
  function parseB(s) {
    var m = String(s || '').match(/([\d.]+)\s*([BT])/i);
    if (!m) return null;
    return parseFloat(m[1]) * (m[2].toUpperCase() === 'T' ? 1000 : 1);
  }
  // оценка по классу размера для моделей без опубликованного конфига
  function estimate(pB, moe) {
    var t = pB <= 2 ? [24, 2048, 16, 8] : pB <= 9 ? [32, 4096, 32, 8] : pB <= 16 ? [40, 5120, 40, 8] : pB <= 40 ? [64, 5120, 40, 8]
      : pB <= 80 ? [80, 8192, 64, 8] : pB <= 150 ? [88, 12288, 96, 8] : [61, 7168, 64, 8];
    var o = { L: t[0], d: t[1], H: t[2], KV: t[3], hd: 128, V: 128000, att: 'GQA (типично)' };
    if (moe) { o.E = 64; o.k = 8; }
    return o;
  }
  function get(m) {
    if (!m) return null;
    var pB = parseB(m.par), aB = parseB(m.act), moe = /moe/i.test(m.arch || '');
    var c = C[m.id], src = 'cfg';
    if (!c) {
      if (pB) { c = estimate(aB && moe ? Math.max(pB / 4, aB * 2) : pB, moe); src = 'est'; }
      else { c = { L: 80, d: 8192, H: 64, KV: 8, hd: 128, V: 200000, att: '—' }; if (moe) { c.E = 64; c.k = 8; } src = 'hidden'; }
    }
    var o = {}; for (var k in c) o[k] = c[k];
    o.src = src; o.pB = pB; o.aB = aB || pB; o.moe = !!o.E;
    o.q = o.q || 2; o.qn = o.qn || 'BF16';
    o.kvBytesTok = 2 * o.L * o.KV * o.hd * 2;
    if (o.hd === 576) o.kvBytesTok = o.L * 576 * 2; // MLA: один латентный вектор на слой
    return o;
  }
  return { get: get, parseB: parseB, table: C };
})();
