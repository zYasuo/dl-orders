import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessDueCartAbandonmentRemindersUseCase } from '../../../application/use-cases/process-due-cart-abandonment-reminders.use-case';

@Injectable()
export class CartAbandonmentCronService {
  private readonly logger = new Logger(CartAbandonmentCronService.name);

  constructor(private readonly processDue: ProcessDueCartAbandonmentRemindersUseCase) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    try {
      await this.processDue.execute();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn('Cart abandonment cron error', { message });
    }
  }
}
