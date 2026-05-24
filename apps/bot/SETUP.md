# Telegram Bot Setup Guide

## 1. Create a bot with BotFather

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Follow the prompts:
   - Enter a display name, e.g. `PEST-FREE`
   - Enter a username (must end in `bot`), e.g. `pestfree_bot`
4. BotFather replies with your **bot token**:
   ```
   Use this token to access the HTTP API:
   7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   Copy it — you'll need it in the next step.

---

## 2. Create apps/bot/.env

```bash
cp ../../.env.example .env
```

Fill in the values:

```env
BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BOT_USERNAME=pestfree_bot
OWNER_CHAT_ID=          # see step 3
API_BASE_URL=http://localhost:3001
```

> `.env` is gitignored. Never commit it.

---

## 3. Get your OWNER_CHAT_ID

The bot sends a notification to this chat every time a new lead is submitted.

**Easiest way:**

1. Open Telegram and search for **@userinfobot**
2. Send `/start`
3. It replies with your ID, e.g.:
   ```
   Your user id: 123456789
   ```
4. Paste that number as `OWNER_CHAT_ID` in `.env`

**Alternative — via the bot itself:**

1. Start the bot locally (step 4 below)
2. Send any message to your bot
3. In the terminal, temporarily add `console.log(ctx.from?.id)` to `main.ts` to print the ID

---

## 4. Run the bot locally

Make sure the API is running first — the bot submits leads to it.

```bash
# Terminal 1: start the API (requires a running PostgreSQL)
pnpm --filter @monorepo/api dev

# Terminal 2: start the bot
pnpm --filter @monorepo/bot dev
```

Expected output:

```
[bot] started — @pestfree_bot
[bot] API → http://localhost:3001
[bot] owner chat → 123456789
```

Open Telegram, find your bot by username, and send `/start`.

---

## 5. Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `BOT_TOKEN` | ✅ | Token from @BotFather |
| `BOT_USERNAME` | ✅ | Bot username without `@` |
| `OWNER_CHAT_ID` | ✅ | Your Telegram user ID — receives lead notifications |
| `API_BASE_URL` | ✅ | Base URL of the NestJS API, e.g. `http://localhost:3001` |

---

## 6. Set bot commands (optional)

In BotFather, send `/setcommands` → select your bot → paste:

```
start - Запустить бота
request - Оставить заявку
cancel - Отменить текущую заявку
```
