import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Lead } from '@prisma/client';

const SERVICE_LABEL: Record<string, string> = {
  DISINFECTION: 'Дезинфекция',
  DISINSECTION: 'Дезинсекция',
  DERATIZATION: 'Дератизация',
  OUTDOOR: 'Обработка участка',
  CHLORINE: 'Хлорка',
  SUBSCRIPTION: 'Абонентское',
};

const OBJECT_LABEL: Record<string, string> = {
  APARTMENT: 'Квартира',
  HOUSE: 'Частный дом',
  BUSINESS: 'Бизнес-объект',
  OTHER: 'Другое',
};

const SOURCE_LABEL: Record<string, string> = {
  WEBSITE: 'Сайт',
  TELEGRAM: 'Telegram',
};

export interface NotifMessage {
  chatId: string;
  messageId: number;
}

interface ClaimInfo {
  name: string;
  at: Date;
}

// Escape special characters for Telegram MarkdownV2
function escMd(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, '\\$&');
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly config: ConfigService) {}

  // Comma-separated list — each id gets its own copy of the message.
  private getRecipients(): string[] {
    const raw = this.config.get<string>('OWNER_CHAT_ID') ?? '';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private getToken(): string | undefined {
    return this.config.get<string>('BOT_TOKEN');
  }

  /**
   * Send a "new lead" notification to every owner-chat.
   * Returns the (chatId, messageId) pairs of successful sends so the caller
   * can persist them and edit the messages later when the lead is claimed.
   */
  async sendLeadNotification(lead: Lead): Promise<NotifMessage[]> {
    const token = this.getToken();
    const recipients = this.getRecipients();

    if (!token || recipients.length === 0) {
      this.logger.warn('Telegram notification skipped — BOT_TOKEN or OWNER_CHAT_ID not set');
      return [];
    }

    const text = this.formatLead(lead);
    const replyMarkup = this.claimButton(lead.id);

    const results = await Promise.allSettled(
      recipients.map(async (chatId) => {
        const messageId = await this.sendMessage(token, chatId, text, replyMarkup);
        return { chatId, messageId };
      }),
    );

    const sent: NotifMessage[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        sent.push(r.value);
      } else {
        this.logger.error(
          `Failed to notify ${recipients[i]}: ${(r.reason as Error).message}`,
        );
      }
    });

    return sent;
  }

  /**
   * Edit all previously-sent notification copies of one lead — used after a claim.
   * Replaces the text with a "claimed" variant and drops the inline keyboard.
   */
  async editLeadMessages(
    lead: Lead,
    messages: NotifMessage[],
    claim: ClaimInfo,
  ): Promise<void> {
    const token = this.getToken();
    if (!token || messages.length === 0) return;

    const text = this.formatLead(lead, claim);

    await Promise.allSettled(
      messages.map((m) => this.editMessage(token, m.chatId, m.messageId, text)),
    );
  }

  // ── Telegram API wrappers ──────────────────────────────────────────────

  private async sendMessage(
    token: string,
    chatId: string,
    text: string,
    replyMarkup?: unknown,
  ): Promise<number> {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram API ${res.status}: ${body}`);
    }
    const data = (await res.json()) as { ok: boolean; result: { message_id: number } };
    return data.result.message_id;
  }

  private async editMessage(
    token: string,
    chatId: string,
    messageId: number,
    text: string,
  ): Promise<void> {
    const res = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'MarkdownV2',
        // No reply_markup → existing keyboard is removed by Telegram on edit.
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      this.logger.warn(
        `editMessageText failed for ${chatId}/${messageId}: ${res.status} ${body}`,
      );
    }
  }

  // ── Formatting ────────────────────────────────────────────────────────

  private claimButton(leadId: string) {
    return {
      inline_keyboard: [
        [{ text: '📞 Взять в работу', callback_data: `claim:${leadId}` }],
      ],
    };
  }

  private formatLead(lead: Lead, claim?: ClaimInfo): string {
    const now = new Date(lead.createdAt).toLocaleString('ru-RU', {
      timeZone: 'Asia/Tashkent',
    });

    const lines = [
      claim ? '✅ *Заявка взята в работу*' : '🆕 *Новая заявка*',
      '',
      `👤 *ФИО:* ${escMd(lead.fullName)}`,
      `📱 *Телефон:* ${escMd(lead.phone)}`,
    ];

    if (lead.objectType) {
      lines.push(`🏠 *Объект:* ${escMd(OBJECT_LABEL[lead.objectType] ?? lead.objectType)}`);
    }
    if (lead.service) {
      lines.push(`🛠 *Услуга:* ${escMd(SERVICE_LABEL[lead.service] ?? lead.service)}`);
    }
    if (lead.address) {
      lines.push(`📍 *Адрес:* ${escMd(lead.address)}`);
    }
    if (lead.comment) {
      lines.push(`💬 *Комментарий:* ${escMd(lead.comment)}`);
    }
    lines.push('');
    lines.push(`📡 *Источник:* ${escMd(SOURCE_LABEL[lead.source] ?? lead.source)}`);
    lines.push(`🕒 *Время:* ${escMd(now)}`);
    lines.push(`🆔 \`${escMd(lead.id)}\``);

    if (claim) {
      const at = claim.at.toLocaleString('ru-RU', {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
      });
      lines.push('');
      lines.push(`✅ *Взято:* ${escMd(claim.name)} · ${escMd(at)}`);
    }

    return lines.join('\n');
  }
}
