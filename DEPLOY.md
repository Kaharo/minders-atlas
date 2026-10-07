# Запуск за три шага

```
пуш в GitHub ──► Vercel собирает и выкладывает сайт сам (Git-интеграция)
без базы:      данные из data/*.json и atlas-pulse.json внутри функции · всё читается, аккаунты не сохраняются
с Turso:       + аккаунты, избранное, прогресс, полный архив Пульса
```

## 1. Загрузить код в GitHub
Репозиторий `Kaharo/minders-atlas` уже создан и пустой. Любой из способов:

- **GitHub Desktop:** File → Add Local Repository → выбрать распакованную папку → Publish.
- **Терминал:**
  ```bash
  git init -b main && git add . && git commit -m "atlas v2"
  git remote add origin https://github.com/Kaharo/minders-atlas.git && git push -u origin main
  ```
- Через сайт (Add file → Upload files) не подходит: скрытая папка `.github` с ботами не загрузится.

## 2. Сказать мне «запушил»
Я привяжу репозиторий к Vercel. Дальше каждый пуш в `main` сам становится новой версией сайта, каждый PR получает превью-ссылку. Через пару минут сайт откроется по адресу вида `minders-atlas.vercel.app`; `/api/health` покажет `storage: memory`.

## 3. База (когда понадобятся аккаунты)
Vercel → проект → Storage → Marketplace → **Turso** → Create. Vercel сам создаст базу и положит `TURSO_DATABASE_URL` и `TURSO_AUTH_TOKEN` в переменные проекта. Затем:
- GitHub → Settings → Secrets → добавить те же две переменные (нужны боту `db`, который заливает контент после каждого Merge).
- Actions → `db` → Run workflow: применит схему и зальёт данные. `/api/health` покажет `storage: turso`.

## Боты (по желанию)
Секреты GitHub `ANTHROPIC_API_KEY` и `AA_API_KEY` включают ежедневный Пульс с разборами персон, еженедельные черновики записей и сверку рейтингов. Без них сайт работает, Пульс пустой.
Settings → Actions → General → Workflow permissions: Read and write + «Allow GitHub Actions to create and approve pull requests».

## Домен
Не берите `.kz`: сайт на `.kz` обязан физически размещаться в Казахстане. Начните с `*.vercel.app`, потом `.com` или `.ai` через Vercel → Domains.

## Если что-то сломалось
- Сайт открывается, а данных нет: Vercel → Deployments → лог функции `api/[...path]`.
- Упал `db`: истёк токен Turso, пересоздайте в Vercel → Storage.
- Откат: Vercel → Deployments → Promote to Production у предыдущего.
