// HTTP → системы. Единственная точка входа для api/[...path].ts.
import { HttpError, type Ctx, type World } from '../ecs/core';
import { resolveUser, clampInt } from '../systems/_shared';
import * as content from '../systems/content';
import * as pulse from '../systems/pulse';
import { search } from '../systems/search';
import * as auth from '../systems/auth';
import * as user from '../systems/user';
import { health } from '../systems/health';

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
const cached = (data: unknown, seconds: number) => json(data, 200, { 'cache-control': `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=${seconds * 4}` });
const body = async (req: Request) => { try { return (await req.json()) as Record<string, unknown>; } catch { return {}; } };

const TAGS: Record<string, string> = { glossary: 'term', research: 'research', incidents: 'incident', benchmarks: 'benchmark' };

export async function handle(req: Request, w: World): Promise<Response> {
  const url = new URL(req.url);
  const p = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '').split('/').filter(Boolean);
  const q = url.searchParams, m = req.method;
  if (m !== 'GET' && m !== 'HEAD') {
    const origin = req.headers.get('origin');
    if (origin && origin !== url.origin) return json({ error: 'Чужой origin' }, 403);
    if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json({ error: 'Ожидается application/json' }, 415);
  }
  const ctx: Ctx = { user: await resolveUser(w, req), request: req };
  try {
    const [a, b, c] = p;
    if (a === 'health' && m === 'GET') return json(await health.run(w, undefined, ctx));
    if (a && a in TAGS && m === 'GET') {
      const tag = TAGS[a];
      if (!b) return cached(await content.listEntries.run(w, { tag, domain: q.get('domain'), topic: q.get('topic'), year: q.get('year'), kind: q.get('kind') }, ctx), 300);
      if (b === 'facets') return cached(await content.facets.run(w, { tag }, ctx), 300);
      return cached(await content.getEntry.run(w, { tag, key: decodeURIComponent(b) }, ctx), 300);
    }
    if (a === 'atlas' && b === 'recent' && m === 'GET') return cached(await content.recent.run(w, { limit: clampInt(q.get('limit'), 10, 1, 50) }, ctx), 300);
    if (a === 'search' && m === 'GET') return cached(await search.run(w, { q: q.get('q'), tag: q.get('tag'), limit: clampInt(q.get('limit'), 20, 1, 50) }, ctx), 300);
    if (a === 'pulse' && m === 'GET') {
      if (b === 'counts') return cached(await pulse.counts.run(w, { days: clampInt(q.get('days'), 14, 1, 365) }, ctx), 300);
      return cached(await pulse.feed.run(w, { q: q.get('q'), persona: q.get('persona'), from: q.get('from'), to: q.get('to'), before: Number(q.get('before')) || null, limit: clampInt(q.get('limit'), 60, 1, 120) }, ctx), 120);
    }
    if (a === 'auth' && m === 'POST') {
      if (b === 'register') { const r = await auth.register.run(w, await body(req), ctx); return json({ user: r.user }, 201, { 'set-cookie': r.cookie }); }
      if (b === 'login') { const r = await auth.login.run(w, await body(req), ctx); return json({ user: r.user }, 200, { 'set-cookie': r.cookie }); }
      if (b === 'logout') { const r = await auth.logout.run(w, undefined, ctx); return json({ ok: true }, 200, { 'set-cookie': r.cookie }); }
    }
    if (a === 'me') {
      if (m === 'GET') return json(await auth.me.run(w, undefined, ctx));
      if (m === 'DELETE') { const r = await auth.deleteMe.run(w, undefined, ctx); return json({ ok: true }, 200, { 'set-cookie': r.cookie }); }
    }
    if (a === 'favorites') {
      if (m === 'GET') return json(await user.listFavorites.run(w, undefined, ctx));
      if (m === 'POST') return json(await user.addFavorite.run(w, await body(req), ctx), 201);
      if (m === 'DELETE') return json(await user.removeFavorite.run(w, { uid: q.get('uid') }, ctx));
    }
    if (a === 'progress') {
      if (m === 'GET') return json(await user.getProgress.run(w, undefined, ctx));
      if (m === 'PUT') return json(await user.setProgress.run(w, await body(req), ctx));
    }
    void c;
    return json({ error: 'Нет такого маршрута' }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'Ошибка сервера' }, 500);
  }
}
