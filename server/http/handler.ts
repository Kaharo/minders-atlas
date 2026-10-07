// Точка входа серверного бандла: один обработчик на все /api/*.
import { handle } from './router';
import { world } from '../storage/turso';

export async function handler(req: Request): Promise<Response> {
  try { return await handle(req, await world()); }
  catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { 'content-type': 'application/json; charset=utf-8' } });
  }
}
