export const ROUTES = {
  atlas: (section: 'glossary' | 'research' | 'incidents' | 'benchmarks', key?: string) => `/atlas/${section}${key ? '/' + encodeURIComponent(key) : ''}`,
  glossary: '/glossary',
  pulse: '/pulse',
  about: '/about',
  term: (key: string) => `/glossary/${encodeURIComponent(key)}`
} as const;
