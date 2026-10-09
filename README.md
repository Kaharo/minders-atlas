# minders atlas

Интерактивная карта того, как устроены ИИ-системы, и ежедневный Пульс отрасли.
Фронтенд: React + Vite + TypeScript по Feature-Sliced Design. Бэкенд: Vercel Functions + Turso (libSQL), Entity Component System.

```
src/                      фронтенд (FSD)
  app/                    точка входа, роутер, провайдеры (локаль, сессия, избранное), глобальные стили
  pages/                  atlas (карта: glossary · research · incidents · benchmarks) · glossary (список) · pulse · about · not-found
  widgets/                arch-map (canvas-движок карты + «Где помещается») · prompt-bar (запрос, шаги, активированные записи) · learn-panel · atlas-list · model-card · model-picker · timeline-band · record-card · header · pulse-feed · pulse-sidebar · personas-modal · term-card
  features/               auth · favorites · atlas-filter · trace (учебный режим: запрос → шаги по карте) · persona-filter · pulse-search · glossary-filter
  entities/               atlas-entry (записи, глиф, курс) · model (реестр, архитектура, онтология, поддержка блоков) · benchmark · persona · pulse-item · term · user
  shared/                 api-клиент · i18n · ui-кит · lib · config

api/[...path].ts          единственная функция Vercel; импортирует бандл server-dist/handler.mjs
server-dist/              бандл сервера, собирается в npm run build (scripts/bundle-api.mjs), в Git не хранится
server/                   бэкенд (ECS)
  ecs/core.ts             World, defineComponent, defineSystem, query, nest
  components/             компоненты = таблицы c_* (Title, Date, Domain, Persona, Credential…)
  systems/                content · pulse · search · auth · user · health
  http/handler.ts         точка входа бандла
  http/router.ts          HTTP → система
  storage/turso.ts        Turso, а без переменных — libSQL в памяти, засеянный из JSON при старте
migrations/0001_ecs.mjs   схема: entity + таблица на каждый компонент + FTS5
migrations/0002_relations.mjs  связи между записями (c_relation)
scripts/lib/seed-world    посев мира из JSON (общий для Turso и режима без базы)
scripts/                  validate-data · migrate · seed · build-pulse · reflect · draft-entries · update-scores
data/*.json               источник правды для контента (правится через PR); relations.json — связи между записями
atlas-pulse.json          последняя сборка Пульса; pulse-archive/ — по дням
personas/*.md             профили семи персон
.github/workflows/        pulse · drafts · scores · check · db
```

## Как устроен ECS

- **Сущность**: строка в `entity` с внешним `uid` (`term:cot`, `pulse:hn123`, `user:a@b.c`).
- **Компонент**: отдельная таблица `c_<name>` с ключом `entity`. Одиночные (`c_title`, `c_date`) и многозначные (`c_alias`, `c_persona`, `c_favorite`).
- **Архетип**: набор тегов в `c_tag` (`term`, `research`, `incident`, `benchmark`, `pulse`, `digest`, `user`, `session`).
- **Система**: чистая функция `(world, input, ctx) => output`, зарегистрированная через `defineSystem`. Роутер только парсит HTTP и вызывает системы.
- **Запрос**: `world.query({ tag, with: [Title, Domain], optional: [DateYM], where })` собирает JOIN по таблицам компонентов; `nest()` возвращает строки в виде `{ title: {ru,en}, date: {...} }`.

Добавить поле записи = добавить компонент: таблица в новой миграции, `defineComponent` в `server/components`, строка в `scripts/lib/seed-world.mjs`.

**Два режима хранения.** Без `TURSO_DATABASE_URL` функция поднимает libSQL в памяти и засевает его из `data/*.json` и `atlas-pulse.json` при холодном старте: весь контент и поиск работают сразу после пуша, аккаунты живут до перезапуска функции. С Turso всё сохраняется, плюс копится архив Пульса.

## API

| Метод | Путь | Система |
|---|---|---|
| GET | `/api/health` | health |
| GET | `/api/glossary?domain=&topic=&year=&kind=` · `/api/glossary/facets` · `/api/glossary/:key` | content.list · facets · get |
| GET | `/api/research`, `/api/incidents`, `/api/benchmarks` (те же подмаршруты) | content.* |
| GET | `/api/atlas/recent?limit=` | content.recent |
| GET | `/api/search?q=&tag=` | search |
| GET | `/api/pulse?q=&persona=&from=&to=&before=&limit=` · `/api/pulse/counts` | pulse.feed · counts |
| POST | `/api/auth/register` · `login` · `logout` | auth.* |
| GET / DELETE | `/api/me` | auth.me · delete |
| GET / POST / DELETE | `/api/favorites` | favorites.* |
| GET / PUT | `/api/progress` | progress.* |

## Запуск

См. **[DEPLOY.md](DEPLOY.md)**: пуш → Vercel; база Turso по желанию.

Локально:
```bash
npm i
cp .env.example .env            # или оставить file:local.db
npm run db:local                # миграции + посев в local.db
npm run dev:api                 # vercel dev на :3000 (нужен vercel login)
npm run dev                     # vite на :5173, /api проксируется на :3000
```

## Ежедневная работа

| Что | Как | Участие |
|---|---|---|
| Деплой | пуш в `main` → Vercel собирает и выкладывает сам; PR получает превью | нет |
| Пульс | каждый день 09:00 Астана: `pulse` → коммит → `db` заливает в Turso | нет |
| Термины, исследования, инциденты | PR от `drafts` по понедельникам → Merge → `db` | ~10 мин/нед |
| Рейтинги | PR от `scores` по средам → Merge | ~2 мин |
| Правка записи | `data/*.json` → PR; `check` проверяет структуру, типы и сборку | по необходимости |
| Новое поле или таблица | `migrations/0002_*.sql` + компонент + seed → пуш | редко |

## Соответствие прототипу
Перенесено всё, что было включено в v13: карта с пятью разделами, учебный режим «запрос → шаги», выбор модели по странам, рейтинги и место модели, связи между записями, курс, Пульс, О проекте. Стартовый экран с уровнями и панель «С чего начать» в v13 были отключены и не переносились.
