# @monorepo/api — NestJS API

REST API для сохранения заявок (лидов) в PostgreSQL.

## Стек

- **NestJS 10** — фреймворк
- **Prisma 5** — ORM
- **PostgreSQL** — база данных
- **ts-node-dev** — hot-reload в dev-режиме

## Структура

```
apps/api/
├── prisma/
│   └── schema.prisma      — схема БД
└── src/
    ├── main.ts            — точка входа, слушает PORT (default: 3001)
    ├── app.module.ts      — корневой модуль
    ├── prisma/
    │   ├── prisma.module.ts
    │   └── prisma.service.ts
    └── health/
        ├── health.module.ts
        └── health.controller.ts   — GET /health
```

## Модели данных

### Lead

| Поле        | Тип          | Описание                          |
|-------------|--------------|-----------------------------------|
| `id`        | UUID         | Первичный ключ (gen_random_uuid)  |
| `fullName`  | String       | ФИО клиента                       |
| `phone`     | String       | Номер телефона                    |
| `address`   | String       | Адрес объекта                     |
| `service`   | ServiceType  | Тип услуги (см. ниже)             |
| `comment`   | String?      | Комментарий (опционально)         |
| `source`    | Source       | Откуда пришла заявка              |
| `createdAt` | DateTime     | Время создания                    |

**ServiceType:** `DISINFECTION` | `DISINSECTION` | `DERATIZATION`

**Source:** `WEBSITE` | `TELEGRAM`

## Эндпоинты

| Метод | Путь      | Описание                  |
|-------|-----------|---------------------------|
| GET   | `/health` | Проверка доступности API  |
| POST  | `/leads`  | Создать новую заявку      |

### POST /leads

Тело запроса (JSON):

```json
{
  "fullName": "Иван Иванов",
  "phone": "+7 999 123-45-67",
  "address": "Москва, ул. Ленина, д. 1",
  "service": "DISINFECTION",
  "comment": "Квартира 3 комнаты",
  "source": "WEBSITE"
}
```

## Переменные окружения

| Переменная     | Обязательно | Описание                           |
|----------------|-------------|------------------------------------|
| `DATABASE_URL` | ✅           | PostgreSQL connection string       |
| `PORT`         | —           | Порт HTTP сервера (default: 3001)  |

## Команды

```bash
# Разработка (hot-reload)
pnpm dev

# Миграция БД
pnpm prisma:migrate

# Регенерация Prisma Client
pnpm prisma:generate

# Сборка
pnpm build

# Запуск production-сборки
pnpm start
```
