# data/

Единственный источник данных атласа. Правьте эти файлы, не `atlas-db.js`: он собирается из них при каждом деплое (`node scripts/build-data.mjs`), и сборка остановится, если запись неполная.

| Файл | Раздел | Ключевые поля |
|---|---|---|
| `incidents.json` | Инциденты | id, domain (prompting…security), kind, sev 1–3, date ГГГГ-ММ, where, title, text, response, sources |
| `glossary.json` | Термины | id, domain (d_models…d_trust), kind technique/product/standard, date, ru{where,title,text,response}, en{…}, sources |
| `research.json` | Исследования | как glossary + course (модуль программы), status draft/supported |
| `scores.json` | Рейтинги | checked, benchmarks[], results{бенчмарк: {модель: значение}} |

Чтобы поправить запись, отредактируйте файл прямо на GitHub (карандаш → Commit). Через минуту изменение будет на сайте.
