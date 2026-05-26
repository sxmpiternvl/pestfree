import { Markup, Scenes } from 'telegraf';
import { dict, SERVICES, type ServiceKey } from '../i18n';
import type { BotContext } from '../types';

function lead(ctx: BotContext): NonNullable<BotContext['scene']['session']['lead']> {
  return ctx.scene.session.lead;
}

function tFor(ctx: BotContext) {
  return dict(ctx.session.lang);
}

// Build the inline keyboard with all 6 services (2 columns).
function serviceKeyboard(ctx: BotContext) {
  const t = tFor(ctx);
  const rows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 0; i < SERVICES.length; i += 2) {
    const row = SERVICES.slice(i, i + 2).map((s) => {
      const svc = t.services[s];
      return Markup.button.callback(`${svc.icon} ${svc.label}`, `svc:${s}`);
    });
    rows.push(row);
  }
  return Markup.inlineKeyboard(rows);
}

function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) return trimmed;
  // Telegram's contact.phone_number is usually digits-only like "998901234567"
  if (/^\d+$/.test(trimmed)) return `+${trimmed}`;
  return trimmed;
}

export const leadScene = new Scenes.WizardScene<BotContext>(
  'lead',

  // Step 0 — show service keyboard.
  async (ctx) => {
    ctx.scene.session.lead = {};
    const t = tFor(ctx);
    await ctx.reply(t.chooseService, serviceKeyboard(ctx));
    return ctx.wizard.next();
  },

  // Step 1 — handle service selection.
  async (ctx) => {
    const t = tFor(ctx);
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply(t.pleasePickService);
      return;
    }
    const data = ctx.callbackQuery.data;
    if (!data.startsWith('svc:')) {
      await ctx.reply(t.pleasePickService);
      return;
    }
    const service = data.slice(4) as ServiceKey;
    if (!(service in t.services)) {
      await ctx.reply(t.pleasePickService);
      return;
    }
    const svc = t.services[service];
    lead(ctx).service = service;
    lead(ctx).serviceLabel = svc.label;
    await ctx.answerCbQuery();
    await ctx.reply(`${t.serviceChosen} ${svc.label}\n\n${t.askName}`);
    return ctx.wizard.next();
  },

  // Step 2 — full name → then prompt phone with share-contact button.
  async (ctx) => {
    const t = tFor(ctx);
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply(t.pleaseText);
      return;
    }
    const text = ctx.message.text.trim();
    if (text.length < 2) {
      await ctx.reply(t.nameTooShort);
      return;
    }
    lead(ctx).fullName = text;
    await ctx.reply(t.askPhone, {
      reply_markup: {
        keyboard: [[{ text: t.shareContactButton, request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return ctx.wizard.next();
  },

  // Step 3 — phone (either shared contact or typed text).
  async (ctx) => {
    const t = tFor(ctx);

    // Path A — user tapped "Share contact"
    if (ctx.message && 'contact' in ctx.message && ctx.message.contact) {
      const contact = ctx.message.contact;
      // Only accept the user's own contact (anti-spam: prevents sharing someone else's).
      if (contact.user_id && contact.user_id !== ctx.from?.id) {
        await ctx.reply(t.notOwnContact);
        return;
      }
      lead(ctx).phone = normalizePhone(contact.phone_number);
      lead(ctx).phoneVerified = true;
    }
    // Path B — user typed a phone number.
    else if (ctx.message && 'text' in ctx.message) {
      const text = ctx.message.text.trim();
      if (text.replace(/\D/g, '').length < 7) {
        await ctx.reply(t.phoneInvalid);
        return;
      }
      lead(ctx).phone = text;
      lead(ctx).phoneVerified = false;
    } else {
      await ctx.reply(t.pleaseText);
      return;
    }

    // Move to extra phone — replace the share-contact keyboard with one that
    // has a single "Skip" button. Same message handles both: tap Skip or type.
    await ctx.reply(t.askPhoneExtra, {
      reply_markup: {
        keyboard: [[{ text: t.skipButton }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return ctx.wizard.next();
  },

  // Step 4 — optional extra phone (text or Skip via bottom keyboard).
  async (ctx) => {
    const t = tFor(ctx);

    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply(t.pleasePhoneOrSkip);
      return;
    }

    const text = ctx.message.text.trim();

    if (text === t.skipButton) {
      lead(ctx).phoneExtra = '';
    } else if (text.replace(/\D/g, '').length < 7) {
      await ctx.reply(t.phoneInvalid);
      return;
    } else {
      lead(ctx).phoneExtra = text;
    }

    // Address step has no keyboard — remove the Skip one.
    await ctx.reply(t.askAddress, { reply_markup: { remove_keyboard: true } });
    return ctx.wizard.next();
  },

  // Step 5 — address.
  async (ctx) => {
    const t = tFor(ctx);
    if (!ctx.message || !('text' in ctx.message)) {
      await ctx.reply(t.pleaseText);
      return;
    }
    const text = ctx.message.text.trim();
    if (text.length < 5) {
      await ctx.reply(t.addressTooShort);
      return;
    }
    lead(ctx).address = text;
    await ctx.reply(
      t.askComment,
      Markup.inlineKeyboard([[Markup.button.callback(t.skipButton, 'skip_comment')]]),
    );
    return ctx.wizard.next();
  },

  // Step 6 — optional comment → review.
  async (ctx) => {
    const t = tFor(ctx);
    if (
      ctx.callbackQuery &&
      'data' in ctx.callbackQuery &&
      ctx.callbackQuery.data === 'skip_comment'
    ) {
      lead(ctx).comment = '';
      await ctx.answerCbQuery();
    } else if (ctx.message && 'text' in ctx.message) {
      lead(ctx).comment = ctx.message.text.trim();
    } else {
      await ctx.reply(t.pleaseCommentOrSkip);
      return;
    }

    const l = lead(ctx);
    const phoneLine = l.phoneVerified
      ? `${t.rPhone} ${escMd(l.phone ?? '')} _\\(${escMd(t.rPhoneVerifiedTag)}\\)_`
      : `${t.rPhone} ${escMd(l.phone ?? '')}`;

    const lines = [
      `${t.rService} ${escMd(l.serviceLabel ?? '')}`,
      `${t.rName} ${escMd(l.fullName ?? '')}`,
      phoneLine,
    ];
    if (l.phoneExtra) {
      lines.push(`${t.rPhoneExtra} ${escMd(l.phoneExtra)}`);
    }
    lines.push(`${t.rAddress} ${escMd(l.address ?? '')}`);
    lines.push(`${t.rComment} ${escMd(l.comment || t.rNotSet)}`);

    await ctx.reply(
      `${escMd(t.reviewTitle)}\n\n${lines.join('\n')}`,
      {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(t.submitButton, 'confirm'),
            Markup.button.callback(t.cancelButton, 'cancel'),
          ],
        ]),
      },
    );
    return ctx.wizard.next();
  },

  // Step 7 — confirm and submit.
  async (ctx) => {
    const t = tFor(ctx);
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      await ctx.reply(t.pleasePickConfirm);
      return;
    }

    await ctx.answerCbQuery();

    if (ctx.callbackQuery.data === 'cancel') {
      await ctx.reply(t.cancelled);
      return ctx.scene.leave();
    }

    if (ctx.callbackQuery.data !== 'confirm') return;

    const l = lead(ctx);
    const apiUrl = process.env.API_BASE_URL ?? 'http://localhost:3001';

    // Stuff extra phone + verified tag into the comment for the operator.
    // The API schema has only one `phone` field — we keep it clean for click-to-call.
    const annotations: string[] = [];
    if (l.phoneVerified) annotations.push(`(${t.rPhoneVerifiedTag.replace(/[_*]/g, '')})`);
    if (l.phoneExtra) annotations.push(`${t.rPhoneExtra.replace(/[_*:]/g, '').trim()}: ${l.phoneExtra}`);

    const commentParts = [
      ...annotations.map((a) => `[${a}]`),
      l.comment || '',
    ].filter(Boolean);

    try {
      const res = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: l.fullName,
          phone: l.phone,
          address: l.address,
          service: l.service,
          comment: commentParts.length ? commentParts.join('\n') : null,
          source: 'TELEGRAM',
          locale: ctx.session.lang ?? 'ru',
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API ${res.status}: ${body}`);
      }

      await ctx.reply(t.accepted);
      // Owner notification is sent by the API.
    } catch (err) {
      console.error('[bot] failed to submit lead:', err);
      await ctx.reply(t.apiError);
    }

    return ctx.scene.leave();
  },
);

leadScene.command('cancel', async (ctx) => {
  await ctx.reply(tFor(ctx).cancelled);
  return ctx.scene.leave();
});

// Escape special chars for MarkdownV2.
function escMd(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&');
}
