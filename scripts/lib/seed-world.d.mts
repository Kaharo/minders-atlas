export interface SeedSource { glossary?: unknown[]; research?: unknown[]; incidents?: unknown[]; scores?: unknown; relations?: unknown[]; pulse?: unknown[] }
export interface SeedStats { terms: number; research: number; incidents: number; benchmarks: number; results: number; pulse: number; digests: number }
export function seedWorld(db: { batch(stmts: { sql: string; args: (string | number | null)[] }[], mode: 'write'): Promise<unknown>; execute(sql: string): Promise<unknown> }, src: SeedSource): Promise<SeedStats>;
