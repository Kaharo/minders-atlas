import type { BlockId, TermKind } from './types';

/** Пять блоков карты и их цвета. Порядок = порядок на карте. */
export const BLOCKS: { id: BlockId; label: [string, string]; sub: [string, string]; color: string; hue: number }[] = [
  { id: 'd_models', label: ['Модель', 'Model'], sub: ['обучение · рассуждение · архитектуры', 'training · reasoning · architectures'], color: 'hsl(228,72%,52%)', hue: 228 },
  { id: 'd_context', label: ['Сборка контекста', 'Context assembly'], sub: ['промпт · RAG · память', 'prompt · RAG · memory'], color: 'hsl(192,72%,52%)', hue: 192 },
  { id: 'd_runtime', label: ['Инструменты', 'Tools'], sub: ['вызовы · агенты', 'calls · agents'], color: 'hsl(268,72%,52%)', hue: 268 },
  { id: 'd_quality', label: ['Наблюдаемость', 'Observability'], sub: ['оценка · трейсинг', 'evals · tracing'], color: 'hsl(300,72%,52%)', hue: 300 },
  { id: 'd_trust', label: ['Защита', 'Guards'], sub: ['фильтр ввода · проверка вызовов', 'input filter · call checks'], color: 'hsl(150,72%,52%)', hue: 150 }
];
/** Описание домена (из онтологии v2) */
export const BLOCK_DEF: Record<BlockId, [string, string]> = {
  d_models: ['Что такое модель, как она рассуждает и как её адаптируют — знания о моделях, а не рейтинг.', 'What a model is, how it reasons and how it is adapted — knowledge about models, not a ranking.'],
  d_context: ['Инструкции, контекстное окно, поиск и память: всё, что модель читает.', 'Instructions, the context window, retrieval and memory: everything the model reads.'],
  d_runtime: ['Инструменты, протоколы и циклы агентов: где предложенный вызов становится реальным действием.', 'Tools, protocols and agent loops: where proposed calls become real effects.'],
  d_quality: ['Оценка, наблюдаемость, сервинг и стоимость: как система живёт во времени.', 'Evaluation, observability, serving and cost: running the system over time.'],
  d_trust: ['Защита, ограждения и ответственность: полномочия, вред и кто за что отвечает.', 'Security, guardrails and accountability: authority, harm and who answers for what.']
};
export const BLOCK_NAME: Record<BlockId, [string, string]> = { d_models: ['Модели', 'Models'], d_context: ['Контекст и данные', 'Context & Data'], d_runtime: ['Действия и исполнение', 'Actions & Runtime'], d_quality: ['Качество и эксплуатация', 'Quality & Operations'], d_trust: ['Люди и доверие', 'People & Trust'] };
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
