// Единственная функция Vercel. Импортирует только готовый бандл server-dist/handler.mjs (собирается в npm run build).
import { handler } from '../server-dist/handler.mjs';

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
