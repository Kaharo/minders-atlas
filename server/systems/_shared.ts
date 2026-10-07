// Общие помощники систем: сессии, пароли, FTS-запросы.
import { HttpError, type Ctx, type Entity, type World } from '../ecs/core';
import { Session, Credential, TAG } from '../components';

const enc = new TextEncoder();
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const unhex = (s: string) => new Uint8Array((s.match(/../g) ?? []).map(h => parseInt(h, 16)));

export const SESSION_DAYS = 30;

export const sha256 = async (s: string) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

export async function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 }, key, 256);
  return { hash: hex(bits), salt: hex(salt) };
}
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export const cookieFor = (token: string, maxAge: number) => `sid=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
export const clearCookie = cookieFor('', 0);
export const sessionToken = (req: Request) => req.headers.get('cookie')?.match(/(?:^|;\s*)sid=([a-f0-9]{64})/)?.[1] ?? null;

/** Создаёт сущность-сессию с компонентом Session; возвращает cookie. */
export async function openSession(w: World, user: Entity): Promise<string> {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const maxAge = SESSION_DAYS * 86400;
  await w.run('DELETE FROM entity WHERE id IN (SELECT entity FROM c_session WHERE user = ? AND expires_at < ?)', [user, Date.now()]);
  const e = await w.spawn(`session:${token.slice(0, 16)}`, [TAG.session]);
  await w.set(e, Session, { token_hash: await sha256(token), user, expires_at: Date.now() + maxAge * 1000 });
  return cookieFor(token, maxAge);
}

/** Пользователь по cookie запроса, иначе null. */
export async function resolveUser(w: World, req: Request): Promise<Entity | null> {
  const token = sessionToken(req);
  if (!token) return null;
  const r = await w.run('SELECT user FROM c_session WHERE token_hash = ? AND expires_at > ?', [await sha256(token), Date.now()]);
  return r.rows.length ? Number(r.rows[0].user) : null;
}

export const requireUser = (ctx: Ctx): Entity => { if (ctx.user == null) throw new HttpError(401, 'Нужно войти'); return ctx.user; };

export async function publicUser(w: World, e: Entity) {
  const r = await w.run('SELECT en.id, en.created_at, c.email, n.name FROM entity en JOIN c_credential c ON c.entity = en.id LEFT JOIN c_name n ON n.entity = en.id WHERE en.id = ?', [e]);
  return r.rows[0] ?? null;
}

export const validEmail = (s: unknown): s is string => typeof s === 'string' && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
export const normEmail = (s: string) => s.trim().toLowerCase();
export { Credential };

/** Поисковая строка → безопасное FTS5-выражение: каждое слово как префикс. */
export const ftsQuery = (s: string | null | undefined) =>
  (s ?? '').toLowerCase().match(/[\p{L}\p{N}]+/gu)?.slice(0, 8).map(t => `"${t}"*`).join(' ') ?? '';

export const clampInt = (v: string | null, def: number, min: number, max: number) => {
  const n = parseInt(v ?? '', 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : def;
};
