import { Telegraf, Scenes, Markup, session } from 'telegraf';
import { leadScene } from './scenes/lead.scene';
import { dict, LANGS, type Lang } from './i18n';
import type { BotContext } from './types';

function languagePickerKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('🇷🇺 Русский', 'lang:ru'),
      Markup.button.callback('🇺🇿 Oʻzbek', 'lang:uz'),
      Markup.button.callback('🇬🇧 English', 'lang:en'),
    ],
  ]);
}

export function createBot(token: string): Telegraf<BotContext> {
  const bot = new Telegraf<BotContext>(token);

  const stage = new Scenes.Stage<BotContext>([leadScene]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.use(async (ctx, next) => {
    if (!ctx.session) ctx.session = {} as BotContext['session'];
    return next();
  });

  bot.start(async (ctx) => {
    // First /start (or after wiping session) — always ask for language.
    if (!ctx.session.lang) {
      await ctx.reply(
        'Выберите язык / Tilni tanlang / Choose language',
        languagePickerKeyboard(),
      );
      return;
    }

    const t = dict(ctx.session.lang);
    await ctx.reply(
      `${t.welcomeTitle}\n\n${t.welcomeText}`,
      {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          keyboard: [[{ text: t.leadButton }]],
          resize_keyboard: true,
        },
      },
    );
  });

  // Manual language switcher (any time)
  bot.command('lang', async (ctx) => {
    await ctx.reply(
      'Выберите язык / Tilni tanlang / Choose language',
      languagePickerKeyboard(),
    );
  });

  bot.action(/^lang:(ru|uz|en)$/, async (ctx) => {
    const newLang = ctx.match[1] as Lang;
    if (!LANGS.includes(newLang)) {
      await ctx.answerCbQuery('?');
      return;
    }
    ctx.session.lang = newLang;
    const t = dict(newLang);
    await ctx.answerCbQuery();
    await ctx.editMessageText(t.languageSaved);
    // Show the welcome + lead-request menu in the chosen language.
    await ctx.reply(
      `${t.welcomeTitle}\n\n${t.welcomeText}`,
      {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          keyboard: [[{ text: t.leadButton }]],
          resize_keyboard: true,
        },
      },
    );
  });

  // "📋 Lead" button — works for all three localized labels.
  bot.hears(
    [dict('ru').leadButton, dict('uz').leadButton, dict('en').leadButton],
    (ctx) => ctx.scene.enter('lead'),
  );

  bot.command('request', (ctx) => ctx.scene.enter('lead'));

  // Operator clicks "📞 Взять в работу" on a lead notification.
  // The button comes from the API; we just relay the click to the API,
  // which updates the lead and edits all sent notification copies.
  bot.action(/^claim:([0-9a-f-]{36})$/i, async (ctx) => {
    const leadId = ctx.match[1];
    const apiUrl = process.env.API_BASE_URL ?? 'http://localhost:3001';

    const fullName =
      [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(' ').trim() ||
      ctx.from?.username ||
      `id:${ctx.from?.id ?? '?'}`;

    try {
      const res = await fetch(`${apiUrl}/leads/${leadId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: String(ctx.from?.id ?? ''),
          name: fullName,
          username: ctx.from?.username,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reason?: string;
        claimedByName?: string;
      };

      if (res.ok && data.ok) {
        await ctx.answerCbQuery('✅ Заявка ваша');
      } else if (data.reason === 'already_claimed') {
        await ctx.answerCbQuery(
          `Уже взято: ${data.claimedByName ?? 'другим оператором'}`,
          { show_alert: true },
        );
      } else {
        await ctx.answerCbQuery('❌ Ошибка');
      }
    } catch (err) {
      console.error('[bot] claim failed:', err);
      await ctx.answerCbQuery('❌ Ошибка сети');
    }
  });

  return bot;
}
