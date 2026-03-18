import { Injectable, Logger } from '@nestjs/common';
import { IAccountLockedNotifyEvent } from '@app/shared';
import { IAuthNotificationTemplatePort } from '../../domain/ports/auth-notification-template.port';
import { IEmailSenderPort } from '../../domain/ports/email-sender.port';
import { INotificationAuditLogPort } from '../../domain/ports/notification-audit-log.port';

@Injectable()
export class HandleAccountLockedNotifyUseCase {
  private readonly logger = new Logger(HandleAccountLockedNotifyUseCase.name);

  constructor(
    private readonly authNotificationTemplatePort: IAuthNotificationTemplatePort,
    private readonly emailSender: IEmailSenderPort,
    private readonly notificationAuditLogPort: INotificationAuditLogPort,
  ) {}

  async execute(payload: IAccountLockedNotifyEvent): Promise<void> {
    const { email } = payload;

    const { title, content } = this.authNotificationTemplatePort.getAccountLockedMessage(payload);
    const timestamp = new Date().toISOString();

    const result = await this.emailSender.send({
      to: email,
      subject: title,
      html: content,
    });

    if (!result.success) {
      await this.notificationAuditLogPort.log({
        data: email,
        action: 'ACCOUNT_LOCKED_NOTIFIED',
        timestamp,
        details: { email, error: result.error },
      });
    } else {
      await this.notificationAuditLogPort.log({
        data: email,
        action: 'ACCOUNT_LOCKED_NOTIFIED_FAILED',
        timestamp,
        details: { email },
      });
    }
  }
}
