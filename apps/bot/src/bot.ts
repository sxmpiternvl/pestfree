import { Telegraf, Scenes, session } from 'telegraf';
import { leadScene } from './scenes/lead.scene';
import type { BotContext } from './types';

export function createBot(token: string): Telegraf<BotContext> {
  const bot = new Telegraf<BotContext>(token);

  const stage = new Scenes.Stage<BotContext>([leadScene]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.start((ctx) =>
    ctx.reply(
      '👋 Добро пожаловать в *PEST-FREE*\\!\n\n' +
      'Мы занимаемся профессиональной дезинфекцией, дезинсекцией и дератизацией\\.\n\n' +
      'Нажмите кнопку ниже, чтобы оставить заявку\\.',
      {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          keyboard: [[{ text: '📋 Оставить заявку' }]],
          resize_keyboard: true,
        },
      },
    ),
  );

  bot.hears('📋 Оставить заявку', (ctx) => ctx.scene.enter('lead'));

  bot.command('request', (ctx) => ctx.scene.enter('lead'));

  return bot;
}
