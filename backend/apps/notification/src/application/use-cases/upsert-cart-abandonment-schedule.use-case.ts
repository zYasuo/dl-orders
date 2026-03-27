import { Injectable } from '@nestjs/common';
import type { TCartAbandonmentUpsert } from '../dto/cart-abandonment-upsert.schema';
import { CartAbandonmentScheduleRepositoryPort } from '../../domain/ports/cart-abandonment-schedule-repository.port';

@Injectable()
export class UpsertCartAbandonmentScheduleUseCase {
  constructor(private readonly repo: CartAbandonmentScheduleRepositoryPort) {}

  async execute(input: TCartAbandonmentUpsert): Promise<void> {
    const pendingUntil = new Date(input.pendingUntil);
    if (Number.isNaN(pendingUntil.getTime())) {
      return;
    }
    await this.repo.upsert({
      sessionKey: input.sessionKey,
      email: input.email,
      resumeUrl: input.resumeUrl,
      pendingUntil,
      summaryLines: input.summaryLines,
      sent: false,
      failCount: 0,
    });
  }
}
