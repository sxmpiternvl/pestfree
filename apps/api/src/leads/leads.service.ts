import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService, type NotifMessage } from '../notifications/telegram.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ClaimLeadDto } from './dto/claim-lead.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramService,
  ) {}

  async create(dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        address: dto.address ?? null,
        service: dto.service ?? null,
        objectType: dto.objectType ?? null,
        comment: dto.comment ?? null,
        source: dto.source,
        locale: dto.locale ?? null,
      },
    });

    this.logger.log(`Lead created: ${lead.id} (${lead.source}, ${lead.phone})`);

    // Send notifications and persist the resulting (chatId, messageId) tuples
    // so we can edit them later when the lead is claimed.
    void this.notifyAndPersist(lead.id, lead);

    return { id: lead.id, ok: true as const };
  }

  private async notifyAndPersist(leadId: string, lead: Prisma.LeadGetPayload<{}>): Promise<void> {
    try {
      const sent = await this.telegram.sendLeadNotification(lead);
      if (sent.length > 0) {
        await this.prisma.lead.update({
          where: { id: leadId },
          data: { notifMessages: sent as unknown as Prisma.InputJsonValue },
        });
      }
    } catch (err) {
      this.logger.error(`notify failed: ${(err as Error).message}`);
    }
  }

  /**
   * Atomic claim: first operator wins. If already claimed, return the existing
   * claim info without touching the DB.
   */
  async claim(leadId: string, dto: ClaimLeadDto) {
    const existing = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!existing) throw new NotFoundException(`Lead ${leadId} not found`);

    if (existing.claimedById) {
      return {
        ok: false as const,
        reason: 'already_claimed' as const,
        claimedById: existing.claimedById,
        claimedByName: existing.claimedByName,
        claimedAt: existing.claimedAt,
      };
    }

    try {
      // Atomic check-and-set: update only if `claimedById` is still null.
      const updated = await this.prisma.lead.update({
        where: { id: leadId, claimedById: null },
        data: {
          status: 'CONTACTED',
          claimedAt: new Date(),
          claimedById: dto.telegramId,
          claimedByName: dto.name,
        },
      });

      // Edit all sent notification copies in parallel.
      const messages = (updated.notifMessages ?? []) as unknown as NotifMessage[];
      await this.telegram.editLeadMessages(updated, messages, {
        name: dto.name,
        at: updated.claimedAt ?? new Date(),
      });

      this.logger.log(`Lead claimed: ${updated.id} by ${dto.telegramId} (${dto.name})`);

      return {
        ok: true as const,
        claimedById: updated.claimedById,
        claimedByName: updated.claimedByName,
        claimedAt: updated.claimedAt,
      };
    } catch (err) {
      // P2025 = update matched no rows → someone else claimed between our read and write
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        const current = await this.prisma.lead.findUnique({ where: { id: leadId } });
        return {
          ok: false as const,
          reason: 'already_claimed' as const,
          claimedById: current?.claimedById,
          claimedByName: current?.claimedByName,
          claimedAt: current?.claimedAt,
        };
      }
      throw err;
    }
  }
}
