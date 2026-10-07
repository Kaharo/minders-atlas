// Все компоненты мира. Имя компонента = суффикс таблицы c_<name>.
import { defineComponent } from '../ecs/core';

export interface Bilingual { ru: string | null; en: string | null }

export const Title = defineComponent<Bilingual>('title', ['ru', 'en']);
export const Text = defineComponent<Bilingual>('text', ['ru', 'en']);
export const Response = defineComponent<Bilingual>('response', ['ru', 'en']);
export const Origin = defineComponent<Bilingual>('origin', ['ru', 'en']);

export const Domain = defineComponent<{ domain: string }>('domain', ['domain']);
export const Kind = defineComponent<{ kind: string }>('kind', ['kind']);
export const Topic = defineComponent<{ topic: string }>('topic', ['topic']);
export const Course = defineComponent<{ course: string }>('course', ['course']);
export const Status = defineComponent<{ status: string }>('status', ['status']);
export const Severity = defineComponent<{ sev: number }>('severity', ['sev']);
export const DateYM = defineComponent<{ ym: string; year: number; month: number | null }>('date', ['ym', 'year', 'month']);
export const Alias = defineComponent<{ alias: string }>('alias', ['alias'], ['alias']);
export const Source = defineComponent<{ n: number; title: string | null; url: string }>('source', ['n', 'title', 'url'], ['n']);

export const Link = defineComponent<{ url: string | null; src: string | null }>('link', ['url', 'src']);
export const Timestamp = defineComponent<{ ts: number }>('timestamp', ['ts']);
export const Score = defineComponent<{ score: number }>('score', ['score']);
export const Persona = defineComponent<{ persona: string }>('persona', ['persona'], ['persona']);
export const Note = defineComponent<{ persona: string; ru: string | null; en: string | null }>('note', ['persona', 'ru', 'en'], ['persona']);
export const Digest = defineComponent<{ persona: string; day: string; ru: string | null; en: string | null }>('digest', ['persona', 'day', 'ru', 'en']);

export const Result = defineComponent<{ model: string; value: number }>('result', ['model', 'value'], ['model']);

export const Credential = defineComponent<{ email: string; pass_hash: string; pass_salt: string }>('credential', ['email', 'pass_hash', 'pass_salt']);
export const Name = defineComponent<{ name: string | null }>('name', ['name']);
export const Session = defineComponent<{ token_hash: string; user: number; expires_at: number }>('session', ['token_hash', 'user', 'expires_at']);
export const Favorite = defineComponent<{ target: number; created_at?: string }>('favorite', ['target'], ['target']);
export const Progress = defineComponent<{ item: string; state: string; updated_at?: string }>('progress', ['item', 'state'], ['item']);

/** Теги-архетипы */
export const TAG = { term: 'term', research: 'research', incident: 'incident', benchmark: 'benchmark', pulse: 'pulse', digest: 'digest', user: 'user', session: 'session' } as const;
export type Tag = typeof TAG[keyof typeof TAG];
export const CONTENT_TAGS: Tag[] = ['term', 'research', 'incident', 'benchmark'];
