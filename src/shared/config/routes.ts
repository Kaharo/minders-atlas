export const ROUTES = {
  glossary: '/glossary',
  pulse: '/pulse',
  about: '/about',
  term: (key: string) => `/glossary/${encodeURIComponent(key)}`
} as const;
