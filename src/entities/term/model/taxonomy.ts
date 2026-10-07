import type { BlockId, TermKind } from './types';

/** Пять блоков карты и их цвета. Порядок = порядок на карте. */
export const BLOCKS: { id: BlockId; label: [string, string]; sub: [string, string]; color: string }[] = [
  { id: 'd_models', label: ['Модель', 'Model'], sub: ['обучение · рассуждение · архитектуры', 'training · reasoning · architectures'], color: 'var(--c-models)' },
  { id: 'd_context', label: ['Сборка контекста', 'Context assembly'], sub: ['промпт · RAG · память', 'prompt · RAG · memory'], color: 'var(--c-context)' },
  { id: 'd_runtime', label: ['Инструменты', 'Tools'], sub: ['вызовы · агенты', 'calls · agents'], color: 'var(--c-runtime)' },
  { id: 'd_quality', label: ['Наблюдаемость', 'Observability'], sub: ['оценка · трейсинг', 'evals · tracing'], color: 'var(--c-quality)' },
  { id: 'd_trust', label: ['Защита', 'Guards'], sub: ['фильтр ввода · проверка вызовов', 'input filter · call checks'], color: 'var(--c-trust)' }
];
export const BLOCK_BY_ID = Object.fromEntries(BLOCKS.map(b => [b.id, b])) as Record<BlockId, typeof BLOCKS[number]>;

/** Шестнадцать подтем */
export const TOPICS: Record<string, [string, string]> = {
  foundations: ['Основы ИИ и МО', 'AI & ML foundations'], architectures: ['Архитектуры', 'Architectures'], reasoning: ['Рассуждение', 'Reasoning'], training: ['Обучение и настройка', 'Training & alignment'],
  prompting: ['Промпты и контекст', 'Prompting & context'], retrieval: ['Поиск и знания', 'Retrieval & knowledge'], memory: ['Память и состояние', 'Memory & state'],
  agents: ['Агенты и планирование', 'Agents & planning'], orchestration: ['Оркестрация и инструменты', 'Orchestration & tools'], protocols: ['Протоколы и среда', 'Protocols & runtime'],
  evaluation: ['Оценка', 'Evaluation'], observability: ['Наблюдаемость', 'Observability'], inference: ['Инференс и сервинг', 'Inference & serving'],
  interaction: ['Человек и ИИ', 'Human–AI interaction'], security: ['Защита', 'Security'], governance: ['Управление и подотчётность', 'Governance']
};

export const KINDS: Record<TermKind, [string, string]> = { technique: ['техника', 'technique'], product: ['продукт', 'product'], standard: ['стандарт', 'standard'], concept: ['понятие', 'concept'] };

export const FIRST_YEAR = 2017;
