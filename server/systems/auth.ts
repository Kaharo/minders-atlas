// Аккаунты: регистрация, вход, выход, профиль.
import { defineSystem, fail, type Entity } from '../ecs/core';
import { Credential, Name, TAG } from '../components';
import { hashPassword, safeEqual, openSession, publicUser, validEmail, normEmail, sessionToken, sha256, clearCookie, requireUser } from './_shared';

const DUMMY_SALT = '0'.repeat(32);
export interface AuthOut { user: unknown; cookie: string }

export const register = defineSystem<{ email?: unknown; password?: unknown; name?: unknown }, AuthOut>('auth.register', async (w, i) => {
  if (!validEmail(i.email)) fail(400, 'Некорректный email');
  if (typeof i.password !== 'string' || i.password.length < 8 || i.password.length > 200) fail(400, 'Пароль от 8 до 200 символов');
  const email = normEmail(i.email as string);
  const dup = await w.run('SELECT 1 FROM c_credential WHERE email = ?', [email]);
  if (dup.rows.length) fail(409, 'Этот email уже зарегистрирован');
  const { hash, salt } = await hashPassword(i.password as string);
  const e: Entity = await w.spawn(`user:${email}`, [TAG.user]);
  await w.batch([
    w.setStmt(e, Credential, { email, pass_hash: hash, pass_salt: salt }),
    w.setStmt(e, Name, { name: typeof i.name === 'string' ? i.name.trim().slice(0, 80) || null : null })
  ]);
  return { user: await publicUser(w, e), cookie: await openSession(w, e) };
});

export const login = defineSystem<{ email?: unknown; password?: unknown }, AuthOut>('auth.login', async (w, i) => {
  if (!validEmail(i.email) || typeof i.password !== 'string') fail(400, 'Введите email и пароль');
  const r = await w.run('SELECT entity, pass_hash, pass_salt FROM c_credential WHERE email = ?', [normEmail(i.email as string)]);
  const row = r.rows[0];
  const { hash } = await hashPassword(i.password as string, (row?.pass_salt as string) ?? DUMMY_SALT);   // одинаковое время ответа
  if (!row || !safeEqual(hash, String(row.pass_hash))) fail(401, 'Неверный email или пароль');
  const e = Number(row!.entity);
  return { user: await publicUser(w, e), cookie: await openSession(w, e) };
});

export const logout = defineSystem<void, { ok: true; cookie: string }>('auth.logout', async (w, _i, ctx) => {
  const token = sessionToken(ctx.request);
  if (token) await w.run('DELETE FROM entity WHERE id IN (SELECT entity FROM c_session WHERE token_hash = ?)', [await sha256(token)]);
  return { ok: true, cookie: clearCookie };
});

export const me = defineSystem<void, { user: unknown }>('auth.me', async (w, _i, ctx) => ({ user: ctx.user == null ? null : await publicUser(w, ctx.user) }));

/** Удаление аккаунта: сессии, избранное и прогресс уходят каскадом. */
export const deleteMe = defineSystem<void, { ok: true; cookie: string }>('auth.delete', async (w, _i, ctx) => {
  await w.despawn(requireUser(ctx));
  return { ok: true, cookie: clearCookie };
});
