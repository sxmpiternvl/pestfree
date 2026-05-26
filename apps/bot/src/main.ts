import dotenv from 'dotenv';
dotenv.config();

import { Telegraf } from 'telegraf';
import { createBot } from './bot';
import { dict, LANGS } from './i18n';
import type { BotContext } from './types';

async function registerCommandsMenu(bot: Telegraf<BotContext>): Promise<void> {
  // Default set (fallback for users whose Telegram client locale isn't in LANGS)
  const def = dict('ru');
  await bot.telegram.setMyCommands([
    { command: 'start', description: def.cmdStart },
    { command: 'request', description: def.cmdRequest },
    { command: 'lang', description: def.cmdLang },
    { command: 'cancel', description: def.cmdCancel },
  ]);

  // Per-locale commands — Telegram picks the one matching user's client locale.
  for (const lang of LANGS) {
    const t = dict(lang);
    await bot.telegram.setMyCommands(
      [
        { command: 'start', description: t.cmdStart },
        { command: 'request', description: t.cmdRequest },
        { command: 'lang', description: t.cmdLang },
        { command: 'cancel', description: t.cmdCancel },
      ],
      { language_code: lang },
    );
  }
}

const { BOT_TOKEN, BOT_USERNAME, API_BASE_URL } = process.env;

if (!BOT_TOKEN) throw new Error('BOT_TOKEN is required');
if (!API_BASE_URL) throw new Error('API_BASE_URL is required');

const bot = createBot(BOT_TOKEN);

// Register the commands menu (Telegram's "/" menu next to the chat input).
// Fire-and-forget — doesn't need to block startup.
registerCommandsMenu(bot)
  .then(() => console.log('[bot] commands menu registered (RU/UZ/EN)'))
  .catch((err) => console.error('[bot] failed to register commands:', err));

bot.launch().then(() => {
  console.log(`[bot] started — @${BOT_USERNAME ?? 'unknown'}`);
  console.log(`[bot] API → ${API_BASE_URL}`);
  console.log('[bot] lead notifications are sent by the API');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
