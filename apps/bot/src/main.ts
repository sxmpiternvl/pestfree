import dotenv from 'dotenv';
dotenv.config();

import { createBot } from './bot';

const { BOT_TOKEN, BOT_USERNAME, OWNER_CHAT_ID, API_BASE_URL } = process.env;

if (!BOT_TOKEN) throw new Error('BOT_TOKEN is required');
if (!OWNER_CHAT_ID) throw new Error('OWNER_CHAT_ID is required');
if (!API_BASE_URL) throw new Error('API_BASE_URL is required');

const bot = createBot(BOT_TOKEN);

bot.launch().then(() => {
  console.log(`[bot] started — @${BOT_USERNAME ?? 'unknown'}`);
  console.log(`[bot] API → ${API_BASE_URL}`);
  console.log(`[bot] owner chat → ${OWNER_CHAT_ID}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
