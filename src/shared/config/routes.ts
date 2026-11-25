export const ROUTES = {
  atlas: (section: 'glossary' | 'research' | 'incidents' | 'benchmarks', key?: string) => `/atlas/${section}${key ? '/' + encodeURIComponent(key) : ''}`,
  request: '/atlas/request',
  glossary: '/glossary',
  pulse: '/pulse',
  about: '/about',
  term: (key: string) => `/glossary/${encodeURIComponent(key)}`
} as const;
