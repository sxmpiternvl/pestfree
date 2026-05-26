# Деплой + правка контактов

## Часть 1. Как поменять контакты / тексты вручную

### Контакты компании (телефоны, email, адрес, соцсети)

Файл: **`apps/web/lib/config.ts`**

```ts
export const CONTACTS = {
  phonePrimary: "+998 99 831 07 80",     // ← как видят люди
  phonePrimaryTel: "+998998310780",      // ← для tel: ссылки (только цифры)
  phoneSecondary: "+998 98 300 10 45",
  phoneSecondaryTel: "+998983001045",
  telegramOwner: "Sxmpiternvl",          // username без @
  telegramBot: "PESTFREEuz",
  email: "pest-free@mail.ru",
  address: "Мирзо-Улугбекский район, ...",
};
```

**Правила формата телефонов:**
- `phonePrimary` — для отображения. С пробелами, с `+`.
- `phonePrimaryTel` — для tel:-ссылки. **Только цифры с `+`, без пробелов.**

После сохранения файла:
- В **dev** (когда запущен `pnpm dev`) — изменения видны через 2-3 сек, обнови вкладку
- В **проде** — после `git push` и автодеплоя Vercel (~1 мин)

### Тексты на сайте (заголовки, описания, кнопки)

3 файла переводов:
- `apps/web/messages/ru.json` — русский
- `apps/web/messages/uz.json` — узбекский
- `apps/web/messages/en.json` — английский

Структура одинаковая во всех трёх — правишь значения справа от `:`.
**Если меняешь ключ в одном файле — обязательно поменяй в остальных двух**, иначе TypeScript ругнётся.

### Тексты в боте

Файл: **`apps/bot/src/i18n.ts`**

Три объекта `ru`, `uz`, `en` — структура такая же как у веба. Правь значения.

После сохранения бот сам перезапустится (если запущен через `pnpm dev`).

### Картинки (логотип, hero, favicon)

| Что | Где | Размер |
|---|---|---|
| Логотип | `apps/web/public/logo.png` | ~150×180px |
| Favicon | `apps/web/app/icon.svg` | 64×64px (SVG) |
| Hero | `apps/web/components/HeroIllustration.tsx` | inline SVG в коде |
| OG-превью | `apps/web/public/og-image.jpg` | 1200×630px (нужно добавить!) |

---

## Часть 2. Деплой

Стек разворачиваем так:

```
┌─────────────────────────────────────────────────────────────┐
│  Vercel       — apps/web (Next.js)        — БЕСПЛАТНО       │
│  Railway      — apps/api + apps/bot + БД  — ~$5-10/мес      │
│  Namecheap    — домен pest-free.uz         — ~$20/год        │
└─────────────────────────────────────────────────────────────┘
```

### Шаг 0. GitHub репозиторий

Без этого деплой не запустить.

```bash
cd /Users/sss/Documents/ai
git init   # если ещё не сделан
git add .
git commit -m "Initial commit"
```

Создай новый репо на github.com → дай ему имя (например `pest-free`) → следуй инструкциям GitHub:
```bash
git remote add origin https://github.com/USERNAME/pest-free.git
git branch -M main
git push -u origin main
```

⚠️ **Проверь что `.env` НЕ закоммитился** (он в `.gitignore`, но проверь: `git ls-files | grep env`).

---

### Шаг 1. Деплой веба → Vercel

1. https://vercel.com → войди через GitHub
2. **Add New → Project** → выбери репо `pest-free`
3. На экране настроек:
   - **Framework Preset:** Next.js (автоопределится)
   - **Root Directory:** `apps/web` ← **важно**
   - **Build Command:** оставь по умолчанию
   - **Install Command:** `pnpm install` (если автоопределит — норм)
4. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = (пока пусто — добавишь после шага 2)
   ```
5. **Deploy** → жди ~2 минуты
6. Получишь URL вида `pest-free.vercel.app` → открой, проверь что сайт работает (форма пока в stub-режиме без API)

---

### Шаг 2. Деплой API + бота → Railway

1. https://railway.app → войди через GitHub → **New Project → Deploy from GitHub** → выбери репо

2. **Добавь PostgreSQL:** в проекте → **+ New → Database → Postgres** → создастся за 30 сек.

3. **Сервис для API:**
   - **+ New → GitHub Repo → pest-free** (тот же репо)
   - Settings → **Root Directory:** `apps/api`
   - Settings → **Build Command:** `pnpm install && pnpm prisma generate && pnpm build`
   - Settings → **Start Command:** `pnpm prisma migrate deploy && node dist/main.js`
   - Settings → **Watch Paths:** `apps/api/**`
   - **Variables** (Settings → Variables):
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}    ← ссылка на БД одной кнопкой "Add Reference"
     PORT=3001
     WEB_ORIGIN=https://pest-free.vercel.app    ← URL Vercel из шага 1
     BOT_TOKEN=<твой токен>
     OWNER_CHAT_ID=-5299276967                  ← твоя группа
     ```
   - **Networking → Generate Domain** → получишь URL `api-XXX.up.railway.app`

4. **Сервис для бота:**
   - **+ New → GitHub Repo → pest-free** (тот же репо ещё раз)
   - Settings → **Root Directory:** `apps/bot`
   - Settings → **Build Command:** `pnpm install && pnpm build`
   - Settings → **Start Command:** `node dist/main.js`
   - Settings → **Watch Paths:** `apps/bot/**`
   - **Variables:**
     ```
     BOT_TOKEN=<тот же токен>
     BOT_USERNAME=PESTFREEuz
     API_BASE_URL=https://api-XXX.up.railway.app    ← URL API из пункта 3
     ```
   - Боту домен НЕ нужен (он только polling делает).

---

### Шаг 3. Связать веб с API

Вернись в **Vercel** → твой проект → **Settings → Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://api-XXX.up.railway.app
```

Затем **Deployments → последний → ⋯ → Redeploy** (чтобы переменная подхватилась).

После этого форма на сайте отправляет реальные запросы в API на Railway.

---

### Шаг 4. Домен (когда купишь)

1. Купил `pest-free.uz` (Namecheap / GoDaddy / любой регистратор)
2. В Vercel → **Settings → Domains → Add** → введи `pest-free.uz`
3. Vercel покажет какие DNS-записи добавить у регистратора (обычно 2 строки: A или CNAME)
4. Пропиши их у регистратора → подожди 5-30 минут пока DNS обновятся
5. Vercel сам выпустит SSL-сертификат бесплатно

Также не забудь поменять `SITE.url` в `apps/web/lib/config.ts` на `https://pest-free.uz` — это нужно для SEO (sitemap, OG-теги).

---

## Что после деплоя проверить

| Проверка | Где |
|---|---|
| Сайт открывается | `https://pest-free.vercel.app` (или твой домен) |
| Языки переключаются | `/`, `/uz`, `/en` |
| Форма отправляет — приходит в группу | заполни → жди уведомление |
| Бот отвечает | `/start` в @PESTFREEuz |
| Бот тоже шлёт заявку | пройди мастер |
| Кнопка «Взять в работу» работает | нажми на уведомление |

Если что-то не работает в проде — смотри логи в Railway (Service → **Deployments → View Logs**) и Vercel (**Deployments → последний → View Function Logs**).

---

## Обновление после правки

После любых правок в коде:

```bash
git add .
git commit -m "что изменил"
git push
```

Vercel и Railway **автоматически** ребилдят и редеплоят при push в main. Никаких кнопок жать не надо.
