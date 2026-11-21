// Собирает весь сервер (ECS + данные JSON) в один самодостаточный ES-модуль для функции Vercel.
// Сборщик Vercel для api/ не разрешает относительные импорты без расширений, поэтому функция импортирует только этот файл.
import { build } from 'esbuild';
import { readFile, readdir } from 'node:fs/promises';

// Архив Пульса попадает в бандл целиком: без базы сервер засевает им память при старте.
const archive = [];
try { for (const f of (await readdir('pulse-archive')).filter(f => /^\d{4}-\d{2}\.json$/.test(f)).sort()) archive.push(JSON.parse(await readFile('pulse-archive/' + f, 'utf8'))); } catch { /* архива ещё нет */ }
const pulseArchive = {
  name: 'pulse-archive',
  setup(b) {
    b.onResolve({ filter: /^virtual:pulse-archive$/ }, a => ({ path: a.path, namespace: 'pulse-archive' }));
    b.onLoad({ filter: /.*/, namespace: 'pulse-archive' }, () => ({ contents: JSON.stringify(archive), loader: 'json' }));
  }
};

await build({
  entryPoints: ['server/http/handler.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outfile: 'server-dist/handler.mjs',
  external: ['@libsql/client'],          // нативная библиотека остаётся в node_modules
  plugins: [pulseArchive],
  logLevel: 'info'
});
