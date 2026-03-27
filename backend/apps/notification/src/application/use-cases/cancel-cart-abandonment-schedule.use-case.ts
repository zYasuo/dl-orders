import { Injectable } from '@nestjs/common';
import { CartAbandonmentScheduleRepositoryPort } from '../../domain/ports/cart-abandonment-schedule-repository.port';

@Injectable()
export class CancelCartAbandonmentScheduleUseCase {
  constructor(private readonly repo: CartAbandonmentScheduleRepositoryPort) {}

  async execute(sessionKey: string): Promise<void> {
    await this.repo.deleteBySessionKey(sessionKey);
  }
}
