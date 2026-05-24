# PEST-FREE — Монорепо

Сервис по приёму заявок на дезинфекцию, дезинсекцию и дератизацию.

## Архитектура

```
/
├── apps/
│   ├── api/    — NestJS REST API + Prisma + PostgreSQL
│   ├── bot/    — Telegram-бот на Telegraf (приём заявок)
│   └── web/    — Next.js лендинг с формой заявки
├── package.json
└── pnpm-workspace.yaml
```

## Поток данных

```
Пользователь (Web)      →  POST /leads  →  API  →  PostgreSQL
Пользователь (Telegram) →  Bot сцена    →  API  →  PostgreSQL
                                                  ↓
                                            Уведомление владельцу в Telegram
```

## Быстрый старт

### Требования

- Node.js 20+
- pnpm 8+
- PostgreSQL 14+

### Установка

```bash
pnpm install
```

### Переменные окружения

Скопируйте шаблон и заполните:

```bash
cp .env.example apps/api/.env
cp .env.example apps/bot/.env
```

Минимум для запуска:

| Файл           | Переменная       | Описание                        |
|----------------|------------------|---------------------------------|
| `apps/api/.env`| `DATABASE_URL`   | PostgreSQL connection string    |
| `apps/api/.env`| `PORT`           | Порт API (по умолчанию 3001)    |
| `apps/bot/.env`| `BOT_TOKEN`      | Токен от @BotFather             |
| `apps/bot/.env`| `BOT_USERNAME`   | Username бота без `@`           |
| `apps/bot/.env`| `OWNER_CHAT_ID`  | Ваш Telegram ID для уведомлений |
| `apps/bot/.env`| `API_BASE_URL`   | URL API, напр. `http://localhost:3001` |

### База данных

```bash
pnpm --filter @monorepo/api prisma:migrate
```

### Запуск в режиме разработки

```bash
# Все три приложения параллельно
pnpm dev

# Или по отдельности
pnpm --filter @monorepo/api dev
pnpm --filter @monorepo/bot dev
pnpm --filter @monorepo/web dev
```

## Приложения

| Пакет              | Порт  | Документация               |
|--------------------|-------|----------------------------|
| `@monorepo/api`    | 3001  | [apps/api/README.md](apps/api/README.md) |
| `@monorepo/bot`    | —     | [apps/bot/README.md](apps/bot/README.md) |
| `@monorepo/web`    | 3000  | [apps/web/README.md](apps/web/README.md) |
