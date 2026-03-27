import { Injectable } from '@nestjs/common';
import { DbService } from '../../../db/db.service';
import {
  CartAbandonmentScheduleRecord,
  CartAbandonmentScheduleRepositoryPort,
} from '../../../../domain/ports/cart-abandonment-schedule-repository.port';

@Injectable()
export class CartAbandonmentScheduleRepository extends CartAbandonmentScheduleRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async upsert(input: CartAbandonmentScheduleRecord): Promise<void> {
    await this.db.cartAbandonmentSchedule.upsert({
      where: { sessionKey: input.sessionKey },
      create: {
        sessionKey: input.sessionKey,
        email: input.email,
        resumeUrl: input.resumeUrl,
        pendingUntil: input.pendingUntil,
        summaryLines: input.summaryLines,
        sent: false,
        failCount: 0,
      },
      update: {
        email: input.email,
        resumeUrl: input.resumeUrl,
        pendingUntil: input.pendingUntil,
        summaryLines: input.summaryLines,
        sent: false,
        failCount: 0,
      },
    });
  }

  async deleteBySessionKey(sessionKey: string): Promise<void> {
    await this.db.cartAbandonmentSchedule.deleteMany({ where: { sessionKey } });
  }

  async findDue(before: Date): Promise<CartAbandonmentScheduleRecord[]> {
    const rows = await this.db.cartAbandonmentSchedule.findMany({
      where: {
        sent: false,
        pendingUntil: { lte: before },
      },
    });
    return rows.map((row) => ({
      sessionKey: row.sessionKey,
      email: row.email,
      resumeUrl: row.resumeUrl,
      pendingUntil: row.pendingUntil,
      summaryLines: row.summaryLines,
      sent: row.sent,
      failCount: row.failCount,
    }));
  }

  async markSent(sessionKey: string): Promise<void> {
    await this.db.cartAbandonmentSchedule.update({
      where: { sessionKey },
      data: { sent: true },
    });
  }

  async incrementFailCount(sessionKey: string): Promise<number> {
    const updated = await this.db.cartAbandonmentSchedule.update({
      where: { sessionKey },
      data: { failCount: { increment: 1 } },
    });
    return updated.failCount;
  }
}
