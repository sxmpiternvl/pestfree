# @monorepo/api — NestJS API

REST API для приёма заявок от веб-формы и Telegram-бота. Сохраняет в PostgreSQL и уведомляет владельца в Telegram.

## Стек

- **NestJS 10** + ConfigModule
- **Prisma 5** — ORM
- **PostgreSQL** — БД
- **class-validator** + **class-transformer** — валидация DTO

## Структура

```
apps/api/
├── prisma/
│   └── schema.prisma           — схема БД
└── src/
    ├── main.ts                 — bootstrap + CORS + ValidationPipe
    ├── app.module.ts           — корневой модуль
    ├── prisma/                 — PrismaService (глобальный)
    ├── health/                 — GET /health
    ├── leads/                  — POST /leads
    │   ├── leads.controller.ts
    │   ├── leads.service.ts
    │   └── dto/create-lead.dto.ts
    └── notifications/
        └── telegram.service.ts — fetch на api.telegram.org/sendMessage
```

## Модели данных

### Lead

| Поле         | Тип            | Обяз. | Описание |
|--------------|----------------|-------|----------|
| `id`         | UUID           | ✓     | первичный ключ |
| `fullName`   | String         | ✓     | ФИО клиента |
| `phone`      | String         | ✓     | номер телефона |
| `address`    | String?        |       | адрес (бот собирает, веб — нет) |
| `service`    | ServiceType?   |       | тип услуги (бот собирает) |
| `objectType` | ObjectType?    |       | тип объекта (веб собирает) |
| `comment`    | String?        |       | комментарий |
| `source`     | Source         | ✓     | WEBSITE \| TELEGRAM |
| `status`     | LeadStatus     | ✓     | NEW \| CONTACTED \| CLOSED (default: NEW) |
| `locale`     | String?        |       | язык клиента (ru/uz/en) |
| `createdAt`  | DateTime       | ✓     | время создания |
| `updatedAt`  | DateTime       | ✓     | обновляется автоматически |

**Enums:**
- `ServiceType`: `DISINFECTION` `DISINSECTION` `DERATIZATION` `OUTDOOR` `CHLORINE` `SUBSCRIPTION`
- `ObjectType`: `APARTMENT` `HOUSE` `BUSINESS` `OTHER`
- `Source`: `WEBSITE` `TELEGRAM`
- `LeadStatus`: `NEW` `CONTACTED` `CLOSED`

## Эндпоинты

| Метод | Путь      | Описание                            |
|-------|-----------|-------------------------------------|
| GET   | `/health` | проверка доступности (для k8s/балансера) |
| POST  | `/leads`  | создать заявку → 201 + уведомление в Telegram |

### POST /leads

```json
{
  "fullName": "Иван Иванов",
  "phone": "+998 90 123 45 67",
  "objectType": "APARTMENT",
  "comment": "3 комнаты, тараканы на кухне",
  "source": "WEBSITE",
  "locale": "ru"
}
```

Ответ:
```json
{ "id": "f7e4e0c0-...", "ok": true }
```

После сохранения API отправляет в Telegram владельцу форматированное сообщение со всеми полями.

## Переменные окружения

| Переменная       | Обяз. | Описание                                         |
|------------------|-------|--------------------------------------------------|
| `DATABASE_URL`   | ✓     | PostgreSQL connection string                     |
| `PORT`           |       | порт HTTP (default: 3001)                        |
| `WEB_ORIGIN`     |       | CORS origin(s), comma-sep. (default: localhost:3000) |
| `BOT_TOKEN`      |       | токен бота от @BotFather (для уведомлений)       |
| `OWNER_CHAT_ID`  |       | Telegram ID владельца — получает заявки          |

> Без `BOT_TOKEN`/`OWNER_CHAT_ID` API работает, но уведомления не шлются (warning в логах).

## Команды

```bash
pnpm dev                # hot-reload через ts-node-dev
pnpm prisma:migrate     # применить миграции (dev режим)
pnpm prisma:generate    # перегенерировать Prisma client
pnpm build              # компиляция в dist/
pnpm start              # production-режим
```
