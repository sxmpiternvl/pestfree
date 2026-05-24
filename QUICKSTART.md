# Быстрый старт

## Что установить один раз

1. [Node.js 20+](https://nodejs.org) — скачай LTS-версию
2. [pnpm](https://pnpm.io/installation) — менеджер пакетов:
   ```bash
   npm install -g pnpm
   ```
3. [PostgreSQL](https://www.postgresql.org/download/) — база данных (только для API)

---

## Запуск веб-сайта

```bash
cd /Users/sss/Documents/ai/apps/web
pnpm install
pnpm dev
```

Открой в браузере: **http://localhost:3000**

> Форма работает без API — просто симулирует отправку.

---

## Запуск Telegram-бота

### 1. Создай бота в Telegram

1. Открой [@BotFather](https://t.me/BotFather) в Telegram
2. Отправь `/newbot`
3. Придумай имя и username (username должен заканчиваться на `bot`)
4. Скопируй токен вида `7123456789:AAH...`

### 2. Настрой `.env`

```bash
cd /Users/sss/Documents/ai/apps/bot
cp ../../.env.example .env
```

Открой файл `apps/bot/.env` и заполни:

```env
BOT_TOKEN=7123456789:AAH...        # токен от BotFather
BOT_USERNAME=pestfree_bot          # username без @
OWNER_CHAT_ID=123456789            # твой Telegram ID (см. ниже)
API_BASE_URL=http://localhost:3001 # пока оставь так
```

**Как узнать свой Telegram ID:**
Напиши [@userinfobot](https://t.me/userinfobot) в Telegram — он пришлёт твой ID.

### 3. Запусти

```bash
pnpm install
pnpm dev
```

Найди своего бота в Telegram по username и отправь `/start`.

---

## Запуск API (нужна для реальной отправки заявок)

### 1. Создай базу данных PostgreSQL

```bash
createdb pestfree
```

### 2. Настрой `.env`

```bash
cd /Users/sss/Documents/ai/apps/api
cp ../../.env.example .env
```

Заполни `apps/api/.env`:

```env
DATABASE_URL=postgresql://localhost:5432/pestfree
PORT=3001
```

### 3. Запусти миграции и сервер

```bash
pnpm install
pnpm prisma:migrate
pnpm dev
```

API доступна на: **http://localhost:3001**

---

## Запустить всё сразу

```bash
cd /Users/sss/Documents/ai
pnpm dev
```

---

## Деплой на сервер (когда будешь готов)

### Что куда деплоить

| Приложение | Куда деплоить | Что нужно |
|------------|---------------|-----------|
| **Web** (`apps/web`) | [Vercel](https://vercel.com) — бесплатно | Просто подключи GitHub репо |
| **API** (`apps/api`) | VPS или [Railway](https://railway.app) | Node.js + PostgreSQL |
| **Bot** (`apps/bot`) | Тот же VPS что и API | Node.js |

### Порядок деплоя

1. **Сначала** — поднять API + БД на сервере
2. **Потом** — задеплоить Web, прописать `NEXT_PUBLIC_API_URL=https://твой-апи.com`
3. **Потом** — запустить бота, прописать `API_BASE_URL=https://твой-апи.com`

### Переменные окружения на сервере

**API:**
```
DATABASE_URL=postgresql://user:pass@host:5432/pestfree
PORT=3001
```

**Bot:**
```
BOT_TOKEN=...
BOT_USERNAME=...
OWNER_CHAT_ID=...
API_BASE_URL=https://твой-апи.com
```

**Web (Vercel):**
```
NEXT_PUBLIC_API_URL=https://твой-апи.com
```
