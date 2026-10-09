// Курс minders: уровни и модули. Перенос atlas-course.js.
export const COURSE = {
  levels: {
    use: { ru: 'Использовать', en: 'Use', prog: 'AI Essentials' },
    build: { ru: 'Проектировать', en: 'Build', prog: 'AI Professional' },
    scale: { ru: 'Внедрять', en: 'Scale', prog: 'AI Transformation' }
  },
  modules: {
    basics: { level: 'use', ru: 'Основы современного AI', en: 'Modern AI basics', url: 'https://minders.kz/learning.html#use/basics' },
    prompt: { level: 'use', ru: 'Prompt & Context Engineering', en: 'Prompt & Context Engineering', url: 'https://minders.kz/learning.html#use/prompt-context' },
    verify: { level: 'use', ru: 'AI для исследований и аналитики: проверка результатов', en: 'AI for research: checking results', url: 'https://minders.kz/learning.html#use/research' },
    context: { level: 'build', ru: 'Advanced Context Engineering', en: 'Advanced Context Engineering', url: 'https://minders.kz/learning.html#build/context' },
    rag: { level: 'build', ru: 'Knowledge & RAG', en: 'Knowledge & RAG', url: 'https://minders.kz/learning.html#build/rag' },
    agents: { level: 'build', ru: 'AI Workflows и AI Agents', en: 'AI Workflows and AI Agents', url: 'https://minders.kz/learning.html#build/agents' },
    evals: { level: 'build', ru: 'AI Quality & Evals', en: 'AI Quality & Evals', url: 'https://minders.kz/learning.html#build/evals' },
    governance: { level: 'scale', ru: 'AI Governance', en: 'AI Governance', url: 'https://minders.kz/learning.html#scale/governance' },
    scale: { level: 'scale', ru: 'From Experiment to Scale', en: 'From Experiment to Scale', url: 'https://minders.kz/learning.html#scale/experiment-to-scale' },
    landscape: { level: 'scale', ru: 'AI Landscape', en: 'AI Landscape', url: 'https://minders.kz/learning.html#scale/landscape' }
  } as Record<string, { level: 'use' | 'build' | 'scale'; ru: string; en: string; url: string }>,
  byDomain: { d_models: 'basics', d_context: 'prompt', d_runtime: 'agents', d_quality: 'evals', d_trust: 'governance' } as Record<string, string>
};
export const courseFor = (course: string | null, domain: string | null) => {
  const mk = COURSE.modules[course ?? ''] ?? COURSE.modules[COURSE.byDomain[domain ?? ''] ?? ''];
  return mk ? { ...mk, lvl: COURSE.levels[mk.level] } : null;
};
