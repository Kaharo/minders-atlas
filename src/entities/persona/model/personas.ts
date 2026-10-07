// Семь редакционных линз Пульса. Цвет и описание на сайте; вопрос и голос в personas/*.md.
export type PersonaId = 'orbix' | 'apex' | 'meridian' | 'lexicon' | 'archive' | 'gaya' | 'prism';

export interface Persona {
  id: PersonaId;
  name: string;
  color: string;      // цвет точки
  ink: string;        // цвет текста
  domain: [string, string];
  desc: [string, string];
  question: [string, string];
  focus: [string, string];
}

export const SPECTRUM = 'conic-gradient(#3b5bfd, #ef4444, #f59e0b, #a855f7, #ec4899, #10b981, #3b5bfd)';

export const PERSONAS: Persona[] = [
  { id: 'orbix', name: 'ORBIX', color: '#3b5bfd', ink: '#2f45c9', domain: ['Технологические системы', 'Technological Systems'], desc: ['Замечает системные технологические сдвиги и смену парадигм.', 'Detects systemic technological shifts and paradigm changes.'], question: ['Что изменилось в самой технологии и надолго ли это?', 'What changed in the technology itself, and will it last?'], focus: ['модели и архитектуры · агенты · инфраструктура · открытые веса', 'models and architectures · agents · infrastructure · open weights'] },
  { id: 'apex', name: 'APEX', color: '#ef4444', ink: '#b91c1c', domain: ['Власть и стратегия', 'Power & Strategy'], desc: ['Разбирает расстановку сил, контроль и геополитическую конкуренцию.', 'Analyzes power dynamics, control, and geopolitical competition.'], question: ['Кто получает контроль и кто его теряет?', 'Who gains control and who loses it?'], focus: ['регулирование · госполитика · экспорт чипов · суды и антимонопольные дела', 'regulation · state policy · chip exports · courts and antitrust'] },
  { id: 'meridian', name: 'MERIDIAN', color: '#f59e0b', ink: '#a16207', domain: ['Экономические системы', 'Economic Systems'], desc: ['Следит за трансформацией экономики и влиянием на отрасли.', 'Tracks economic transformation and industry impact.'], question: ['Кто платит, кто зарабатывает и что это меняет в отраслях?', 'Who pays, who earns, and what changes for industries?'], focus: ['инвестиции · рынки и цены · рабочие места · сделки', 'investment · markets and pricing · jobs · deals'] },
  { id: 'lexicon', name: 'LEXICON', color: '#a855f7', ink: '#7e22ce', domain: ['Научный фронтир', 'Scientific Frontier'], desc: ['Интерпретирует научные прорывы и сигналы из исследований.', 'Interprets scientific breakthroughs and research signals.'], question: ['Что действительно показано, а что пока гипотеза?', 'What has actually been shown, and what is still a hypothesis?'], focus: ['статьи и препринты · эксперименты · открытия · методы оценки', 'papers and preprints · experiments · discoveries · evaluation methods'] },
  { id: 'archive', name: 'ARCHIVE', color: '#ec4899', ink: '#be185d', domain: ['Культура и общество', 'Culture & Society'], desc: ['Наблюдает, как общество и культура адаптируются к технологиям.', 'Observes societal and cultural adaptation to technology.'], question: ['Как меняются привычки, работа, язык и культура?', 'How are habits, work, language and culture changing?'], focus: ['образование · искусство и авторское право · приватность · медиа', 'education · art and copyright · privacy · media'] },
  { id: 'gaya', name: 'GAYA', color: '#10b981', ink: '#047857', domain: ['Планетарные системы', 'Planetary Systems'], desc: ['Изучает изменения в окружающей среде и планетарных системах.', 'Examines environmental and planetary system changes.'], question: ['Во что это обходится планете?', 'What does it cost the planet?'], focus: ['энергия · дата-центры · вода · климат', 'energy · data centres · water · climate'] },
  { id: 'prism', name: 'PRISM', color: SPECTRUM, ink: '#0b0b14', domain: ['Синтез знаний', 'Knowledge Synthesis'], desc: ['Собирает сюжеты, которые касаются сразу нескольких областей.', 'Collects stories that span several domains.'], question: ['Где сюжеты разных областей сходятся в один?', 'Where do stories from different domains meet?'], focus: ['сюжеты на стыке двух и более областей · общий итог дня', 'stories that span two or more domains · the day in one view'] }
];

export const PERSONA_BY_ID = Object.fromEntries(PERSONAS.map(p => [p.id, p])) as Record<PersonaId, Persona>;
export const isPersonaId = (s: string | null | undefined): s is PersonaId => !!s && s in PERSONA_BY_ID;

/** Порядок приоритета при выборе главной персоны новости: узкие темы раньше общей ORBIX. */
const PRIMARY_ORDER: PersonaId[] = ['apex', 'meridian', 'gaya', 'archive', 'lexicon', 'orbix'];
export const primaryPersona = (ps: string[]): PersonaId => PRIMARY_ORDER.find(k => ps.includes(k)) ?? 'orbix';
/** PRISM берёт сюжеты, у которых две и более узкие темы. */
export const isCross = (ps: string[]) => ps.filter(k => k !== 'orbix').length >= 2;
export const inPersona = (ps: string[], id: PersonaId) => (id === 'prism' ? isCross(ps) : ps.includes(id));
