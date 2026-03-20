import { Injectable } from '@nestjs/common';
import { IResetPasswordRequestEvent } from '@app/shared';
import { AuthNotificationTemplatePort } from '../../domain/ports/auth-notification-template.port';
import { EmailSenderPort } from '../../domain/ports/email-sender.port';
import { NotificationAuditLogPort } from '../../domain/ports/notification-audit-log.port';

@Injectable()
export class HandleResetPasswordUseCase {
  constructor(
    private readonly authNotificationTemplatePort: AuthNotificationTemplatePort,
    private readonly emailSender: EmailSenderPort,
    private readonly notificationAuditLogPort: NotificationAuditLogPort,
  ) {}

  async execute(payload: IResetPasswordRequestEvent): Promise<void> {
    const { email, linkResetPassword, expiresAt } = payload;

    const { title, content } = this.authNotificationTemplatePort.getResetPasswordRequestMessage({
      email,
      linkResetPassword,
      expiresAt,
    });
    const timestamp = new Date().toISOString();

    const result = await this.emailSender.send({
      to: email,
      subject: title,
      html: content,
    });

    if (result.success) {
      await this.notificationAuditLogPort.log({
        data: email,
        action: 'RESET_PASSWORD_REQUESTED',
        timestamp,
        details: { email },
      });
    } else {
      await this.notificationAuditLogPort.log({
        data: email,
        action: 'RESET_PASSWORD_REQUESTED_FAILED',
        timestamp,
        details: { email, error: result.error },
      });
    }
  }
}
