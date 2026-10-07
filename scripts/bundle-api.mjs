// Собирает весь сервер (ECS + данные JSON) в один самодостаточный ES-модуль для функции Vercel.
// Сборщик Vercel для api/ не разрешает относительные импорты без расширений, поэтому функция импортирует только этот файл.
import { build } from 'esbuild';

await build({
  entryPoints: ['server/http/handler.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'server-dist/handler.mjs',
  external: ['@libsql/client'],          // нативная библиотека остаётся в node_modules
  logLevel: 'info'
});
