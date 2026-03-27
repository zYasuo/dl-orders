import { Injectable, Logger } from '@nestjs/common';
import { CartAbandonmentScheduleRepositoryPort } from '../../domain/ports/cart-abandonment-schedule-repository.port';
import { CartAbandonmentEmailTemplatePort } from '../../domain/ports/cart-abandonment-email-template.port';
import { EmailSenderPort } from '../../domain/ports/email-sender.port';

@Injectable()
export class ProcessDueCartAbandonmentRemindersUseCase {
  private readonly logger = new Logger(ProcessDueCartAbandonmentRemindersUseCase.name);
  private readonly maxFails = 3;

  constructor(
    private readonly repo: CartAbandonmentScheduleRepositoryPort,
    private readonly template: CartAbandonmentEmailTemplatePort,
    private readonly emailSender: EmailSenderPort,
  ) {}

  async execute(): Promise<void> {
    const now = new Date();
    const due = await this.repo.findDue(now);
    for (const row of due) {
      try {
        const { subject, html } = this.template.buildReminderEmail({
          resumeUrl: row.resumeUrl,
          summaryLines: row.summaryLines,
        });
        const result = await this.emailSender.send({
          to: row.email,
          subject,
          html,
        });
        if (result.success) {
          await this.repo.markSent(row.sessionKey);
        } else {
          await this.handleFailure(row.sessionKey, result.error);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn('Cart abandonment reminder failed', { sessionKey: row.sessionKey, message });
        await this.handleFailure(row.sessionKey, message);
      }
    }
  }

  private async handleFailure(sessionKey: string, error?: string): Promise<void> {
    this.logger.warn('Cart abandonment email not sent', { sessionKey, error });
    const fails = await this.repo.incrementFailCount(sessionKey);
    if (fails >= this.maxFails) {
      await this.repo.markSent(sessionKey);
    }
  }
}
