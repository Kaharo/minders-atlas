// @ts-nocheck
// Уровень поддержки пяти блоков карты выбранной моделью: 2 встроено, 1 частично, 0 нет в модели, -1 не зависит от модели.
// Перенос _states() прототипа и адаптера v2 (узлы онтологии → пять доменов).
import { ATLAS_RAW } from './ontology';
import { ATLAS_MODELS } from './registry';

const TOPIC_TO = {
    reasoning: 'd_models', tuning: 'd_models', alignment: 'd_models',
    patterns: 'd_context', structured: 'd_context', window: 'd_context', assembly: 'd_context',
    rag: 'd_context', embeddings: 'd_context', kg: 'd_context',
    shortterm: 'd_context', longterm: 'd_context', episodic: 'd_context',
    fncalling: 'd_runtime', protocols: 'd_runtime', productivity: 'd_runtime',
    loops: 'd_runtime', multiagent: 'd_runtime', autonomy: 'd_runtime',
    benchmarks: 'd_quality', judge: 'd_quality', regression: 'd_quality',
    tracing: 'd_quality', monitoring: 'd_quality', feedback: 'd_quality',
    serving: 'd_quality', scaling: 'd_quality', modelops: 'd_quality',
    latency: 'd_quality', cost: 'd_quality', caching: 'd_quality',
    inputf: 'd_trust', outputv: 'd_trust', threats: 'd_trust', access: 'd_trust', compliance: 'd_trust'
  };
const OLD_TO = { prompting: 'd_context', context: 'd_context', knowledge: 'd_context', memory: 'd_context', tools: 'd_runtime', agents: 'd_runtime', evaluation: 'd_quality', observability: 'd_quality', deployment: 'd_quality', optimization: 'd_quality', guardrails: 'd_trust', security: 'd_trust' };
export const ORDER = ['d_models', 'd_context', 'd_runtime', 'd_quality', 'd_trust'];

let atlas = null;
function v2() {
  if (atlas) return atlas;
  const A = ATLAS_RAW, oldKeys = A.order.slice();
  const nodes = A.nodes.filter(n => oldKeys.indexOf(n.id) < 0).map(n => ({ ...n }));
  ORDER.forEach((k, i) => nodes.splice(1 + i, 0, { id: k, parent: 'llm', level: 1, domain: k, m: 0 }));
  nodes.forEach(n => { if (oldKeys.indexOf(n.parent) >= 0) n.parent = TOPIC_TO[n.id] || OLD_TO[n.parent]; });
  const byId = {}; nodes.forEach(n => { byId[n.id] = n; });
  nodes.forEach(n => {
    if (n.id === 'llm') return;
    let lvl = 0, p = n;
    while (p && p.parent && lvl < 50) { lvl++; p = byId[p.parent]; }
    n.level = lvl;
    p = n; let gg = 0; while (p && p.level > 1 && gg++ < 50) p = byId[p.parent];
    n.domain = p && p.id !== 'llm' ? p.id : null;
  });
  return (atlas = { nodes, byId, order: ORDER });
}

export interface Support { level: Record<string, number>; pct: Record<string, number>; key: string }

export function supportFor(modelId: string): Support {
  const A = v2(), m = ATLAS_MODELS.byModel[modelId];
  const st = ATLAS_MODELS.stateMap(m, A);
  const level = {}, pct = {};
  ORDER.forEach(k => {
    const v = A.nodes.filter(nd => nd.domain === k && nd.level > 1).map(nd => st[nd.id]);
    const strong = v.filter(q => q === 2).length, some = v.filter(q => q === 1).length;
    level[k] = st[k] === -1 ? -1 : !v.length ? 0 : strong / v.length > 0.45 ? 2 : (strong + some) / v.length > 0.35 ? 1 : 0;
    pct[k] = v.length ? Math.round((strong + some * 0.5) / v.length * 100) : 0;
  });
  return { level, pct, key: ORDER.map(k => k + ':' + (k === 'd_models' ? 2 : level[k] > 0 ? level[k] : 0)).join(',') };
}
