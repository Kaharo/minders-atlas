import { ATLAS_MODELS } from './lib/registry';

export interface ModelInfo { id: string; name: string; orgName: string; arch: string; par: string; act: string; ctx: string; lic?: string; region?: string; s?: string[]; tags?: string[]; family?: string }

/** Реестр моделей из прототипа, типизированная обёртка. */
export const models: ModelInfo[] = ATLAS_MODELS.models;
export const modelById = (id: string): ModelInfo | undefined => ATLAS_MODELS.byModel[id];
export const DEFAULT_MODEL = 'gpt-oss-120b';
/** Быстрый выбор: шесть моделей разного размера */
export const PRESETS: [string, string][] = [['gemma-3-4b', 'Gemma 3 4B'], ['granite-3-3-8b', 'Granite 8B'], ['gpt-oss-120b', 'gpt-oss-120b'], ['llama-3-3-70b', 'Llama 3.3 70B'], ['deepseek-v3-1', 'DeepSeek V3.1'], ['kimi-k2', 'Kimi K2 · 1T']];
export const modelsByOrg = (): { org: string; items: ModelInfo[] }[] => {
  const m = new Map<string, ModelInfo[]>();
  models.forEach(x => m.set(x.orgName, [...(m.get(x.orgName) ?? []), x]));
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([org, items]) => ({ org, items }));
};
