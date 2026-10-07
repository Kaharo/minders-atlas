// Единственная Vercel Function: все /api/* маршруты идут через роутер ECS-систем.
import { handle } from '../server/http/router';
import { world } from '../server/storage/turso';

const run = async (req: Request) => {
  try { return await handle(req, await world()); }
  catch (e) { return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { 'content-type': 'application/json' } }); }
};
export const GET = run, POST = run, PUT = run, DELETE = run;
