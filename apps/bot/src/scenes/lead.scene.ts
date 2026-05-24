import { Markup, Scenes } from 'telegraf';
import type { BotContext } from '../types';

const SERVICE_MAP: Record<string, string> = {
  DISINFECTION: 'Дезинфекция',
  DISINSECTION: 'Дезинсекция',
  DERATIZATION: 'Дератизация',
};

function lead(ctx: BotContext): NonNullable<BotContext['scene']['session']['lead']> {
  return ctx.scene.session.lead;
}

export const leadScene = new Scenes.WizardScene<BotContext>(
  'lead',

  // Step 0 — enter: show service keyboard
  async (ctx) => {
    ctx.scene.session.lead = {};
    await ctx.reply(
      'Выберите тип услуги:',
      Markup.inlineKeyboard([
        [Markup.button.callback('🦠 Дезинфекция', 'svc:DISINFECTION')],
        [Markup.button.callback('🪲 Дезинсекция', 'svc:DISINSECTION')],
        [Markup.button.callback('🐀 Дератизация', 'svc:DERATIZATION')],
      ]),
    );
    return ctx.wizard.next();
  },

  // Step 1 — handle service selection
  async (ctx) => {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply('Пожалуйста, выберите услугу из списка выше.');
      return;
    }
    const { data } = ctx.callbackQuery;
    if (!data.startsWith('svc:')) {
      await ctx.reply('Пожалуйста, выберите услугу из списка выше.');
      return;
    }
    const service = data.slice(4);
    lead(ctx).service = service;
    lead(ctx).serviceLabel = SERVICE_MAP[service];
    await ctx.answerCbQuery();
    await ctx.reply(`✅ Выбрано: ${SERVICE_MAP[service]}\n\nВведите ваше ФИО:`);
    return ctx.wizard.next();
  },

  // Step 2 — full name
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Пожалуйста, введите ваше ФИО текстом.');
      return;
    }
    const text = ctx.message.text.trim();
    if (text.length < 2) {
      await ctx.reply('ФИО слишком короткое. Введите полное имя:');
      return;
    }
    lead(ctx).fullName = text;
    await ctx.reply('Введите ваш номер телефона:');
    return ctx.wizard.next();
  },

  // Step 3 — phone
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Пожалуйста, введите номер телефона текстом.');
      return;
    }
    const text = ctx.message.text.trim();
    if (!/\d{7,}/.test(text.replace(/\D/g, ''))) {
      await ctx.reply('Номер телефона должен содержать не менее 7 цифр. Попробуйте ещё раз:');
      return;
    }
    lead(ctx).phone = text;
    await ctx.reply('Введите адрес (город, улица, дом):');
    return ctx.wizard.next();
  },

  // Step 4 — address
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply('Пожалуйста, введите адрес текстом.');
      return;
    }
    const text = ctx.message.text.trim();
    if (text.length < 5) {
      await ctx.reply('Адрес слишком короткий. Пожалуйста, уточните:');
      return;
    }
    lead(ctx).address = text;
    await ctx.reply(
      'Добавьте комментарий к заявке:',
      Markup.inlineKeyboard([[Markup.button.callback('Пропустить', 'skip')]]),
    );
    return ctx.wizard.next();
  },

  // Step 5 — comment (optional)
  async (ctx) => {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery && ctx.callbackQuery.data === 'skip') {
      lead(ctx).comment = '';
      await ctx.answerCbQuery();
    } else if (ctx.message && 'text' in ctx.message) {
      lead(ctx).comment = ctx.message.text.trim();
    } else {
      await ctx.reply('Пожалуйста, введите комментарий или нажмите «Пропустить».');
      return;
    }

    const l = lead(ctx);
    const lines = [
      `📋 *Услуга:* ${escMd(l.serviceLabel ?? '')}`,
      `👤 *ФИО:* ${escMd(l.fullName ?? '')}`,
      `📱 *Телефон:* ${escMd(l.phone ?? '')}`,
      `📍 *Адрес:* ${escMd(l.address ?? '')}`,
      `💬 *Комментарий:* ${escMd(l.comment || 'не указан')}`,
    ].join('\n');

    await ctx.reply(
      `Проверьте данные заявки:\n\n${lines}`,
      {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback('✅ Отправить', 'confirm'),
            Markup.button.callback('❌ Отменить', 'cancel'),
          ],
        ]),
      },
    );
    return ctx.wizard.next();
  },

  // Step 6 — confirm and submit
  async (ctx) => {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply('Нажмите «Отправить» или «Отменить».');
      return;
    }

    await ctx.answerCbQuery();

    if (ctx.callbackQuery.data === 'cancel') {
      await ctx.reply('Заявка отменена. Нажмите /start, чтобы начать заново.');
      return ctx.scene.leave();
    }

    if (ctx.callbackQuery.data !== 'confirm') return;

    const l = lead(ctx);
    const apiUrl = process.env.API_BASE_URL ?? 'http://localhost:3001';

    try {
      const res = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: l.fullName,
          phone: l.phone,
          address: l.address,
          service: l.service,
          comment: l.comment || null,
          source: 'TELEGRAM',
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API ${res.status}: ${body}`);
      }

      await ctx.reply('✅ Заявка принята! Мы свяжемся с вами в ближайшее время.');
      await notifyOwner(ctx, l);
    } catch (err) {
      console.error('[bot] failed to submit lead:', err);
      await ctx.reply('❌ Ошибка при отправке заявки. Попробуйте позже или свяжитесь с нами напрямую.');
    }

    return ctx.scene.leave();
  },
);

leadScene.command('cancel', async (ctx) => {
  await ctx.reply('Заявка отменена. Нажмите /start, чтобы начать заново.');
  return ctx.scene.leave();
});

async function notifyOwner(
  ctx: BotContext,
  l: ReturnType<typeof lead>,
): Promise<void> {
  const ownerChatId = process.env.OWNER_CHAT_ID;
  if (!ownerChatId) return;

  const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

  const text = [
    '🆕 *Новая заявка*',
    '',
    `📋 *Услуга:* ${escMd(l.serviceLabel ?? '')}`,
    `👤 *ФИО:* ${escMd(l.fullName ?? '')}`,
    `📱 *Телефон:* ${escMd(l.phone ?? '')}`,
    `📍 *Адрес:* ${escMd(l.address ?? '')}`,
    `💬 *Комментарий:* ${escMd(l.comment || 'не указан')}`,
    `📡 *Источник:* Telegram`,
    `🕒 *Время:* ${escMd(now)}`,
  ].join('\n');

  await ctx.telegram.sendMessage(ownerChatId, text, { parse_mode: 'MarkdownV2' });
}

// Escape special chars for MarkdownV2
function escMd(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&');
}
